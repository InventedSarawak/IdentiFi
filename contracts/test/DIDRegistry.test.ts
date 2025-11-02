import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('DIDRegistry', function () {
    let DIDRegistry: any, didRegistry: any, owner: any, user: any

    beforeEach(async () => {
        ;[owner, user] = await ethers.getSigners()
        DIDRegistry = await ethers.getContractFactory('DIDRegistry')
        didRegistry = await DIDRegistry.deploy()
    })

    it('should register a DID', async () => {
        await didRegistry.connect(user).registerDID('did:identifi:user1', 'ipfs://doc', 'pubkey123')
        const result = await didRegistry.resolveDID('did:identifi:user1')
        expect(result.controller).to.equal(user.address)
    })

    it('should allow controller to update DID', async () => {
        await didRegistry.connect(user).registerDID('did:identifi:user2', 'ipfs://doc', 'pubkey123')
        await didRegistry.connect(user).updateDID('did:identifi:user2', 'ipfs://newdoc', 'newKey')
        const result = await didRegistry.resolveDID('did:identifi:user2')
        expect(result.publicKey).to.equal('newKey')
        expect(result.cid).to.equal('ipfs://newdoc')
    })

    it('should not allow non-controller to update', async () => {
        await didRegistry.connect(user).registerDID('did:identifi:user3', 'ipfs://doc', 'pubkey123')
        await expect(
            didRegistry.connect(owner).updateDID('did:identifi:user3', 'ipfs://hack', 'hackerKey')
        ).to.be.revertedWith('DIDRegistry: not controller')
    })

    it('should prevent duplicate DID registration', async () => {
        const did = 'did:identifi:duplicate'
        await didRegistry.connect(user).registerDID(did, 'ipfs://doc1', 'key1')

        await expect(didRegistry.connect(owner).registerDID(did, 'ipfs://doc2', 'key2')).to.be.revertedWith(
            'DIDRegistry: did already registered'
        )
    })

    it('should handle recovery manager operations', async () => {
        const [, , recoveryManager] = await ethers.getSigners()

        // Set recovery manager (only owner can do this)
        await expect(didRegistry.connect(owner).setRecoveryManager(recoveryManager.address))
            .to.emit(didRegistry, 'RecoveryManagerSet')
            .withArgs(ethers.ZeroAddress, recoveryManager.address)

        // Non-owner cannot set recovery manager
        await expect(didRegistry.connect(user).setRecoveryManager(user.address)).to.be.revertedWith(
            'DIDRegistry: only owner'
        )

        // Register a DID
        const did = 'did:identifi:recovery-test'
        await didRegistry.connect(user).registerDID(did, 'ipfs://doc', 'oldkey')

        // Recovery manager can update controller
        await expect(didRegistry.connect(recoveryManager).updateControllerByRecovery(did, owner.address))
            .to.emit(didRegistry, 'DIDControllerUpdated')
            .withArgs(ethers.keccak256(ethers.toUtf8Bytes(did)), user.address, owner.address)

        // Verify controller was updated
        const result = await didRegistry.resolveDID(did)
        expect(result.controller).to.equal(owner.address)
    })

    it('should track DIDs per controller', async () => {
        const did1 = 'did:identifi:user1'
        const did2 = 'did:identifi:user2'

        await didRegistry.connect(user).registerDID(did1, 'ipfs://doc1', 'key1')
        await didRegistry.connect(user).registerDID(did2, 'ipfs://doc2', 'key2')

        const userDIDs = await didRegistry.getDIDsOf(user.address)
        expect(userDIDs.length).to.equal(2)
        expect(userDIDs[0]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(did1)))
        expect(userDIDs[1]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(did2)))
    })

    it('should handle empty/invalid DID resolution', async () => {
        const result = await didRegistry.resolveDID('did:identifi:nonexistent')
        expect(result.controller).to.equal(ethers.ZeroAddress)
        expect(result.cid).to.equal('')
        expect(result.publicKey).to.equal('')
        expect(result.updatedAt).to.equal(0)
    })

    it('should emit events correctly', async () => {
        const did = 'did:identifi:events'
        const cid = 'ipfs://test'
        const publicKey = 'testkey'

        await expect(didRegistry.connect(user).registerDID(did, cid, publicKey))
            .to.emit(didRegistry, 'DIDRegistered')
            .withArgs(ethers.keccak256(ethers.toUtf8Bytes(did)), did, user.address, cid)

        await expect(didRegistry.connect(user).updateDID(did, 'ipfs://updated', 'newkey'))
            .to.emit(didRegistry, 'DIDUpdated')
            .withArgs(ethers.keccak256(ethers.toUtf8Bytes(did)), user.address, 'newkey', 'ipfs://updated')
    })
})
