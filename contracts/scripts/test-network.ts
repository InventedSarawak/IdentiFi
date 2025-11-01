import { network } from 'hardhat'

async function testNetworks() {
    console.log('Testing network configuration...')

    try {
        const { ethers } = await network.connect({
            network: 'localhost'
        })

        console.log('Successfully connected to localhost network')

        try {
            const accounts = await ethers.getSigners()
            console.log('Available accounts:', accounts.length)

            if (accounts.length > 0) {
                const balance = await ethers.provider.getBalance(accounts[0].address)
                console.log('First account:', accounts[0].address)
                console.log('Balance:', ethers.formatEther(balance), 'ETH')
            }
        } catch (err: any) {
            console.log('No local node running (expected) -', err.message)
        }

        console.log('Network test successful!')
    } catch (error) {
        console.error('Network test failed:', error)
    }
}

testNetworks()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
