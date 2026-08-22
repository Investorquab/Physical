import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PhysicalSettlement to Creditcoin CC3 Testnet");
  console.log("Operator (only address allowed to call recordSettlement):", deployer.address);

  const factory = await ethers.getContractFactory("PhysicalSettlement");
  const contract = await factory.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nPhysicalSettlement deployed to:", address);
  console.log(`\nAdd this to .env:\nPHYSICAL_SETTLEMENT_ADDRESS="${address}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
