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

    it('should handle expiry timestamps', async () => {
        const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago

        // Grant access with future expiry
        await accessControl.connect(user).grantAccess(verifier.address, 'email', futureTime, 'consent123')
        expect(await accessControl.hasAccess(user.address, verifier.address, 'email')).to.be.true

        // Grant access with past expiry (should be expired)
        await accessControl.connect(user).grantAccess(verifier.address, 'phone', pastTime, '')
        expect(await accessControl.hasAccess(user.address, verifier.address, 'phone')).to.be.false
    })

    it('should handle batch operations', async () => {
        const [, , grantee1, grantee2] = await ethers.getSigners()

        await accessControl
            .connect(user)
            .grantAccessBatch(
                [grantee1.address, grantee2.address],
                ['email', 'phone'],
                [0, 0],
                ['consent1', 'consent2']
            )

        expect(await accessControl.hasAccess(user.address, grantee1.address, 'email')).to.be.true
        expect(await accessControl.hasAccess(user.address, grantee2.address, 'phone')).to.be.true

        await accessControl.connect(user).revokeAccessBatch([grantee1.address, grantee2.address], ['email', 'phone'])

        expect(await accessControl.hasAccess(user.address, grantee1.address, 'email')).to.be.false
        expect(await accessControl.hasAccess(user.address, grantee2.address, 'phone')).to.be.false
    })

    it('should revert batch operations with mismatched arrays', async () => {
        await expect(
            accessControl.connect(user).grantAccessBatch(
                [verifier.address],
                ['email', 'phone'], // mismatched length
                [0],
                ['consent']
            )
        ).to.be.revertedWith('AccessControl: array length mismatch')
    })

    it('should return permission details', async () => {
        const consentCID = 'ipfs://consent123'
        const expiry = Math.floor(Date.now() / 1000) + 3600

        await accessControl.connect(user).grantAccess(verifier.address, 'email', expiry, consentCID)

        const permission = await accessControl.getPermission(user.address, verifier.address, 'email')
        expect(permission.granted).to.be.true
        expect(permission.expiry).to.equal(expiry)
        expect(permission.consentCID).to.equal(consentCID)
    })

    it('should emit correct events', async () => {
        await expect(accessControl.connect(user).grantAccess(verifier.address, 'email', 0, 'consent'))
            .to.emit(accessControl, 'AccessGranted')
            .withArgs(user.address, verifier.address, ethers.keccak256(ethers.toUtf8Bytes('email')), 0, 'consent')

        await expect(accessControl.connect(user).revokeAccess(verifier.address, 'email'))
            .to.emit(accessControl, 'AccessRevoked')
            .withArgs(user.address, verifier.address, ethers.keccak256(ethers.toUtf8Bytes('email')))
    })
})
