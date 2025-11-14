import { network } from 'hardhat'

import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const { ethers } = await network.connect()
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') })

async function main() {
    // Contract addresses - update these with your deployed addresses
    const didRegistryAddress = process.env.DID_REGISTRY_ADDRESS!
    const recoveryAddress = process.env.RECOVERY_ADDRESS!

    if (!recoveryAddress) {
        console.error('RECOVERY_ADDRESS not found in .env file')
        console.log('Please add RECOVERY_ADDRESS=0x... to your .env file after deploying Recovery contract')
        process.exit(1)
    }

    console.log('Setting Recovery Manager...')
    console.log(`DID Registry: ${didRegistryAddress}`)
    console.log(`Recovery Contract: ${recoveryAddress}`)
    console.log('')

    // Get contract factory and attach to deployed instance
    const DIDRegistry = await ethers.getContractFactory('DIDRegistry')
    const didRegistry = DIDRegistry.attach(didRegistryAddress)

    try {
        // Check current recovery manager
        const currentManager = await didRegistry.recoveryManager()
        console.log(`Current recovery manager: ${currentManager}`)

        if (currentManager.toLowerCase() === recoveryAddress.toLowerCase()) {
            console.log('Recovery manager already set correctly!')
            return
        }

        // Set recovery manager
        console.log('Sending transaction to set recovery manager...')
        const tx = await didRegistry.setRecoveryManager(recoveryAddress)

        console.log(`Transaction hash: ${tx.hash}`)
        console.log('Waiting for confirmation...')

        const receipt = await tx.wait()

        if (receipt?.status === 1) {
            console.log('Recovery manager set successfully!')
            console.log(`New recovery manager: ${recoveryAddress}`)
            console.log(`Gas used: ${receipt.gasUsed.toString()}`)
        } else {
            console.log('Transaction failed')
        }
    } catch (error: any) {
        console.error('Error setting recovery manager:', error.message)

        // Common error scenarios
        if (error.message.includes('only owner')) {
            console.log("Make sure you're using the owner account that deployed DIDRegistry")
        } else if (error.message.includes('insufficient funds')) {
            console.log('Make sure your account has enough ETH for gas fees')
        }

        process.exit(1)
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error)
    process.exit(1)
})

main()
    .then(() => {
        console.log('Script completed successfully')
        process.exit(0)
    })
    .catch(error => {
        console.error('Script failed:', error)
        process.exit(1)
    })
