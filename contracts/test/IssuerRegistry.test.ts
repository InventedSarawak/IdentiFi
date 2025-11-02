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
})
