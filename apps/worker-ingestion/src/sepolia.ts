import { ethers } from "ethers";
import sourceEventRegistryArtifact from "../../../packages/contracts/artifacts/contracts/source/SourceEventRegistry.sol/SourceEventRegistry.json";

/** Fixed-point scaling factor for on-chain values. The chain only stores
 * integers (int256), so a float like 12.345 becomes 12345 on-chain with this
 * scale. Must stay consistent everywhere this value is read back (worker-oracle,
 * API, frontend) — defined once here as the source of truth. */
export const ON_CHAIN_VALUE_SCALE = 1000;

export interface SourceSubmissionResult {
  txHash: string;
  blockNumber: number;
}

export class SepoliaSubmitter {
  private readonly wallet: ethers.Wallet;
  private readonly contract: ethers.Contract;

  constructor(opts: { rpcUrl: string; privateKey: string; contractAddress: string }) {
    if (!opts.rpcUrl) throw new Error("SEPOLIA_RPC_URL is required");
    if (!opts.privateKey) throw new Error("SEPOLIA_SUBMITTER_PRIVATE_KEY is required");
    if (!opts.contractAddress) throw new Error("SOURCE_EVENT_REGISTRY_ADDRESS is required");

    const provider = new ethers.JsonRpcProvider(opts.rpcUrl);
    this.wallet = new ethers.Wallet(opts.privateKey, provider);
    this.contract = new ethers.Contract(
      opts.contractAddress,
      sourceEventRegistryArtifact.abi,
      this.wallet
    );
  }

  /** Deterministically derives the bytes32 eventId the contract and PhysicalASC
   * both key off of, from our own internal (string) event id. */
  static toEventId(internalEventId: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(internalEventId));
  }

  /** Hashes the raw provider payload for on-chain provenance. */
  static hashPayload(rawPayload: unknown): string {
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(rawPayload)));
  }

  async recordEvent(params: {
    internalEventId: string;
    rawPayload: unknown;
    value: number;
    observedAt: Date;
  }): Promise<SourceSubmissionResult> {
    const eventId = SepoliaSubmitter.toEventId(params.internalEventId);
    const payloadHash = SepoliaSubmitter.hashPayload(params.rawPayload);
    const scaledValue = BigInt(Math.round(params.value * ON_CHAIN_VALUE_SCALE));
    const observedAtUnix = BigInt(Math.floor(params.observedAt.getTime() / 1000));

    const tx = await this.contract.recordEvent(eventId, payloadHash, scaledValue, observedAtUnix);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Sepolia recordEvent transaction failed: ${tx.hash}`);
    }

    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  }
}
