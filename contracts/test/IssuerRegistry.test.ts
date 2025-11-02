import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('IssuerRegistry', function () {
    let IssuerRegistry: any, issuerRegistry: any, owner: any, issuer: any

    beforeEach(async () => {
        ;[owner, issuer] = await ethers.getSigners()
        IssuerRegistry = await ethers.getContractFactory('IssuerRegistry')
        issuerRegistry = await IssuerRegistry.deploy()
    })

    it('should register an issuer organization', async () => {
        await issuerRegistry.connect(owner).addIssuer(issuer.address, 'ipfs://meta')
        expect(await issuerRegistry.isTrusted(issuer.address)).to.be.true
        expect(await issuerRegistry.getMetadataCID(issuer.address)).to.equal('ipfs://meta')
    })

    it('should remove issuer (only owner)', async () => {
        // Add issuer first
        await issuerRegistry.connect(owner).addIssuer(issuer.address, 'ipfs://meta')
        expect(await issuerRegistry.isTrusted(issuer.address)).to.be.true

        // Remove issuer
        await expect(issuerRegistry.connect(owner).removeIssuer(issuer.address))
            .to.emit(issuerRegistry, 'IssuerRemoved')
            .withArgs(issuer.address)

        expect(await issuerRegistry.isTrusted(issuer.address)).to.be.false
    })

    it('should prevent non-owner from adding issuer', async () => {
        await expect(
            issuerRegistry.connect(issuer).addIssuer(issuer.address, 'ipfs://meta')
        ).to.be.revertedWithCustomError(issuerRegistry, 'OwnableUnauthorizedAccount')
    })

    it('should prevent non-owner from removing issuer', async () => {
        await issuerRegistry.connect(owner).addIssuer(issuer.address, 'ipfs://meta')

        await expect(issuerRegistry.connect(issuer).removeIssuer(issuer.address)).to.be.revertedWithCustomError(
            issuerRegistry,
            'OwnableUnauthorizedAccount'
        )
    })

    it('should handle multiple issuers', async () => {
        const [, , issuer2, issuer3] = await ethers.getSigners()

        await issuerRegistry.connect(owner).addIssuer(issuer.address, 'ipfs://meta1')
        await issuerRegistry.connect(owner).addIssuer(issuer2.address, 'ipfs://meta2')
        await issuerRegistry.connect(owner).addIssuer(issuer3.address, 'ipfs://meta3')

        expect(await issuerRegistry.isTrusted(issuer.address)).to.be.true
        expect(await issuerRegistry.isTrusted(issuer2.address)).to.be.true
        expect(await issuerRegistry.isTrusted(issuer3.address)).to.be.true

        expect(await issuerRegistry.getMetadataCID(issuer2.address)).to.equal('ipfs://meta2')
    })

    it('should emit correct events', async () => {
        await expect(issuerRegistry.connect(owner).addIssuer(issuer.address, 'ipfs://meta'))
            .to.emit(issuerRegistry, 'IssuerAdded')
            .withArgs(issuer.address, 'ipfs://meta')
    })

    it('should return false for non-registered issuers', async () => {
        const [, , randomAddress] = await ethers.getSigners()
        expect(await issuerRegistry.isTrusted(randomAddress.address)).to.be.false
        expect(await issuerRegistry.getMetadataCID(randomAddress.address)).to.equal('')
    })
})
