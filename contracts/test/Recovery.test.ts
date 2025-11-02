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

    it('should enforce guardian threshold', async () => {
        const [, , , guardian3] = await ethers.getSigners()

        // Set 3 guardians with threshold of 2
        await recovery.connect(user).setGuardians([guardian1.address, guardian2.address, guardian3.address], 2)

        const did = 'did:identifi:threshold-test'
        await didRegistry.connect(user).registerDID(did, 'ipfs://doc', 'oldKey')
        await didRegistry.setRecoveryManager(recovery.target)

        // Only 1 approval should fail
        await recovery.connect(guardian1).approveRecovery(user.address)

        await expect(recovery.executeRecovery(user.address, guardian1.address, did)).to.be.revertedWith(
            'Recovery: not enough approvals'
        )

        // 2 approvals should succeed
        await recovery.connect(guardian2).approveRecovery(user.address)

        await expect(recovery.executeRecovery(user.address, guardian1.address, did)).to.emit(
            recovery,
            'RecoveryExecuted'
        )
    })

    it('should prevent non-guardians from approving', async () => {
        const [, , , nonGuardian] = await ethers.getSigners()

        await recovery.connect(user).setGuardians([guardian1.address], 1)

        await expect(recovery.connect(nonGuardian).approveRecovery(user.address)).to.be.revertedWith(
            'Recovery: caller not guardian'
        )
    })

    it('should prevent double approval from same guardian', async () => {
        await recovery.connect(user).setGuardians([guardian1.address], 1)

        await recovery.connect(guardian1).approveRecovery(user.address)

        await expect(recovery.connect(guardian1).approveRecovery(user.address)).to.be.revertedWith(
            'Recovery: already approved'
        )
    })

    it('should validate guardian count and threshold', async () => {
        // Empty guardians array should fail
        await expect(recovery.connect(user).setGuardians([], 1)).to.be.revertedWith('Recovery: guardians count invalid')

        // Threshold 0 should fail
        await expect(recovery.connect(user).setGuardians([guardian1.address], 0)).to.be.revertedWith(
            'Recovery: threshold invalid'
        )

        // Threshold higher than guardian count should fail
        await expect(recovery.connect(user).setGuardians([guardian1.address], 2)).to.be.revertedWith(
            'Recovery: threshold invalid'
        )
    })

    it('should reset approvals when setting new guardians', async () => {
        // Set initial guardians and get approval
        await recovery.connect(user).setGuardians([guardian1.address], 1)
        await recovery.connect(guardian1).approveRecovery(user.address)

        expect(await recovery.approvalsCount(user.address)).to.equal(1)

        // Set new guardians - should reset approvals
        await recovery.connect(user).setGuardians([guardian2.address], 1)

        expect(await recovery.approvalsCount(user.address)).to.equal(0)
    })

    it('should return guardian information', async () => {
        await recovery.connect(user).setGuardians([guardian1.address, guardian2.address], 2)

        const guardianInfo = await recovery.getGuardians(user.address)
        expect(guardianInfo.guardians).to.deep.equal([guardian1.address, guardian2.address])
        expect(guardianInfo.threshold).to.equal(2)
        expect(guardianInfo.initialized).to.be.true
    })

    it('should handle recovery for non-existent DID', async () => {
        await recovery.connect(user).setGuardians([guardian1.address], 1)
        await recovery.connect(guardian1).approveRecovery(user.address)
        await didRegistry.setRecoveryManager(recovery.target)

        await expect(
            recovery.executeRecovery(user.address, guardian1.address, 'did:identifi:nonexistent')
        ).to.be.revertedWith('DIDRegistry: unknown did')
    })

    it('should emit events correctly', async () => {
        await expect(recovery.connect(user).setGuardians([guardian1.address], 1))
            .to.emit(recovery, 'GuardiansSet')
            .withArgs(user.address, [guardian1.address], 1)

        await expect(recovery.connect(guardian1).approveRecovery(user.address))
            .to.emit(recovery, 'RecoveryApproved')
            .withArgs(user.address, guardian1.address)
    })
})
