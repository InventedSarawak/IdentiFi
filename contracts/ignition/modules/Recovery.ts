import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('RecoveryModule', m => {
    const didRegistryAddress = m.getParameter('didRegistryAddress', process.env.DID_REGISTRY_ADDRESS!)
    const recovery = m.contract('Recovery', [didRegistryAddress])
    return { recovery }
})
