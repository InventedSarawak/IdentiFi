import { expect } from 'chai'
import { network } from 'hardhat'

const { ethers } = await network.connect()

describe('AccessControl', function () {
    let AccessControl: any, accessControl: any, user: any, verifier: any

    beforeEach(async () => {
        ;[user, verifier] = await ethers.getSigners()
        AccessControl = await ethers.getContractFactory('AccessControl')
        accessControl = await AccessControl.deploy()
    })

    it('should grant and revoke access', async () => {
        await accessControl.connect(user).grantAccess(verifier.address, 'email', 0, '')
        expect(await accessControl.hasAccess(user.address, verifier.address, 'email')).to.be.true

        await accessControl.connect(user).revokeAccess(verifier.address, 'email')
        expect(await accessControl.hasAccess(user.address, verifier.address, 'email')).to.be.false
    })
})
