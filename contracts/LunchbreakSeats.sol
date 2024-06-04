//                                                                        ,-,
//                            *                      .                   /.(              .
//                                       \|/                             \ {
//    .                 _    .  ,   .    -*-       .                      `-`
//     ,'-.         *  / \_ *  / \_      /|\         *   /\'__        *.                 *
//    (____".         /    \  /    \,     __      .    _/  /  \  * .               .
//               .   /\/\  /\/ :' __ \_  /  \       _^/  ^/    `—./\    /\   .
//   *       _      /    \/  \  _/  \-‘\/  ` \ /\  /.' ^_   \_   .’\\  /_/\           ,'-.
//          /_\   /\  .-   `. \/     \ /.     /  \ ;.  _/ \ -. `_/   \/.   \   _     (____".    *
//     .   /   \ /  `-.__ ^   / .-'.--\      -    \/  _ `--./ .-'  `-/.     \ / \             .
//        /     /.       `.  / /       `.   /   `  .-'      '-._ `._         /.  \
// ~._,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'2_,-'
// ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~ ~~~~~~~~
// ~~    ~~~~    ~~~~     ~~~~   ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~~~    ~~
//     ~~     ~~      ~~      ~~      ~~      ~~      ~~      ~~       ~~     ~~      ~~      ~~
//                          ๐
//                                                                              _
//                                                  ₒ                         ><_>
//                                  _______     __      _______
//          .-'                    |   _  "\   |" \    /" _   "|                               ๐
//     '--./ /     _.---.          (. |_)  :)  ||  |  (: ( \___)
//     '-,  (__..-`       \        |:     \/   |:  |   \/ \
//        \          .     |       (|  _  \\   |.  |   //  \ ___
//         `,.__.   ,__.--/        |: |_)  :)  |\  |   (:   _(  _|
//           '._/_.'___.-`         (_______/   |__\|    \_______)                 ๐
//
//                  __   __  ___   __    __         __       ___         _______
//                 |"  |/  \|  "| /" |  | "\       /""\     |"  |       /"     "|
//      ๐          |'  /    \:  |(:  (__)  :)     /    \    ||  |      (: ______)
//                 |: /'        | \/      \/     /' /\  \   |:  |   ₒ   \/    |
//                  \//  /\'    | //  __  \\    //  __'  \   \  |___    // ___)_
//                  /   /  \\   |(:  (  )  :)  /   /  \\  \ ( \_|:  \  (:      "|
//                 |___/    \___| \__|  |__/  (___/    \___) \_______)  \_______)
//                                                                                     ₒ৹
//                          ___             __       _______     ________
//         _               |"  |     ₒ     /""\     |   _  "\   /"       )
//       ><_>              ||  |          /    \    (. |_)  :) (:   \___/
//                         |:  |         /' /\  \   |:     \/   \___  \
//                          \  |___     //  __'  \  (|  _  \\    __/  \\          \_____)\_____
//                         ( \_|:  \   /   /  \\  \ |: |_)  :)  /" \   :)         /--v____ __`<
//                          \_______) (___/    \___)(_______/  (_______/                  )/
//                                                                                        '
//
//            ๐                          .    '    ,                                           ₒ
//                         ₒ               _______
//                                 ____  .`_|___|_`.  ____
//                                        \ \   / /                        ₒ৹
//                                          \ ' /                         ๐
//   ₒ                                        \/
//                                   ₒ     /      \       )                                 (
//           (   ₒ৹               (                      (                                  )
//            )                   )               _      )                )                (
//           (        )          (       (      ><_>    (       (        (                  )
//     )      )      (     (      )       )              )       )        )         )      (
//    (      (        )     )    (       (              (       (        (         (        )
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract LunchbreakSeats is
  Initializable,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  // State

  struct Seats {
    mapping(address => uint256) balances;
    uint256 totalSupply;
  }

  struct SeatParameters {
    uint256 initialPrice;
    uint256 curveFactor;
    uint256 feeDivider;
    uint256 compensationDivider;
  }

  mapping(address => Seats) public seats;
  address public feeRecipient; // Address to receive fees
  uint256 public initialPrice; // Initial price of a seat
  uint256 public curveFactor; // Factor for the bonding curve
  uint256 public feeDivider; // 1 / fee
  uint256 public compensationDivider; // 1 / compensation
  mapping(address => SeatParameters) public seatParameters;

  mapping(address => address) public referrals;

  mapping(address => mapping(address => uint256[])) public messagesEscrows;
  mapping(address => mapping(address => bool[]))
    public completedMessagesEscrows;

  mapping(address => uint256) public withdrawableBalances;

  // Events

  event SeatsBought(
    address indexed user,
    address indexed buyer,
    uint256 amount,
    uint256 totalCost,
    uint256 fee
  );
  event SeatsSold(
    address indexed user,
    address indexed seller,
    uint256 amount,
    uint256 returnAmount,
    uint256 fee
  );
  event ReferralSet(address indexed user, address indexed referrer);
  event ReferralPaid(
    address indexed user,
    address indexed referrer,
    uint256 amount
  );
  event EscrowFunded(
    address indexed user,
    address indexed recipient,
    uint256 indexed index,
    uint256 amount
  );
  event EscrowWithdrawn(
    address indexed user,
    address indexed recipient,
    uint256 indexed index,
    uint256 amount
  );
  event EscrowReturned(
    address indexed user,
    address indexed recipient,
    uint256 indexed index,
    uint256 amount
  );
  event FundsWithdrawn(address indexed user, uint256 amount);

  // Initializer

  function initialize(
    address initialOwner,
    address _feeRecipient,
    uint256 _initialPrice,
    uint256 _curveFactor,
    uint256 _feeDivider,
    uint256 _compensationDivider
  ) public initializer {
    __Ownable_init(initialOwner);
    feeRecipient = _feeRecipient;
    initialPrice = _initialPrice;
    curveFactor = _curveFactor;
    feeDivider = _feeDivider;
    compensationDivider = _compensationDivider;
  }

  // Setters

  function setFeeRecipient(address _feeRecipient) public onlyOwner {
    feeRecipient = _feeRecipient;
  }

  function setInitialPrice(uint256 _initialPrice) public onlyOwner {
    initialPrice = _initialPrice;
  }

  function setCurveFactor(uint256 _curveFactor) public onlyOwner {
    curveFactor = _curveFactor;
  }

  function setFeeDivider(uint256 _feeDivider) public onlyOwner {
    feeDivider = _feeDivider;
  }

  function setCompensationDivider(
    uint256 _compensationDivider
  ) public onlyOwner {
    compensationDivider = _compensationDivider;
  }

  function setReferral(address user, address referrer) public onlyOwner {
    referrals[user] = referrer;
    emit ReferralSet(user, referrer);
  }

  // Getters

  function balanceOf(
    address user,
    address chairHolder
  ) public view returns (uint256) {
    return seats[user].balances[chairHolder];
  }

  function supplyOf(address user) public view returns (uint256) {
    return seats[user].totalSupply;
  }

  function escrowOf(
    address user,
    address recipient,
    uint256 index
  ) public view returns (uint256) {
    return messagesEscrows[user][recipient][index];
  }

  function withdrawableBalanceOf(address user) public view returns (uint256) {
    return withdrawableBalances[user];
  }

  // Modifiers

  modifier onlyExistingEscrow(
    address user,
    address recipient,
    uint256 index
  ) {
    if (index > messagesEscrows[user][recipient].length) {
      revert("Escrow does not exist");
    }
    if (index == messagesEscrows[user][recipient].length) {
      messagesEscrows[user][recipient].push(0);
      completedMessagesEscrows[user][recipient].push(false);
    }
    _;
  }

  modifier onlyUncompletedEscrow(
    address user,
    address recipient,
    uint256 index
  ) {
    require(
      !completedMessagesEscrows[user][recipient][index],
      "Escrow already completed"
    );
    _;
  }

  modifier nonZeroAmount(uint256 amount) {
    require(amount > 0, "Amount must be greater than 0");
    _;
  }

  // Seats logic

  function getCurveParameters(
    address user
  ) private returns (SeatParameters memory) {
    if (seatParameters[user].initialPrice == 0) {
      seatParameters[user] = SeatParameters(
        initialPrice,
        curveFactor,
        feeDivider,
        compensationDivider
      );
    }
    return seatParameters[user];
  }

  function distributeFees(
    address userA,
    address userB,
    uint256 totalFee,
    uint256 multiplier
  ) private {
    uint256 userAReferrerFee = 0;
    if (referrals[userA] != address(0)) {
      userAReferrerFee = (totalFee * multiplier) / 5;
      withdrawableBalances[referrals[userA]] += userAReferrerFee;
      emit ReferralPaid(userA, referrals[userA], userAReferrerFee);
    }
    uint256 userBReferrerFee = 0;
    if (referrals[userB] != address(0)) {
      userBReferrerFee = (totalFee * multiplier) / 5;
      withdrawableBalances[referrals[userB]] += userBReferrerFee;
      emit ReferralPaid(userB, referrals[userB], userBReferrerFee);
    }
    withdrawableBalances[feeRecipient] +=
      totalFee -
      userAReferrerFee -
      userBReferrerFee;
  }

  function buySeats(
    address user,
    uint256 amount
  ) public payable nonReentrant nonZeroAmount(amount) {
    SeatParameters memory userSeatParameters = getCurveParameters(user);

    uint256 totalCost = calculateTotalCost(
      seats[user].totalSupply,
      amount,
      userSeatParameters.curveFactor,
      userSeatParameters.initialPrice
    );
    uint256 fee = totalCost / userSeatParameters.feeDivider;
    uint256 compensation = totalCost / userSeatParameters.compensationDivider;
    require(msg.value >= totalCost, "Insufficient ETH sent");

    withdrawableBalances[user] += compensation;
    distributeFees(msg.sender, user, fee, 2);

    seats[user].balances[msg.sender] += amount;
    seats[user].totalSupply += amount;
    emit SeatsBought(user, msg.sender, amount, totalCost, fee);

    if (msg.value > totalCost) {
      (bool sent, ) = payable(msg.sender).call{value: msg.value - totalCost}(
        ""
      );
      require(sent, "Failed to send ETH");
    }
  }

  function sellSeats(
    address user,
    uint256 amount,
    uint256 minSellReturnAmount
  )
    public
    nonReentrant
    nonZeroAmount(amount)
    nonZeroAmount(minSellReturnAmount)
  {
    require(
      seats[user].balances[msg.sender] >= amount,
      "Not enough seats to sell"
    );

    SeatParameters memory userSeatParameters = getCurveParameters(user);

    uint256 returnAmount = calculateTotalCost(
      seats[user].totalSupply - amount,
      amount,
      userSeatParameters.curveFactor,
      userSeatParameters.initialPrice
    );
    require(returnAmount >= minSellReturnAmount, "Insufficient return amount");
    uint256 initialFee = returnAmount / userSeatParameters.feeDivider;
    uint256 initialCompensation = returnAmount /
      userSeatParameters.compensationDivider;
    returnAmount -= initialFee + initialCompensation;

    uint256 fee = returnAmount / userSeatParameters.feeDivider;
    uint256 compensation = returnAmount /
      userSeatParameters.compensationDivider;

    returnAmount -= fee + compensation;

    (bool sent, ) = payable(msg.sender).call{value: returnAmount}("");
    require(sent, "Failed to send ETH");

    withdrawableBalances[user] += compensation;
    distributeFees(msg.sender, user, fee, 2);

    seats[user].balances[msg.sender] -= amount;
    seats[user].totalSupply -= amount;
    emit SeatsSold(user, msg.sender, amount, returnAmount, fee);
  }

  // Messages escrow

  function fundEscrow(
    address user,
    address recipient,
    uint256 index
  )
    public
    payable
    nonReentrant
    onlyExistingEscrow(user, recipient, index)
    onlyUncompletedEscrow(user, recipient, index)
  {
    uint256 amount = msg.value;
    require(amount > 0, "No ETH sent");
    messagesEscrows[user][recipient][index] += amount;
    emit EscrowFunded(user, recipient, index, amount);
  }

  function withdrawEscrow(
    address user,
    address recipient,
    uint256 index
  )
    public
    nonReentrant
    onlyOwner
    onlyExistingEscrow(user, recipient, index)
    onlyUncompletedEscrow(user, recipient, index)
  {
    require(messagesEscrows[user][recipient][index] > 0, "No ETH in escrow");
    uint256 amount = messagesEscrows[user][recipient][index];
    messagesEscrows[user][recipient][index] = 0;
    uint256 fee = (amount * 2) / feeDivider;
    withdrawableBalances[recipient] += amount - fee;
    distributeFees(user, recipient, fee, 1);
    completedMessagesEscrows[user][recipient][index] = true;
    emit EscrowWithdrawn(user, recipient, index, amount);
  }

  function returnEscrow(
    address user,
    address recipient,
    uint256 index
  )
    public
    nonReentrant
    onlyOwner
    onlyExistingEscrow(user, recipient, index)
    onlyUncompletedEscrow(user, recipient, index)
  {
    require(messagesEscrows[user][recipient][index] > 0, "No ETH in escrow");
    uint256 amount = messagesEscrows[user][recipient][index];
    messagesEscrows[user][recipient][index] = 0;
    withdrawableBalances[user] += amount;
    completedMessagesEscrows[user][recipient][index] = true;
    emit EscrowReturned(user, recipient, index, amount);
  }

  // Withdrawing funds

  function withdraw(uint256 amount) public nonReentrant {
    require(amount > 0, "No ETH to withdraw");
    require(
      withdrawableBalances[msg.sender] >= amount,
      "Insufficient withdrawable balance"
    );
    withdrawableBalances[msg.sender] -= amount;
    (bool sent, ) = payable(msg.sender).call{value: amount}("");
    require(sent, "Failed to send ETH");
    emit FundsWithdrawn(msg.sender, amount);
  }

  // Bonding curve math

  function costOfToken(
    uint256 tokenId,
    uint256 _curveFactor,
    uint256 _initialPrice
  ) public pure returns (uint256) {
    // Bonding curve is 24x^2 - 10x
    return
      ((24 * tokenId ** 2) - (10 * tokenId)) * _curveFactor + _initialPrice;
  }

  function calculateTotalCost(
    uint256 startId,
    uint256 numTokens,
    uint256 _curveFactor,
    uint256 _initialPrice
  ) public pure returns (uint256) {
    uint256 totalCost = 0;
    uint256 endId = startId + numTokens;
    for (uint256 tokenId = startId; tokenId < endId; tokenId++) {
      totalCost += costOfToken(tokenId, _curveFactor, _initialPrice);
    }
    return totalCost;
  }
}
