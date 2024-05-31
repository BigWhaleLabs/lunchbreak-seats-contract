import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { LunchbreakSeats } from 'typechain'
import { ethers, upgrades } from 'hardhat'
import { expect } from 'chai'

describe('LunchbreakSeats contract tests', () => {
  const wallet = ethers.Wallet.createRandom()
  console.log(wallet.address, wallet.privateKey)
  let owner

  const feeRecipient = '0x274459384b38eaF2322BeDf889EEC30Ae7e0E158'
  const initialPrice = ethers.parseEther('0.002')
  const curveFactor = ethers.parseEther('0.000001')
  const feeDivider = 20n
  const compensationDivider = 20n

  beforeEach(async function () {
    ;[owner] = await ethers.getSigners()
    this.LunchbreakSeats = await ethers.getContractFactory('LunchbreakSeats')
    this.lunchbreakSeats = await upgrades.deployProxy(this.LunchbreakSeats, [
      owner.address,
      feeRecipient,
      initialPrice,
      curveFactor,
      feeDivider,
      compensationDivider,
    ])
  })

  describe('Initialization', function () {
    it('should have correct initial values', async function () {
      expect(await this.lunchbreakSeats.owner()).to.equal(owner)
      expect(await this.lunchbreakSeats.feeRecipient()).to.equal(feeRecipient)
      expect(await this.lunchbreakSeats.feeDivider()).to.equal(feeDivider)
      expect(await this.lunchbreakSeats.compensationDivider()).to.equal(
        compensationDivider
      )
    })
  })

  describe('Setters', function () {
    describe('Set Fee Recipient', function () {
      const newFeeRecipient = '0x000000000000000000000000000000000000dEaD'

      it('should allow the owner to set a new fee recipient', async function () {
        await this.lunchbreakSeats.setFeeRecipient(newFeeRecipient)
        expect(await this.lunchbreakSeats.feeRecipient()).to.equal(
          newFeeRecipient
        )
      })

      it('should not allow non-owner to set a new fee recipient', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          this.lunchbreakSeats
            .connect(nonOwner)
            .setFeeRecipient(newFeeRecipient)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Initial Price', function () {
      const newInitialPrice = ethers.parseEther('0.2') // Changing the initial price for example purposes

      it('should allow the owner to set a new initial price', async function () {
        await this.lunchbreakSeats.setInitialPrice(newInitialPrice)
        expect(await this.lunchbreakSeats.initialPrice()).to.equal(
          newInitialPrice
        )
      })

      it('should not allow non-owner to set a new initial price', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          this.lunchbreakSeats
            .connect(nonOwner)
            .setInitialPrice(newInitialPrice)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Curve Factor', function () {
      const newCurveFactor = 20 // Changing the curve factor for example purposes

      it('should allow the owner to set a new curve factor', async function () {
        await this.lunchbreakSeats.setCurveFactor(newCurveFactor)
        expect(await this.lunchbreakSeats.curveFactor()).to.equal(
          newCurveFactor
        )
      })

      it('should not allow non-owner to set a new curve factor', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          this.lunchbreakSeats.connect(nonOwner).setCurveFactor(newCurveFactor)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Fee Divider', function () {
      const newFeeDivider = 25 // Changing the fee divider for example purposes

      it('should allow the owner to set a new fee divider', async function () {
        await this.lunchbreakSeats.setFeeDivider(newFeeDivider)
        expect(await this.lunchbreakSeats.feeDivider()).to.equal(newFeeDivider)
      })

      it('should not allow non-owner to set a new fee divider', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          this.lunchbreakSeats.connect(nonOwner).setFeeDivider(newFeeDivider)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })

    describe('Set Compensation Divider', function () {
      const newCompensationDivider = 15 // Example new value

      it('should allow the owner to set a new compensation divider', async function () {
        await this.lunchbreakSeats.setCompensationDivider(
          newCompensationDivider
        )
        expect(await this.lunchbreakSeats.compensationDivider()).to.equal(
          newCompensationDivider
        )
      })

      it('should not allow non-owner to set a new compensation divider', async function () {
        const [, nonOwner] = await ethers.getSigners()
        await expect(
          this.lunchbreakSeats
            .connect(nonOwner)
            .setCompensationDivider(newCompensationDivider)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'OwnableUnauthorizedAccount'
        )
      })
    })
  })

  describe('Ownership Transfer', function () {
    let newOwner

    beforeEach(async function () {
      ;[, newOwner] = await ethers.getSigners()
      await this.lunchbreakSeats.transferOwnership(newOwner.address)
      expect(await this.lunchbreakSeats.owner()).to.equal(newOwner.address)
    })

    it('new owner should be able to set fee divider', async function () {
      const newFeeDivider = 25
      await expect(
        this.lunchbreakSeats.connect(newOwner).setFeeDivider(newFeeDivider)
      ).not.to.be.reverted
      expect(await this.lunchbreakSeats.feeDivider()).to.equal(newFeeDivider)
    })

    it('previous owner should not have administrative rights', async function () {
      const newFeeDivider = 30
      await expect(
        this.lunchbreakSeats.setFeeDivider(newFeeDivider)
      ).to.be.revertedWithCustomError(
        this.lunchbreakSeats,
        'OwnableUnauthorizedAccount'
      )
    })
  })

  describe('Seat Management', function () {
    function calculatePriceOfToken(i: bigint) {
      return (24n * i ** 2n - 10n * i) * curveFactor + initialPrice
    }
    function calculateTotalCost(startToken: bigint, amount: bigint) {
      if (amount === 0n) return 0
      let totalCost = 0n
      for (let i = 0n; i < amount; i++) {
        totalCost += calculatePriceOfToken(startToken + i)
      }
      return totalCost
    }

    describe('Seat Math', function () {
      it('Should match the math functions', async function () {
        const cases = [
          [0n, 10n],
          [0n, 1n],
          [10n, 20n],
          [10n, 1n],
          [20n, 30n],
          [20n, 1n],
          [30n, 40n],
          [30n, 1n],
        ]
        for (const [startToken, amount] of cases) {
          const totalCost = await this.lunchbreakSeats.calculateTotalCost(
            startToken,
            amount
          )
          const totalCostJS = calculateTotalCost(startToken, amount)
          expect(totalCostJS).to.equal(totalCost)
        }
      })
    })

    describe('Seat Transactions', function () {
      let buyer, seller, buyer2, seller2, feeRecipient

      beforeEach(async function () {
        ;[, buyer, seller, buyer2, seller2, feeRecipient] =
          await ethers.getSigners()
        await this.lunchbreakSeats.setFeeRecipient(feeRecipient.address)
      })

      async function buySeats(
        lunchbreakSeats: LunchbreakSeats,
        amountToBuy: bigint,
        buyer: HardhatEthersSigner,
        seller: HardhatEthersSigner
      ) {
        // Get initial balances
        const initialBuyerBalance = await ethers.provider.getBalance(buyer)
        const initialSellerBalance = await ethers.provider.getBalance(seller)
        const initialFeeRecipientBalance = await ethers.provider.getBalance(
          await lunchbreakSeats.feeRecipient()
        )
        const initialSeatBalance = await lunchbreakSeats.balanceOf(
          seller.address,
          buyer.address
        )

        // Get total cost
        const supply = await lunchbreakSeats.supplyOf(seller.address)
        const totalCost = await lunchbreakSeats.calculateTotalCost(
          supply,
          amountToBuy
        )
        // Get fees
        const fee = totalCost / (await lunchbreakSeats.feeDivider())
        const compensation =
          totalCost / (await lunchbreakSeats.compensationDivider())
        // Buy seats
        const transactionResponse = await lunchbreakSeats
          .connect(buyer)
          .buySeats(seller.address, amountToBuy, { value: totalCost })
        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Buy transaction failed')
        }
        // Calculate the gas used for the purchase transaction
        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)
        // Check seat balance
        expect(
          await lunchbreakSeats.balanceOf(seller.address, buyer.address)
        ).to.equal(initialSeatBalance + amountToBuy)
        // Check ETH balances to verify correct fee and compensation distribution
        const finalBuyerBalance = await ethers.provider.getBalance(buyer)
        const finalSellerBalance = await ethers.provider.getBalance(seller)
        const finalFeeRecipientBalance = await ethers.provider.getBalance(
          await lunchbreakSeats.feeRecipient()
        )
        // Assertions to check the correctness of the fee and compensation distribution
        expect(finalBuyerBalance).to.equal(
          initialBuyerBalance - totalCost - gasUsed
        )
        expect(finalSellerBalance).to.equal(initialSellerBalance + compensation)
        expect(finalFeeRecipientBalance).to.equal(
          initialFeeRecipientBalance + fee
        )
      }

      async function sellSeats(
        lunchbreakSeats: LunchbreakSeats,
        amountToSell: bigint,
        holder: HardhatEthersSigner,
        user: HardhatEthersSigner
      ) {
        // Get initial balances
        const initialHolderBalance = await ethers.provider.getBalance(holder)
        const initialUserBalance = await ethers.provider.getBalance(user)
        const initialFeeRecipientBalance = await ethers.provider.getBalance(
          await lunchbreakSeats.feeRecipient()
        )
        const initialSeatBalance = await lunchbreakSeats.balanceOf(
          user.address,
          holder.address
        )

        // Get total cost
        const supply = await lunchbreakSeats.supplyOf(user.address)
        const totalCost = await lunchbreakSeats.calculateTotalCost(
          supply - amountToSell,
          amountToSell
        )
        // Get fees
        const initialFee = totalCost / (await lunchbreakSeats.feeDivider())
        const initialCompensation =
          totalCost / (await lunchbreakSeats.compensationDivider())
        const initialTotalCost = totalCost - initialFee - initialCompensation
        const fee = initialTotalCost / (await lunchbreakSeats.feeDivider())
        const compensation =
          initialTotalCost / (await lunchbreakSeats.compensationDivider())
        // Sell seats
        const transactionResponse = await lunchbreakSeats
          .connect(holder)
          .sellSeats(user.address, amountToSell)
        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Sell transaction failed')
        }
        // Calculate the gas used for the purchase transaction
        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)
        // Check seat balance
        expect(
          await lunchbreakSeats.balanceOf(user.address, holder.address)
        ).to.equal(initialSeatBalance - amountToSell)
        // Check ETH balances to verify correct fee and compensation distribution
        const finalHolderBalance = await ethers.provider.getBalance(holder)
        const finalUserBalance = await ethers.provider.getBalance(user)
        const finalFeeRecipientBalance = await ethers.provider.getBalance(
          await lunchbreakSeats.feeRecipient()
        )
        // Assertions to check the correctness of the fee and compensation distribution
        expect(finalHolderBalance).to.equal(
          initialHolderBalance +
            totalCost -
            (fee + compensation + initialFee + initialCompensation) -
            gasUsed
        )
        expect(finalUserBalance).to.equal(initialUserBalance + compensation)
        expect(finalFeeRecipientBalance).to.equal(
          initialFeeRecipientBalance + fee
        )
      }

      it('Should allow purchasing and selling fees', async function () {
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await sellSeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer2, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer2, seller)
        await sellSeats(this.lunchbreakSeats, 10n, buyer, seller)
        await sellSeats(this.lunchbreakSeats, 10n, buyer2, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer2, seller2)
        await sellSeats(this.lunchbreakSeats, 10n, buyer, seller)
        await sellSeats(this.lunchbreakSeats, 10n, buyer2, seller2)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer2, seller)
        await sellSeats(this.lunchbreakSeats, 5n, buyer, seller)
        await sellSeats(this.lunchbreakSeats, 5n, buyer2, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer, seller)
        await buySeats(this.lunchbreakSeats, 10n, buyer2, seller)
        await expect(
          sellSeats(this.lunchbreakSeats, 36n, buyer, seller)
        ).to.be.revertedWith('Not enough seats to sell')
        await expect(
          sellSeats(this.lunchbreakSeats, 26n, buyer2, seller)
        ).to.be.revertedWith('Not enough seats to sell')
      })
    })
  })
})
