import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SourceEventRegistry to Sepolia");
  console.log("Submitter (only address allowed to call recordEvent):", deployer.address);

  const factory = await ethers.getContractFactory("SourceEventRegistry");
  const contract = await factory.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nSourceEventRegistry deployed to:", address);
  console.log(`\nAdd this to .env:\nSOURCE_EVENT_REGISTRY_ADDRESS="${address}"`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});