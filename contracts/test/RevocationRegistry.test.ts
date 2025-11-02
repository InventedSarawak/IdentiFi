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

    it('should register and revoke credential', async () => {
        await revocation.connect(issuer).registerCredential('hashABC')
        await revocation.connect(issuer).revokeCredential('hashABC')
        const valid = await revocation.isRevoked('hashABC')
        expect(valid).to.be.true
    })
})
