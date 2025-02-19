import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts"
  },
  networks: {
    ethereum: {
      url: process.env.ETHEREUM_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 1
    },
    mantle: {
      url: process.env.MANTLE_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 5000
    },
    mantleSepolia: {
      url: process.env.MANTLE_SEPOLIA_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 5003
    },
    baseSepolia: {
      url: process.env.BASE_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 84532
    },
    sepolia: {
      url: process.env.SEPOLIA_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 11155111
    },
    modeSepolia: {
      url: process.env.MODE_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 919
    },
    fuji: {
      url: process.env.FUJI_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 43113
    },
    sonicTestnet: {
      url: process.env.SONIC_TESTNET_NODE_URL,
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 57054
    }
  },
  etherscan: {
    apiKey: {
      ethereum: process.env.ETHERSCAN_API_KEY ?? "",
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
      mantle: process.env.MANTLESCAN_API_KEY ?? "",
      mantleSepolia: process.env.MANTLESCAN_API_KEY ?? "",
      baseSepolia: process.env.BASESCAN_API_KEY ?? "",
      modeSepolia: process.env.MODESCAN_API_KEY ?? "",
      fuji: process.env.SNOWTRACE_API_KEY ?? "",
      sonicTestnet: process.env.SONICSCAN_API_KEY ?? ""
    },
    customChains: [
      {
        network: "sonicTestnet",
        chainId: 57054,
        urls: {
          apiURL: "https://api-testnet.sonicscan.org/api",
          browserURL: "https://testnet.sonicscan.org/"
        }
      },
      {
        network: "ethereum",
        chainId: 1,
        urls: {
          apiURL: "https://api.etherscan.io/api",
          browserURL: "https://etherscan.io"
        }
      },
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz/"
        }
      },
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz/"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "modeSepolia",
        chainId: 919,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/919/etherscan",
          browserURL: "https://testnet.modescan.io"
        }
      },
      {
        network: "fuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io"
        }
      }
    ]
  }
};

export default config;
