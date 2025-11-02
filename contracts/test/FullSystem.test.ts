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
        await didRegistry.connect(user).registerDID('did:identifi:user1', 'pub123', 'ipfs://doc')
        const doc = await didRegistry.getDID('did:identifi:user1')
        expect(doc.controller).to.equal(user.address)
    })
})
