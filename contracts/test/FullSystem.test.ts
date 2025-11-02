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

    it('should handle complete social recovery workflow', async () => {
        const [newController, issuer1, issuer2] = await ethers.getSigners()

        // Set up complete system
        await didRegistry.setRecoveryManager(recovery.target)

        // User registers DID
        const originalDID = 'did:identifi:recovery-user'
        await didRegistry.connect(user).registerDID(originalDID, 'ipfs://original', 'originalKey')

        // User sets up guardians
        await recovery.connect(user).setGuardians([guardian1.address, guardian2.address], 2)

        // User grants access permissions
        await accessControl.connect(user).grantAccess(verifier.address, 'email', 0, 'consent1')
        await accessControl.connect(user).grantAccess(issuer1.address, 'identity', 0, 'consent2')

        // Simulate user losing access - guardians initiate recovery
        await recovery.connect(guardian1).approveRecovery(user.address)
        await recovery.connect(guardian2).approveRecovery(user.address)

        // Execute recovery
        await recovery.executeRecovery(user.address, newController.address, originalDID)

        // Verify new controller has control
        const resolvedDID = await didRegistry.resolveDID(originalDID)
        expect(resolvedDID.controller).to.equal(newController.address)

        // New controller can update DID
        await didRegistry.connect(newController).updateDID(originalDID, 'ipfs://recovered', 'recoveredKey')

        // Old permissions should still exist
        expect(await accessControl.hasAccess(user.address, verifier.address, 'email')).to.be.true
    })

    it('should handle cross-contract interactions with RegistryHub', async () => {
        // Verify all contracts are properly linked in RegistryHub
        await registryHub.setAddresses(
            didRegistry.target,
            accessControl.target,
            recovery.target,
            revocation.target,
            issuerRegistry.target
        )

        // Test multiple operations through the system
        const did = 'did:identifi:hub-test'
        await didRegistry.connect(user).registerDID(did, 'ipfs://hub-doc', 'hubKey')

        // Add trusted issuer
        await issuerRegistry.connect(user).addIssuer(verifier.address, 'ipfs://issuer-hub')

        // Issue and revoke credential
        const credHash = ethers.keccak256(ethers.toUtf8Bytes('hub-credential'))
        await revocation.connect(verifier).anchorCredential(credHash, 'ipfs://hub-cred')

        // Verify system integrity
        expect(await issuerRegistry.isTrusted(verifier.address)).to.be.true
        expect(await revocation.isRevoked(credHash)).to.be.false

        const didResult = await didRegistry.resolveDID(did)
        expect(didResult.controller).to.equal(user.address)
    })

    it('should handle edge cases and security scenarios', async () => {
        // Test with zero addresses - should complete without reverting
        await accessControl.connect(user).grantAccess(ethers.ZeroAddress, 'email', 0, '')
        expect(await accessControl.hasAccess(user.address, ethers.ZeroAddress, 'email')).to.be.true

        // Test with empty strings - should complete without reverting
        const emptyDID = ''
        await didRegistry.connect(user).registerDID(emptyDID, '', '')
        const emptyResult = await didRegistry.resolveDID(emptyDID)
        expect(emptyResult.controller).to.equal(user.address)

        // Test with very long strings (gas limit test)
        const longString = 'a'.repeat(1000)
        await didRegistry.connect(user).registerDID('did:identifi:long', longString, longString)
        const longResult = await didRegistry.resolveDID('did:identifi:long')
        expect(longResult.controller).to.equal(user.address)

        // Test simultaneous operations
        const promises = []
        for (let i = 0; i < 5; i++) {
            promises.push(didRegistry.connect(user).registerDID(`did:identifi:batch${i}`, `ipfs://doc${i}`, `key${i}`))
        }
        await Promise.all(promises)

        // Verify all were registered
        for (let i = 0; i < 5; i++) {
            const result = await didRegistry.resolveDID(`did:identifi:batch${i}`)
            expect(result.controller).to.equal(user.address)
        }
    })

    it('should handle complex permission scenarios', async () => {
        const [dataSubject, verifier1, verifier2, verifier3] = await ethers.getSigners()

        // Grant various permissions with different expiry times
        const now = Math.floor(Date.now() / 1000)
        const shortExpiry = now + 60 // 1 minute
        const longExpiry = now + 3600 // 1 hour

        await accessControl.connect(dataSubject).grantAccess(verifier1.address, 'email', shortExpiry, 'short-consent')
        await accessControl.connect(dataSubject).grantAccess(verifier2.address, 'phone', longExpiry, 'long-consent')
        await accessControl.connect(dataSubject).grantAccess(verifier3.address, 'address', 0, 'permanent-consent')

        // Test batch operations
        await accessControl
            .connect(dataSubject)
            .grantAccessBatch(
                [verifier1.address, verifier2.address],
                ['identity', 'nationality'],
                [longExpiry, longExpiry],
                ['batch-consent-1', 'batch-consent-2']
            )

        // Verify all permissions
        expect(await accessControl.hasAccess(dataSubject.address, verifier1.address, 'email')).to.be.true
        expect(await accessControl.hasAccess(dataSubject.address, verifier2.address, 'phone')).to.be.true
        expect(await accessControl.hasAccess(dataSubject.address, verifier3.address, 'address')).to.be.true
        expect(await accessControl.hasAccess(dataSubject.address, verifier1.address, 'identity')).to.be.true
        expect(await accessControl.hasAccess(dataSubject.address, verifier2.address, 'nationality')).to.be.true

        // Test partial revocation
        await accessControl
            .connect(dataSubject)
            .revokeAccessBatch([verifier1.address, verifier2.address], ['email', 'phone'])

        expect(await accessControl.hasAccess(dataSubject.address, verifier1.address, 'email')).to.be.false
        expect(await accessControl.hasAccess(dataSubject.address, verifier2.address, 'phone')).to.be.false
        expect(await accessControl.hasAccess(dataSubject.address, verifier1.address, 'identity')).to.be.true
    })
})
