import { Contract, ethers, JsonRpcApiProvider } from "ethers";
import { proofProvider, chainInfo } from "@gluwa/usc-sdk";

/** Waits for the given Sepolia transaction's block to be attested on
 * Creditcoin, then fetches the Merkle + continuity proof for it.
 * Adapted directly from gluwa/usc-testnet-bridge-examples/utils/index.ts
 * (generateProofFor), just renamed for our context. */
export async function generateProofFor(
  txHash: string,
  chainKey: number,
  proofBuilderUrl: string,
  creditcoinRpc: JsonRpcApiProvider,
  sourceChainRpc: JsonRpcApiProvider
): Promise<proofProvider.ProofResult> {
  const transaction = await sourceChainRpc.getTransaction(txHash);
  if (!transaction) throw new Error(`Transaction ${txHash} does not exist on source chain`);

  const blockNumber = transaction.blockNumber;
  if (!blockNumber) throw new Error(`Transaction ${txHash} is not yet mined`);

  const proofBuilder = new proofProvider.service.ProofBuilder(chainKey, proofBuilderUrl);
  const info = new chainInfo.PrecompileChainInfoProvider(creditcoinRpc);

  const latestAttested = await info.getLatestAttestedHeightAndHash(chainKey);
  console.log(`[worker-oracle] latest attested height for chainKey ${chainKey}: ${latestAttested.height}`);
  console.log(`[worker-oracle] waiting for block ${blockNumber} to be attested (can take several minutes)...`);

  // 20 minute timeout, matching the official example's conservative default.
  await proofBuilder.waitUntilHeightAttested(chainKey, blockNumber, 15_000, 1_200_000);

  console.log(`[worker-oracle] block ${blockNumber} attested, generating proof...`);
  return proofBuilder.getProof(txHash);
}

const GAS_BUFFER_MULTIPLIER = 135n; // 100% + 35% buffer, matches official example

/** Gas estimation for precompile-verifying calls can fail even when the call
 * would succeed (documented quirk in the official examples) — falls back to
 * a size-based calculation if estimation errors out. */
export async function computeGasLimitForAsc(
  provider: JsonRpcApiProvider,
  contract: Contract,
  proofData: proofProvider.ContinuityResponse,
  signerAddress: string,
  action: number
): Promise<bigint> {
  const iface = contract.interface;
  const funcFragment = iface.getFunction(
    "execute(uint8,uint64,uint64,bytes,bytes32,tuple(bytes32,bool)[],bytes32,bytes32[])"
  );
  const params = [
    action,
    proofData.chainKey,
    proofData.headerNumber,
    proofData.txBytes,
    proofData.merkleProof.root,
    proofData.merkleProof.siblings,
    proofData.continuityProof.lowerEndpointDigest,
    proofData.continuityProof.roots,
  ];
  const data = iface.encodeFunctionData(funcFragment!, params);
  const continuityLength = proofData.continuityProof.roots?.length || 1;

  try {
    const estimated = await provider.estimateGas({ to: await contract.getAddress(), data, from: signerAddress });
    return (estimated * GAS_BUFFER_MULTIPLIER) / 100n;
  } catch (err) {
    console.warn("[worker-oracle] gas estimation failed, using calculated fallback:", err);
    return BigInt(21000 + continuityLength * 5000 + 20000);
  }
}

export async function submitVerification(
  contract: Contract,
  proofData: proofProvider.ContinuityResponse,
  action: number,
  gasLimit: bigint
) {
  return contract.execute(
    action,
    proofData.chainKey,
    proofData.headerNumber,
    proofData.txBytes,
    proofData.merkleProof.root,
    proofData.merkleProof.siblings,
    proofData.continuityProof.lowerEndpointDigest,
    proofData.continuityProof.roots,
    { gasLimit }
  );
}
