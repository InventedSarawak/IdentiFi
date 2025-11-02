import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('DIDRegistryModule', m => {
    const didRegistry = m.contract('DIDRegistry')
    return { didRegistry }
})
