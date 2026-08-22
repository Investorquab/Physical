import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to Creditcoin CC3 Testnet");
  console.log("Deployer:", deployer.address);

  // EvmV1Decoder is an external Solidity library (too large to inline) —
  // it must be deployed on its own first, then linked into PhysicalASC.
  console.log("\nStep 1: deploying EvmV1Decoder library...");
  const decoderFactory = await ethers.getContractFactory(
    "@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol:EvmV1Decoder"
  );
  const decoder = await decoderFactory.deploy();
  await decoder.waitForDeployment();
  const decoderAddress = await decoder.getAddress();
  console.log("EvmV1Decoder deployed to:", decoderAddress);

  console.log("\nStep 2: deploying PhysicalASC, linked to EvmV1Decoder...");
  const ascFactory = await ethers.getContractFactory("PhysicalASC", {
    libraries: {
      EvmV1Decoder: decoderAddress,
    },
  });
  const asc = await ascFactory.deploy();
  await asc.waitForDeployment();
  const ascAddress = await asc.getAddress();

  console.log("\nPhysicalASC deployed to:", ascAddress);
  console.log(`\nAdd these to .env:\nPHYSICAL_ASC_ADDRESS="${ascAddress}"\nEVM_V1_DECODER_ADDRESS="${decoderAddress}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});