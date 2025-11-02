import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('DeployAllModule', m => {
    // Step 1: Deploy all contracts
    const didRegistry = m.contract('DIDRegistry')
    const revocationRegistry = m.contract('RevocationRegistry')
    const issuerRegistry = m.contract('IssuerRegistry')
    const accessControl = m.contract('AccessControl')

    // Recovery needs DIDRegistry address
    const recovery = m.contract('Recovery', [didRegistry])

    // RegistryHub deploys last
    const registryHub = m.contract('RegistryHub')

    // Step 2: Wiring
    m.call(didRegistry, 'setRecoveryManager', [recovery])
    m.call(registryHub, 'setAddresses', [didRegistry, accessControl, recovery, revocationRegistry, issuerRegistry])

    return {
        didRegistry,
        accessControl,
        recovery,
        revocationRegistry,
        issuerRegistry,
        registryHub
    }
})
