import path from "node:path";
import dotenv from "dotenv";
import { Contract, ethers } from "ethers";
import { prisma } from "@physical/db";
import physicalAscArtifact from "../../../packages/contracts/artifacts/contracts/creditcoin/PhysicalASC.sol/PhysicalASC.json";
import { generateProofFor, computeGasLimitForAsc, submitVerification } from "./proof";
import { evaluateJobsForEvent } from "./coordination";

dotenv.config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });

const POLL_INTERVAL_MS = 30_000;
const SEPOLIA_CHAIN_KEY = 1;
// PhysicalActions.RecordVerifiedEvent in PhysicalASC.sol
const RECORD_VERIFIED_EVENT_ACTION = 0;

function isAlreadyProcessedError(err: unknown): boolean {
  const text = JSON.stringify(err, Object.getOwnPropertyNames(err ?? {})).toLowerCase();
  return text.includes("already processed");
}

interface PendingEvent {
  id: string;
  parameter: string;
  normalizedValue: number;
  sourceSubmission: { id: string; sepoliaTxHash: string } | null;
}

async function processEvent(
  event: PendingEvent,
  ccProvider: ethers.JsonRpcProvider,
  sepoliaProvider: ethers.JsonRpcProvider,
  ascContract: Contract,
  wallet: ethers.Wallet,
  proofBuilderUrl: string
) {
  if (!event.sourceSubmission) return;
  const submissionTxHash = event.sourceSubmission.sepoliaTxHash;

  console.log(`[worker-oracle] processing event ${event.id}, tx ${submissionTxHash}`);
  await prisma.event.update({ where: { id: event.id }, data: { status: "AWAITING_ATTESTATION" } });

  let proofResult;
  try {
    proofResult = await generateProofFor(
      submissionTxHash,
      SEPOLIA_CHAIN_KEY,
      proofBuilderUrl,
      ccProvider,
      sepoliaProvider
    );
  } catch (err) {
    console.error(`[worker-oracle] proof generation failed for event ${event.id}:`, err);
    await prisma.event.update({ where: { id: event.id }, data: { status: "VERIFICATION_FAILED" } });
    return;
  }

  if (!proofResult.success || !proofResult.data) {
    console.error(`[worker-oracle] proof generation unsuccessful for event ${event.id}: ${proofResult.error}`);
    await prisma.event.update({ where: { id: event.id }, data: { status: "VERIFICATION_FAILED" } });
    return;
  }

  await prisma.attestation.upsert({
    where: { sourceSubmissionId: event.sourceSubmission.id },
    update: { attestedAt: new Date() },
    create: { sourceSubmissionId: event.sourceSubmission.id, attestedAt: new Date() },
  });
  await prisma.event.update({ where: { id: event.id }, data: { status: "PROOF_READY" } });

  const proofData = proofResult.data;

  try {
    const gasLimit = await computeGasLimitForAsc(
      ccProvider,
      ascContract,
      proofData,
      wallet.address,
      RECORD_VERIFIED_EVENT_ACTION
    );
    const tx = await submitVerification(ascContract, proofData, RECORD_VERIFIED_EVENT_ACTION, gasLimit);
    console.log(`[worker-oracle] verification tx submitted for event ${event.id}: ${tx.hash}`);

    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Verification transaction failed");

    const attestation = await prisma.attestation.findUnique({
      where: { sourceSubmissionId: event.sourceSubmission.id },
    });
    if (attestation) {
      await prisma.verification.create({
        data: {
          attestationId: attestation.id,
          creditcoinTxHash: receipt.hash,
          precompileResult: true,
        },
      });
    }

    await prisma.event.update({ where: { id: event.id }, data: { status: "VERIFIED" } });
    console.log(`[worker-oracle] event ${event.id} VERIFIED — tx ${receipt.hash}`);

    await evaluateJobsForEvent(event.id, event.parameter, event.normalizedValue, ccProvider, wallet);
  } catch (err) {
    // The contract's replay-protection guard rejects re-processing an event
    // that already succeeded (e.g. after a manual status reset for retesting).
    // That's not a real failure — the event genuinely is verified. Recover
    // status from any existing Verification record instead of marking failed.
    if (isAlreadyProcessedError(err)) {
      const existing = await prisma.attestation
        .findUnique({
          where: { sourceSubmissionId: event.sourceSubmission.id },
          include: { verification: true },
        })
        .then((a) => a?.verification ?? null);

      if (existing) {
        await prisma.event.update({ where: { id: event.id }, data: { status: "VERIFIED" } });
        console.log(
          `[worker-oracle] event ${event.id} was already verified (tx ${existing.creditcoinTxHash}) — status recovered, not a failure`
        );
        await evaluateJobsForEvent(event.id, event.parameter, event.normalizedValue, ccProvider, wallet);
        return;
      }
    }

    console.error(`[worker-oracle] ASC verification call failed for event ${event.id}:`, err);
    await prisma.event.update({ where: { id: event.id }, data: { status: "VERIFICATION_FAILED" } });
  }
}

async function runOnce(
  ccProvider: ethers.JsonRpcProvider,
  sepoliaProvider: ethers.JsonRpcProvider,
  ascContract: Contract,
  wallet: ethers.Wallet,
  proofBuilderUrl: string
) {
  const pending = await prisma.event.findMany({
    where: { status: "SUBMITTED_SOURCE_CHAIN" },
    include: { sourceSubmission: true },
  });

  if (pending.length === 0) {
    console.log("[worker-oracle] no pending events");
    return;
  }

  console.log(`[worker-oracle] found ${pending.length} pending event(s)`);

  for (const event of pending) {
    await processEvent(event, ccProvider, sepoliaProvider, ascContract, wallet, proofBuilderUrl);
  }
}

async function main() {
  const proofBuilderUrl = process.env.PROOF_BUILDER_URL ?? "";
  const ccRpcUrl = process.env.CREDITCOIN_RPC_URL ?? "";
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL ?? "";
  const privateKey = process.env.CREDITCOIN_SUBMITTER_PRIVATE_KEY ?? "";
  const ascAddress = process.env.PHYSICAL_ASC_ADDRESS ?? "";

  if (!proofBuilderUrl) throw new Error("PROOF_BUILDER_URL is required");
  if (!ascAddress) throw new Error("PHYSICAL_ASC_ADDRESS is required");
  if (!privateKey) throw new Error("CREDITCOIN_SUBMITTER_PRIVATE_KEY is required");

  const ccProvider = new ethers.JsonRpcProvider(ccRpcUrl);
  const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const wallet = new ethers.Wallet(privateKey, ccProvider);
  const ascContract = new ethers.Contract(ascAddress, physicalAscArtifact.abi, wallet);

  console.log(`[worker-oracle] starting, polling every ${POLL_INTERVAL_MS / 1000}s`);

  const run = () =>
    runOnce(ccProvider, sepoliaProvider, ascContract, wallet, proofBuilderUrl).catch((err) =>
      console.error("[worker-oracle] run failed:", err)
    );

  await run();
  setInterval(run, POLL_INTERVAL_MS);
}

main();
