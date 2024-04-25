import { ethers, upgrades } from 'hardhat'
import { expect } from 'chai'

describe('LunchbreakSeats contract tests', () => {
  let LunchbreakSeats, lunchbreakSeats, owner
  const feeRecipient = '0x274459384b38eaF2322BeDf889EEC30Ae7e0E158'
  const feeDivider = 20
  const compensationDivider = 10

  before(async function () {
    ;[owner] = await ethers.getSigners()
    LunchbreakSeats = await ethers.getContractFactory('LunchbreakSeats')
    lunchbreakSeats = await upgrades.deployProxy(LunchbreakSeats, [
      owner.address,
      feeRecipient,
      feeDivider,
      compensationDivider,
    ])
  })

  describe('Initialization', function () {
    it('should have correct initial values', async function () {
      expect(await lunchbreakSeats.owner()).to.equal(owner)
      expect(await lunchbreakSeats.feeRecipient()).to.equal(feeRecipient)
      expect(await lunchbreakSeats.feeDivider()).to.equal(feeDivider)
      expect(await lunchbreakSeats.compensationDivider()).to.equal(
        compensationDivider
      )
    })
  })

  describe('Setters', function () {
    describe('Set Fee Recipient', function () {
      const newFeeRecipient = '0x000000000000000000000000000000000000dEaD'

      it('should allow the owner to set a new fee recipient', async function () {
        await lunchbreakSeats.setFeeRecipient(newFeeRecipient)
        expect(await lunchbreakSeats.feeRecipient()).to.equal(newFeeRecipient)
      })

      it('should not allow non-owner to set a new fee recipient', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          lunchbreakSeats.connect(nonOwner).setFeeRecipient(newFeeRecipient)
        ).to.be.revertedWithCustomError(
          lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Fee Divider', function () {
      const newFeeDivider = 25 // Changing the fee divider for example purposes

      it('should allow the owner to set a new fee divider', async function () {
        await lunchbreakSeats.setFeeDivider(newFeeDivider)
        expect(await lunchbreakSeats.feeDivider()).to.equal(newFeeDivider)
      })

      it('should not allow non-owner to set a new fee divider', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          lunchbreakSeats.connect(nonOwner).setFeeDivider(newFeeDivider)
        ).to.be.revertedWithCustomError(
          lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Compensation Divider', function () {
      const newCompensationDivider = 15 // Example new value

      it('should allow the owner to set a new compensation divider', async function () {
        await lunchbreakSeats.setCompensationDivider(newCompensationDivider)
        expect(await lunchbreakSeats.compensationDivider()).to.equal(
          newCompensationDivider
        )
      })

      it('should not allow non-owner to set a new compensation divider', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          lunchbreakSeats
            .connect(nonOwner)
            .setCompensationDivider(newCompensationDivider)
        ).to.be.revertedWithCustomError(
          lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })
  })

  describe('Ownership Transfer', function () {
    let newOwner

    before(async function () {
      ;[, newOwner] = await ethers.getSigners()
    })

    it('should transfer ownership successfully', async function () {
      await lunchbreakSeats.transferOwnership(newOwner.address)
      expect(await lunchbreakSeats.owner()).to.equal(newOwner.address)
    })

    it('new owner should be able to set fee divider', async function () {
      const newFeeDivider = 25
      await expect(
        lunchbreakSeats.connect(newOwner).setFeeDivider(newFeeDivider)
      ).not.to.be.reverted
      expect(await lunchbreakSeats.feeDivider()).to.equal(newFeeDivider)
    })

    it('previous owner should not have administrative rights', async function () {
      const newFeeDivider = 30
      await expect(
        lunchbreakSeats.setFeeDivider(newFeeDivider)
      ).to.be.revertedWithCustomError(
        lunchbreakSeats,
        'OwnableUnauthorizedAccount'
      )
    })
  })
})
