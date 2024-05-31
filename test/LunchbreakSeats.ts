import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { LunchbreakSeats } from 'typechain'
import { ethers, upgrades } from 'hardhat'
import { expect } from 'chai'

describe('LunchbreakSeats contract tests', () => {
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

    describe('Seat Transactions with Referrals', function () {
      let buyer, seller, buyerReferral, sellerReferral, feeRecipient

      beforeEach(async function () {
        ;[, buyer, seller, buyerReferral, sellerReferral, feeRecipient] =
          await ethers.getSigners()
        await this.lunchbreakSeats.setFeeRecipient(feeRecipient.address)
        // Set referrals
        await this.lunchbreakSeats.setReferral(
          buyer.address,
          buyerReferral.address
        )
        await this.lunchbreakSeats.setReferral(
          seller.address,
          sellerReferral.address
        )
      })

      async function buySeatsWithReferral(
        lunchbreakSeats,
        amountToBuy,
        buyer,
        seller,
        buyerReferral,
        sellerReferral
      ) {
        // Get initial balances
        const initialBuyerBalance = await ethers.provider.getBalance(
          buyer.address
        )
        const initialSellerBalance = await ethers.provider.getBalance(
          seller.address
        )
        const initialBuyerReferralBalance = await ethers.provider.getBalance(
          buyerReferral.address
        )
        const initialSellerReferralBalance = await ethers.provider.getBalance(
          sellerReferral.address
        )
        const initialFeeRecipientBalance = await ethers.provider.getBalance(
          feeRecipient.address
        )

        // Get total cost
        const supply: bigint = await lunchbreakSeats.supplyOf(seller.address)
        const totalCost: bigint = await lunchbreakSeats.calculateTotalCost(
          supply,
          amountToBuy
        )
        const fee = totalCost / (await lunchbreakSeats.feeDivider())
        const referralFee = (fee * 2n) / 5n
        const compensation =
          totalCost / (await lunchbreakSeats.compensationDivider())

        // Buyer initiates purchase
        const transactionResponse = await lunchbreakSeats
          .connect(buyer)
          .buySeats(seller.address, amountToBuy, { value: totalCost })
        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }
        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)

        // Check new balances
        const finalBuyerBalance = await ethers.provider.getBalance(
          buyer.address
        )
        const finalSellerBalance = await ethers.provider.getBalance(
          seller.address
        )
        const finalBuyerReferralBalance = await ethers.provider.getBalance(
          buyerReferral.address
        )
        const finalSellerReferralBalance = await ethers.provider.getBalance(
          sellerReferral.address
        )
        const finalFeeRecipientBalance = await ethers.provider.getBalance(
          feeRecipient.address
        )

        expect(finalBuyerReferralBalance).to.equal(
          initialBuyerReferralBalance + referralFee
        )
        expect(finalSellerReferralBalance).to.equal(
          initialSellerReferralBalance + referralFee
        )
        expect(finalFeeRecipientBalance).to.equal(
          initialFeeRecipientBalance + fee - 2n * referralFee
        )
        expect(finalBuyerBalance).to.equal(
          initialBuyerBalance - totalCost - gasUsed
        )
        expect(finalSellerBalance).to.equal(initialSellerBalance + compensation)
      }

      async function sellSeatsWithReferral(
        lunchbreakSeats,
        amountToSell,
        holder,
        user,
        holderReferral,
        userReferral
      ) {
        // Get initial balances
        const initialHolderBalance = await ethers.provider.getBalance(
          holder.address
        )
        const initialUserBalance = await ethers.provider.getBalance(
          user.address
        )
        const initialHolderReferralBalance = await ethers.provider.getBalance(
          holderReferral.address
        )
        const initialUserReferralBalance = await ethers.provider.getBalance(
          userReferral.address
        )
        const initialFeeRecipientBalance = await ethers.provider.getBalance(
          feeRecipient.address
        )

        // Get total return amount
        const supply: bigint = await lunchbreakSeats.supplyOf(user.address)
        let totalReturn: bigint = await lunchbreakSeats.calculateTotalCost(
          supply - amountToSell,
          amountToSell
        )
        const initialFee = totalReturn / (await lunchbreakSeats.feeDivider())
        const initialCompensation =
          totalReturn / (await lunchbreakSeats.compensationDivider())
        totalReturn -= initialFee + initialCompensation

        const fee = totalReturn / (await lunchbreakSeats.feeDivider())
        const referralFee = (fee * 2n) / 5n // 40% of the fee is distributed as referral fees
        const compensation =
          totalReturn / (await lunchbreakSeats.compensationDivider())

        // Holder initiates selling
        const transactionResponse = await lunchbreakSeats
          .connect(holder)
          .sellSeats(user.address, amountToSell)
        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }
        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)

        // Check new balances
        const finalHolderBalance = await ethers.provider.getBalance(
          holder.address
        )
        const finalUserBalance = await ethers.provider.getBalance(user.address)
        const finalHolderReferralBalance = await ethers.provider.getBalance(
          holderReferral.address
        )
        const finalUserReferralBalance = await ethers.provider.getBalance(
          userReferral.address
        )
        const finalFeeRecipientBalance = await ethers.provider.getBalance(
          feeRecipient.address
        )

        expect(finalHolderReferralBalance).to.equal(
          initialHolderReferralBalance + referralFee
        )
        expect(finalUserReferralBalance).to.equal(
          initialUserReferralBalance + referralFee
        )
        expect(finalFeeRecipientBalance).to.equal(
          initialFeeRecipientBalance + fee - 2n * referralFee
        )
        expect(finalHolderBalance).to.equal(
          initialHolderBalance + totalReturn - fee - compensation - gasUsed
        )
        expect(finalUserBalance).to.equal(initialUserBalance + compensation)
      }

      it('Should handle referrals correctly when trading seats', async function () {
        await buySeatsWithReferral(
          this.lunchbreakSeats,
          10n,
          buyer,
          seller,
          buyerReferral,
          sellerReferral
        )
        await sellSeatsWithReferral(
          this.lunchbreakSeats,
          10n,
          buyer,
          seller,
          buyerReferral,
          sellerReferral
        )
        await buySeatsWithReferral(
          this.lunchbreakSeats,
          10n,
          buyer,
          seller,
          buyerReferral,
          sellerReferral
        )
        await sellSeatsWithReferral(
          this.lunchbreakSeats,
          1n,
          buyer,
          seller,
          buyerReferral,
          sellerReferral
        )
      })
    })
  })
})
