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
        await didRegistry.connect(user).registerDID('did:identifi:user1', 'pubkey123', 'ipfs://doc')
        const doc = await didRegistry.getDID('did:identifi:user1')
        expect(doc.controller).to.equal(user.address)
    })

    it('should allow controller to update public key', async () => {
        await didRegistry.connect(user).registerDID('did:identifi:user2', 'pubkey123', 'ipfs://doc')
        await didRegistry.connect(user).updatePublicKey('did:identifi:user2', 'newKey')
        const doc = await didRegistry.getDID('did:identifi:user2')
        expect(doc.publicKey).to.equal('newKey')
    })

    it('should not allow non-controller to update', async () => {
        await didRegistry.connect(user).registerDID('did:identifi:user3', 'pubkey123', 'ipfs://doc')
        await expect(didRegistry.connect(owner).updatePublicKey('did:identifi:user3', 'hackerKey')).to.be.reverted
    })
})
