import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('RegistryHubModule', m => {
    const registryHub = m.contract('RegistryHub')
    return { registryHub }
})
