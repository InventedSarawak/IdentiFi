import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('IssuerRegistryModule', m => {
    const issuerRegistry = m.contract('IssuerRegistry')
    return { issuerRegistry }
})
