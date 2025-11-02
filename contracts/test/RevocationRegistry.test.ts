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
})
