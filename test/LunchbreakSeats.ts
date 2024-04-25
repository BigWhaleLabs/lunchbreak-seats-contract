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
})
