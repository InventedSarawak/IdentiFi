import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('IdentiFi Full System', function () {
    let didRegistry: any, accessControl: any, recovery: any, revocation: any, issuerRegistry: any, registryHub: any
    let user: any, verifier: any, guardian1: any, guardian2: any

    beforeEach(async () => {
        ;[user, verifier, guardian1, guardian2] = await ethers.getSigners()

        const DIDRegistry = await ethers.getContractFactory('DIDRegistry')
        didRegistry = await DIDRegistry.deploy()

        const AccessControl = await ethers.getContractFactory('AccessControl')
        accessControl = await AccessControl.deploy()

        const RevocationRegistry = await ethers.getContractFactory('RevocationRegistry')
        revocation = await RevocationRegistry.deploy()

        const IssuerRegistry = await ethers.getContractFactory('IssuerRegistry')
        issuerRegistry = await IssuerRegistry.deploy()

        const Recovery = await ethers.getContractFactory('Recovery')
        recovery = await Recovery.deploy(didRegistry.target)

        const RegistryHub = await ethers.getContractFactory('RegistryHub')
        registryHub = await RegistryHub.deploy()

        await registryHub.setAddresses(
            didRegistry.target,
            accessControl.target,
            recovery.target,
            revocation.target,
            issuerRegistry.target
        )
    })

    it('should complete full DID lifecycle', async () => {
        // Register DID
        const did = 'did:identifi:user1'
        await didRegistry.connect(user).registerDID(did, 'ipfs://doc', 'pub123')

        // Resolve DID
        const result = await didRegistry.resolveDID(did)
        expect(result.controller).to.equal(user.address)
        expect(result.publicKey).to.equal('pub123')

        // Grant access permission
        await accessControl.connect(user).grantAccess(verifier.address, 'email', 0, '')
        expect(await accessControl.hasAccess(user.address, verifier.address, 'email')).to.be.true

        // Add trusted issuer
        await issuerRegistry.connect(user).addIssuer(verifier.address, 'ipfs://issuer-meta')
        expect(await issuerRegistry.isTrusted(verifier.address)).to.be.true

        // Anchor and revoke credential
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('credential123'))
        await revocation.connect(verifier).anchorCredential(credHash, 'ipfs://cred')
        await revocation.connect(verifier).revokeCredential(credHash, 'Test revocation')
        expect(await revocation.isRevoked(credHash)).to.be.true
    })
})
