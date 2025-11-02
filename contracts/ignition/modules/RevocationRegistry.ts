import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('RevocationRegistryModule', m => {
    const revocationRegistry = m.contract('RevocationRegistry')
    return { revocationRegistry }
})
