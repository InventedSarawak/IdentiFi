import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('RegistryHubModule', m => {
    // Get all contract addresses from parameters
    const didRegistryAddress = m.getParameter('didRegistryAddress', process.env.DID_REGISTRY_ADDRESS!)
    const accessControlAddress = m.getParameter('accessControlAddress', process.env.ACCESS_CONTROL_ADDRESS!)
    const recoveryAddress = m.getParameter('recoveryAddress', process.env.RECOVERY_ADDRESS!)
    const revocationRegistryAddress = m.getParameter(
        'revocationRegistryAddress',
        process.env.REVOCATION_REGISTRY_ADDRESS!
    )
    const issuerRegistryAddress = m.getParameter('issuerRegistryAddress', process.env.ISSUER_REGISTRY_ADDRESS!)

    // Deploy RegistryHub contract
    const registryHub = m.contract('RegistryHub')

    // Set all addresses in the RegistryHub after deployment
    m.call(registryHub, 'setAddresses', [
        didRegistryAddress,
        accessControlAddress,
        recoveryAddress,
        revocationRegistryAddress,
        issuerRegistryAddress
    ])

    return { registryHub }
})
