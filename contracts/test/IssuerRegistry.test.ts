import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('IssuerRegistry', function () {
    let IssuerRegistry: any, issuerRegistry: any, org: any

    beforeEach(async () => {
        ;[org] = await ethers.getSigners()
        IssuerRegistry = await ethers.getContractFactory('IssuerRegistry')
        issuerRegistry = await IssuerRegistry.deploy()
    })

    it('should register an issuer organization', async () => {
        await issuerRegistry.connect(org).registerIssuer('UniversityX', 'ipfs://meta')
        const info = await issuerRegistry.getIssuer(org.address)
        expect(info.name).to.equal('UniversityX')
    })
})
