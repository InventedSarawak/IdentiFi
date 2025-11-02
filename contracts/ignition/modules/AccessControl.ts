import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('AccessControlModule', m => {
    const accessControl = m.contract('AccessControl')
    return { accessControl }
})
