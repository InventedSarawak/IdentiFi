import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('RevocationRegistry', function () {
    let RevocationRegistry: any, revocation: any, issuer: any

    beforeEach(async () => {
        ;[issuer] = await ethers.getSigners()
        RevocationRegistry = await ethers.getContractFactory('RevocationRegistry')
        revocation = await RevocationRegistry.deploy()
    })

    it('should anchor and revoke credential', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('credential123'))
        await revocation.connect(issuer).anchorCredential(credHash, 'ipfs://cred')
        await revocation.connect(issuer).revokeCredential(credHash, 'Revoked for testing')
        const isRevoked = await revocation.isRevoked(credHash)
        expect(isRevoked).to.be.true
    })

    it('should prevent double anchoring', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('credential456'))
        await revocation.connect(issuer).anchorCredential(credHash, 'ipfs://cred1')

        await expect(revocation.connect(issuer).anchorCredential(credHash, 'ipfs://cred2')).to.be.revertedWith(
            'Revocation: already anchored'
        )
    })

    it('should prevent non-issuer from revoking', async () => {
        const [, , otherUser] = await ethers.getSigners()
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('credential789'))

        await revocation.connect(issuer).anchorCredential(credHash, 'ipfs://cred')

        await expect(
            revocation.connect(otherUser).revokeCredential(credHash, 'Unauthorized revocation')
        ).to.be.revertedWith('Revocation: only issuer')
    })

    it('should prevent revoking non-anchored credential', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('nonexistent'))

        await expect(revocation.connect(issuer).revokeCredential(credHash, 'Cannot revoke')).to.be.revertedWith(
            'Revocation: not anchored'
        )
    })

    it('should prevent double revocation', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('double-revoke'))
        await revocation.connect(issuer).anchorCredential(credHash, 'ipfs://cred')
        await revocation.connect(issuer).revokeCredential(credHash, 'First revocation')

        await expect(revocation.connect(issuer).revokeCredential(credHash, 'Second revocation')).to.be.revertedWith(
            'Revocation: already revoked'
        )
    })

    it('should return anchor details', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('anchor-test'))
        const cid = 'ipfs://anchor-cid'

        await revocation.connect(issuer).anchorCredential(credHash, cid)

        const anchor = await revocation.getAnchor(credHash)
        expect(anchor.issuer).to.equal(issuer.address)
        expect(anchor.cid).to.equal(cid)
        expect(anchor.revoked).to.be.false
        expect(anchor.ts).to.be.gt(0)
    })

    it('should emit correct events', async () => {
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('event-test'))
        const cid = 'ipfs://event-cid'
        const reason = 'Test revocation reason'

        await expect(revocation.connect(issuer).anchorCredential(credHash, cid))
            .to.emit(revocation, 'CredentialAnchored')
            .withArgs(credHash, issuer.address, cid)

        await expect(revocation.connect(issuer).revokeCredential(credHash, reason))
            .to.emit(revocation, 'CredentialRevoked')
            .withArgs(credHash, issuer.address, reason)
    })

    it('should handle multiple credentials from same issuer', async () => {
        const cred1 = ethers.keccak256(ethers.toUtf8Bytes('multi-cred-1'))
        const cred2 = ethers.keccak256(ethers.toUtf8Bytes('multi-cred-2'))

        await revocation.connect(issuer).anchorCredential(cred1, 'ipfs://cred1')
        await revocation.connect(issuer).anchorCredential(cred2, 'ipfs://cred2')

        expect(await revocation.isRevoked(cred1)).to.be.false
        expect(await revocation.isRevoked(cred2)).to.be.false

        await revocation.connect(issuer).revokeCredential(cred1, 'Revoke first only')

        expect(await revocation.isRevoked(cred1)).to.be.true
        expect(await revocation.isRevoked(cred2)).to.be.false
    })
})
