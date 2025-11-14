import type { HardhatUserConfig } from 'hardhat/config'
import HardhatIgnitionEthersPlugin from '@nomicfoundation/hardhat-ignition-ethers'

import hardhatToolboxMochaEthersPlugin from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from parent directory
dotenv.config({ path: resolve(__dirname, '../.env') })

const config: HardhatUserConfig = {
    plugins: [hardhatToolboxMochaEthersPlugin, HardhatIgnitionEthersPlugin],
    solidity: {
        profiles: {
            default: {
                version: '0.8.28'
            },
            production: {
                version: '0.8.28',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        }
    },
    networks: {
        localhost: {
            type: 'http',
            url: 'http://127.0.0.1:8545',
            chainId: 31337
        },
        hardhatMainnet: {
            type: 'edr-simulated',
            chainType: 'l1'
        },
        hardhatOp: {
            type: 'edr-simulated',
            chainType: 'op'
        },
        sepolia: {
            type: 'http',
            chainType: 'l1',
            url: process.env.SEPOLIA_RPC_URL!,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY!]
        }
    }
}

export default config
