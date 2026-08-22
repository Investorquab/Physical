import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_SUBMITTER_PRIVATE_KEY
        ? [process.env.SEPOLIA_SUBMITTER_PRIVATE_KEY]
        : [],
    },
    creditcoinTestnet: {
      url: process.env.CREDITCOIN_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network",
      accounts: process.env.CREDITCOIN_SUBMITTER_PRIVATE_KEY
        ? [process.env.CREDITCOIN_SUBMITTER_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;