import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('Recovery', function () {
    let Recovery: any, recovery: any, didRegistry: any, user: any, guardian1: any, guardian2: any

    beforeEach(async () => {
        ;[user, guardian1, guardian2] = await ethers.getSigners()
        const DIDRegistry = await ethers.getContractFactory('DIDRegistry')
        didRegistry = await DIDRegistry.deploy()
        Recovery = await ethers.getContractFactory('Recovery')
        recovery = await Recovery.deploy(didRegistry.target)
    })

    it('should set guardians and perform recovery', async () => {
        // First register a DID in the DIDRegistry
        const did = 'did:identifi:user1'
        await didRegistry.connect(user).registerDID(did, 'ipfs://doc', 'oldPubKey')

        // Set Recovery as the recovery manager
        await didRegistry.setRecoveryManager(recovery.target)

        // Set guardians
        await recovery.connect(user).setGuardians([guardian1.address, guardian2.address], 2)

        // Get new controller address
        const [newController] = await ethers.getSigners()

        // Guardians approve recovery
        await recovery.connect(guardian1).approveRecovery(user.address)
        await recovery.connect(guardian2).approveRecovery(user.address)

        // Execute recovery
        await expect(recovery.executeRecovery(user.address, newController.address, did))
            .to.emit(recovery, 'RecoveryExecuted')
            .withArgs(user.address, newController.address, did)
    })
})
