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
        await recovery.connect(user).setGuardians([guardian1.address, guardian2.address], 2)
        await recovery.connect(guardian1).approveRecovery(user.address, 'newPubKey123')
        await recovery.connect(guardian2).approveRecovery(user.address, 'newPubKey123')
        await expect(recovery.finalizeRecovery(user.address, 'newPubKey123')).to.emit(recovery, 'RecoveryCompleted')
    })
})
