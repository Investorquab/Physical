import { ethers } from "ethers";
import { prisma } from "@physical/db";
import physicalSettlementArtifact from "../../../packages/contracts/artifacts/contracts/creditcoin/PhysicalSettlement.sol/PhysicalSettlement.json";

/** Deliberately tiny condition language for the hackathon MVP — one
 * parameter, one comparison. Extending to multi-condition rules is a
 * real P1, not something to fake here. */
interface SimpleCondition {
  parameter: string;
  operator: "gt" | "lt" | "gte" | "lte";
  value: number;
}

function evaluate(condition: SimpleCondition, actualValue: number): boolean {
  switch (condition.operator) {
    case "gt":
      return actualValue > condition.value;
    case "lt":
      return actualValue < condition.value;
    case "gte":
      return actualValue >= condition.value;
    case "lte":
      return actualValue <= condition.value;
    default:
      return false;
  }
}

export async function evaluateJobsForEvent(
  eventId: string,
  parameter: string,
  normalizedValue: number,
  ccProvider: ethers.JsonRpcProvider,
  wallet: ethers.Wallet
) {
  const settlementAddress = process.env.PHYSICAL_SETTLEMENT_ADDRESS;
  if (!settlementAddress) {
    console.warn("[coordination] PHYSICAL_SETTLEMENT_ADDRESS not set — skipping job evaluation");
    return;
  }

  const jobs = await prisma.job.findMany({ where: { isActive: true } });
  if (jobs.length === 0) return;

  const settlementContract = new ethers.Contract(
    settlementAddress,
    physicalSettlementArtifact.abi,
    wallet
  );

  for (const job of jobs) {
    const condition = job.conditionJson as unknown as SimpleCondition;
    if (condition.parameter !== parameter) continue;

    const matched = evaluate(condition, normalizedValue);
    console.log(
      `[coordination] job "${job.name}": ${parameter}=${normalizedValue} ${condition.operator} ${condition.value} → ${matched}`
    );

    const jobRun = await prisma.jobRun.create({
      data: {
        jobId: job.id,
        eventId,
        status: matched ? "TRIGGERED" : "NOT_MATCHED",
      },
    });

    if (!matched) continue;

    try {
      const eventIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(eventId));
      // jobId is a cuid string, not numeric — hash it to a uint256-compatible value.
      const jobIdNumeric = BigInt(ethers.keccak256(ethers.toUtf8Bytes(job.id))) % (2n ** 200n);
      const scaledValue = BigInt(Math.round(normalizedValue * 1000));

      const tx = await settlementContract.recordSettlement(eventIdBytes32, jobIdNumeric, scaledValue);
      console.log(`[coordination] settlement tx submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) throw new Error("Settlement transaction failed");

      const explorerUrl = `https://creditcoin-testnet.blockscout.com/tx/${receipt.hash}`;

      await prisma.settlement.create({
        data: {
          jobRunId: jobRun.id,
          creditcoinTxHash: receipt.hash,
          actionType: "record_settlement",
          amountOrState: `${normalizedValue}`,
          status: "CONFIRMED",
          explorerUrl,
        },
      });

      console.log(`[coordination] job "${job.name}" SETTLED — tx ${receipt.hash}`);
    } catch (err) {
      console.error(`[coordination] settlement failed for job "${job.name}":`, err);
      await prisma.jobRun.update({ where: { id: jobRun.id }, data: { status: "SETTLEMENT_FAILED" } });
    }
  }
}
