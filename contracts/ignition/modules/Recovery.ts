import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('RecoveryModule', m => {
    const didRegistryAddress = m.getParameter('didRegistryAddress')
    const recovery = m.contract('Recovery', [didRegistryAddress])
    return { recovery }
})
