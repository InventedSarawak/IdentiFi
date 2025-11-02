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
})
