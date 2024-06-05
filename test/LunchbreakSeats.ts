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
            amount,
            await this.lunchbreakSeats.curveFactor(),
            await this.lunchbreakSeats.initialPrice()
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
        const initialSellerWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(seller)
        const initialFeeWithdrawableRecipientBalance =
          await lunchbreakSeats.withdrawableBalances(
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
          amountToBuy,
          await lunchbreakSeats.curveFactor(),
          await lunchbreakSeats.initialPrice()
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
        const finalSellerWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(seller)
        const finalFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(
            await lunchbreakSeats.feeRecipient()
          )
        // Assertions to check the correctness of the fee and compensation distribution
        expect(finalBuyerBalance).to.equal(
          initialBuyerBalance - totalCost - gasUsed
        )
        expect(finalSellerWithdrawableBalance).to.equal(
          initialSellerWithdrawableBalance + compensation
        )
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeWithdrawableRecipientBalance + fee
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
        const initialUserWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(user)
        const initialFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(
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
          amountToSell,
          await lunchbreakSeats.curveFactor(),
          await lunchbreakSeats.initialPrice()
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
          .sellSeats(user.address, amountToSell, totalCost)
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
        const finalUserWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(user)
        const finalFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(
            await lunchbreakSeats.feeRecipient()
          )
        // Assertions to check the correctness of the fee and compensation distribution
        expect(finalHolderBalance).to.equal(
          initialHolderBalance +
            totalCost -
            (fee + compensation + initialFee + initialCompensation) -
            gasUsed
        )
        expect(finalUserWithdrawableBalance).to.equal(
          initialUserWithdrawableBalance + compensation
        )
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeRecipientWithdrawableBalance + fee
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
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'InsufficientSeatsToSell'
        )
        await expect(
          sellSeats(this.lunchbreakSeats, 26n, buyer2, seller)
        ).to.be.revertedWithCustomError(
          this.lunchbreakSeats,
          'InsufficientSeatsToSell'
        )
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
        const initialSellerWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(seller.address)
        const initialBuyerReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(buyerReferral.address)
        const initialSellerReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(sellerReferral.address)
        const initialFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(feeRecipient.address)

        // Get total cost
        const supply: bigint = await lunchbreakSeats.supplyOf(seller.address)
        const totalCost: bigint = await lunchbreakSeats.calculateTotalCost(
          supply,
          amountToBuy,
          await lunchbreakSeats.curveFactor(),
          await lunchbreakSeats.initialPrice()
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
        const finalSellerWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(seller.address)
        const finalBuyerReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(buyerReferral.address)
        const finalSellerReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(sellerReferral.address)
        const finalFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(feeRecipient.address)

        expect(finalBuyerReferralWithdrawableBalance).to.equal(
          initialBuyerReferralWithdrawableBalance + referralFee
        )
        expect(finalSellerReferralWithdrawableBalance).to.equal(
          initialSellerReferralWithdrawableBalance + referralFee
        )
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeRecipientWithdrawableBalance + fee - 2n * referralFee
        )
        expect(finalBuyerBalance).to.equal(
          initialBuyerBalance - totalCost - gasUsed
        )
        expect(finalSellerWithdrawableBalance).to.equal(
          initialSellerWithdrawableBalance + compensation
        )
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
        const initialUserWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(user.address)
        const initialHolderReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(holderReferral.address)
        const initialUserReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(userReferral.address)
        const initialFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(feeRecipient.address)

        // Get total return amount
        const supply: bigint = await lunchbreakSeats.supplyOf(user.address)
        let totalReturn: bigint = await lunchbreakSeats.calculateTotalCost(
          supply - amountToSell,
          amountToSell,
          await lunchbreakSeats.curveFactor(),
          await lunchbreakSeats.initialPrice()
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
          .sellSeats(user.address, amountToSell, totalReturn)
        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }
        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)

        // Check new balances
        const finalHolderBalance = await ethers.provider.getBalance(
          holder.address
        )
        const finalUserWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(user.address)
        const finalHolderReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(holderReferral.address)
        const finalUserReferralWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(userReferral.address)
        const finalFeeRecipientWithdrawableBalance =
          await lunchbreakSeats.withdrawableBalances(feeRecipient.address)

        expect(finalHolderReferralWithdrawableBalance).to.equal(
          initialHolderReferralWithdrawableBalance + referralFee
        )
        expect(finalUserReferralWithdrawableBalance).to.equal(
          initialUserReferralWithdrawableBalance + referralFee
        )
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeRecipientWithdrawableBalance + fee - 2n * referralFee
        )
        expect(finalHolderBalance).to.equal(
          initialHolderBalance + totalReturn - fee - compensation - gasUsed
        )
        expect(finalUserWithdrawableBalance).to.equal(
          initialUserWithdrawableBalance + compensation
        )
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

  describe('Message Escrow Tests without Referrals', function () {
    let owner, user, recipient

    beforeEach(async function () {
      ;[owner, user, recipient] = await ethers.getSigners()
    })

    describe('Fund Escrow', function () {
      it('should correctly deposit funds into escrow', async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user.address
        )
        const initialRecipientBalance = await ethers.provider.getBalance(
          recipient.address
        )
        const depositAmount = ethers.parseEther('1.0')
        const transactionResponse = await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })

        const finalUserBalance = await ethers.provider.getBalance(user.address)
        const finalRecipientBalance = await ethers.provider.getBalance(
          recipient.address
        )

        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }

        const escrowBalance = await this.lunchbreakSeats[
          'escrowOf(address,address,uint256)'
        ](user.address, recipient.address, 0)

        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)
        expect(escrowBalance).to.equal(depositAmount)
        expect(finalUserBalance).to.equal(
          initialUserBalance - depositAmount - gasUsed
        )
        expect(finalRecipientBalance).to.equal(initialRecipientBalance)
      })

      it('should accumulate multiple deposits in escrow correctly', async function () {
        const firstDeposit = ethers.parseEther('0.5')
        const secondDeposit = ethers.parseEther('0.3')

        await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: firstDeposit,
          })
        await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: secondDeposit,
          })

        const totalDeposit = firstDeposit + secondDeposit
        expect(
          await this.lunchbreakSeats['escrowOf(address,address,uint256)'](
            user.address,
            recipient.address,
            0
          )
        ).to.equal(totalDeposit)
      })
    })

    describe('Withdraw Escrow', function () {
      it('should allow the owner to withdraw funds from escrow', async function () {
        const initialFeeRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            await this.lunchbreakSeats.feeRecipient()
          )
        const initialRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)

        const depositAmount = ethers.parseEther('1.0')
        await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })

        await this.lunchbreakSeats
          .connect(owner)
          .withdrawEscrow(user.address, recipient.address, 0)

        const finalFeeRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            await this.lunchbreakSeats.feeRecipient()
          )

        const finalRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)

        expect(
          await this.lunchbreakSeats['escrowOf(address,address,uint256)'](
            user.address,
            recipient.address,
            0
          )
        ).to.equal(0)
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeRecipientWithdrawableBalance + depositAmount / 10n
        )
        expect(finalRecipientWithdrawableBalance).to.equal(
          initialRecipientWithdrawableBalance + (depositAmount * 9n) / 10n
        )
      })

      it('should fail when trying to withdraw more than available in escrow', async function () {
        await expect(
          this.lunchbreakSeats
            .connect(owner)
            .withdrawEscrow(user.address, recipient.address, 0)
        ).to.be.revertedWithCustomError(this.lunchbreakSeats, 'NoETHInEscrow')
      })
    })

    describe('Return Escrow', function () {
      it('should allow the owner to return funds to the sender', async function () {
        const depositAmount = ethers.parseEther('1.0')
        await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })

        const initialUserWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(user.address)

        await this.lunchbreakSeats
          .connect(owner)
          .returnEscrow(user.address, recipient.address, 0)

        const finalUserWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(user.address)

        expect(finalUserWithdrawableBalance).to.equal(
          initialUserWithdrawableBalance + depositAmount
        )

        expect(
          await this.lunchbreakSeats['escrowOf(address,address,uint256)'](
            user.address,
            recipient.address,
            0
          )
        ).to.equal(0)
      })
    })
  })

  describe('Message Escrow Tests with Referrals', function () {
    let owner, user, recipient, referrerUser, referrerRecipient

    beforeEach(async function () {
      ;[owner, user, recipient, referrerUser, referrerRecipient] =
        await ethers.getSigners()
      await this.lunchbreakSeats.setReferral(user.address, referrerUser.address)
      await this.lunchbreakSeats.setReferral(
        recipient.address,
        referrerRecipient.address
      )
    })

    describe('Fund Escrow with Referral', function () {
      it('should be no fees on deposit', async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user.address
        )
        const initialRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)
        const depositAmount = ethers.parseEther('1.0')
        const transactionResponse = await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })

        const finalUserBalance = await ethers.provider.getBalance(user.address)
        const finalRecipientBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)

        const receipt = await transactionResponse.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }

        const escrowBalance = await this.lunchbreakSeats[
          'escrowOf(address,address,uint256)'
        ](user.address, recipient.address, 0)

        const gasUsed = BigInt(receipt.gasUsed * receipt.gasPrice)
        expect(escrowBalance).to.equal(depositAmount)
        expect(finalUserBalance).to.equal(
          initialUserBalance - depositAmount - gasUsed
        )
        expect(finalRecipientBalance).to.equal(
          initialRecipientWithdrawableBalance
        )
      })
    })

    describe('Withdraw Escrow with Referral', function () {
      it('should distribute referral fees on withdrawal', async function () {
        const initialRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)
        const initialUserBalance = await ethers.provider.getBalance(
          user.address
        )
        const initialFeeRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            await this.lunchbreakSeats.feeRecipient()
          )
        const initialUserReferralWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(referrerUser.address)
        const initialRecipientReferralWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            referrerRecipient.address
          )

        const depositAmount = ethers.parseEther('1.0')
        const depositTxResponse = await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })
        const depositTxReceipt = await depositTxResponse.wait()
        const depositGas = BigInt(
          depositTxReceipt.gasUsed * depositTxReceipt.gasPrice
        )

        await this.lunchbreakSeats
          .connect(owner)
          .withdrawEscrow(user.address, recipient.address, 0)

        const feeRecipientFee = (depositAmount * 6n) / 100n
        const userReferrerFee = (depositAmount * 2n) / 100n
        const recipientReferrerFee = (depositAmount * 2n) / 100n

        const finalRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(recipient.address)
        const finalUserBalance = await ethers.provider.getBalance(user.address)
        const finalFeeRecipientWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            await this.lunchbreakSeats.feeRecipient()
          )
        const finalUserReferralWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(referrerUser.address)
        const finalRecipientReferralWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(
            referrerRecipient.address
          )

        expect(finalRecipientWithdrawableBalance).to.equal(
          initialRecipientWithdrawableBalance +
            depositAmount -
            feeRecipientFee -
            userReferrerFee -
            recipientReferrerFee
        )
        expect(finalUserBalance).to.equal(
          initialUserBalance - depositAmount - depositGas
        )
        expect(finalFeeRecipientWithdrawableBalance).to.equal(
          initialFeeRecipientWithdrawableBalance + feeRecipientFee
        )
        expect(finalUserReferralWithdrawableBalance).to.equal(
          initialUserReferralWithdrawableBalance + userReferrerFee
        )
        expect(finalRecipientReferralWithdrawableBalance).to.equal(
          initialRecipientReferralWithdrawableBalance + recipientReferrerFee
        )
      })
    })

    describe('Return Escrow with Referral', function () {
      it('should not distribute referral fees on return', async function () {
        const depositAmount = ethers.parseEther('1.0')
        await this.lunchbreakSeats
          .connect(user)
          .fundEscrow(user.address, recipient.address, 0, {
            value: depositAmount,
          })

        const initialUserWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(user.address)

        await this.lunchbreakSeats
          .connect(owner)
          .returnEscrow(user.address, recipient.address, 0)

        const finalUserWithdrawableBalance =
          await this.lunchbreakSeats.withdrawableBalances(user.address)

        expect(finalUserWithdrawableBalance).to.equal(
          initialUserWithdrawableBalance + depositAmount
        )

        expect(
          await this.lunchbreakSeats['escrowOf(address,address,uint256)'](
            user.address,
            recipient.address,
            0
          )
        ).to.equal(0)
      })
    })
  })
})
