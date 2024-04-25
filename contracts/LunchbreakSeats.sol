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

  mapping(address => Seats) seats;
  address public feeRecipient; // Address to receive fees
  uint256 feeDivider; // 1 / fee
  uint256 compensationDivider; // 1 / compensation

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

  // Initializer

  function initialize(
    address initialOwner,
    address _feeRecipient,
    uint256 _feeDivider,
    uint256 _compensationDivider
  ) public initializer {
    __Ownable_init(initialOwner);
    feeRecipient = _feeRecipient;
    feeDivider = _feeDivider;
    compensationDivider = _compensationDivider;
  }

  // Setters

  function setFeeRecipient(address _feeRecipient) public onlyOwner {
    feeRecipient = _feeRecipient;
  }

  function setFeeDivider(uint256 _feeDivider) public onlyOwner {
    feeDivider = _feeDivider;
  }

  function setCompensationDivider(
    uint256 _compensationDivider
  ) public onlyOwner {
    compensationDivider = _compensationDivider;
  }

  function buySeats(address user, uint256 amount) public payable nonReentrant {
    uint256 totalCost = calculateTotalCost(seats[user].totalSupply, amount);
    uint256 fee = totalCost / feeDivider;
    uint256 compensation = totalCost / compensationDivider;
    require(msg.value >= totalCost + fee, "Insufficient ETH sent");

    payable(feeRecipient).transfer(fee);
    payable(user).transfer(compensation);

    seats[user].balances[msg.sender] += amount;
    seats[user].totalSupply += amount;
    emit SeatsBought(user, msg.sender, amount, totalCost, fee);
  }

  function sellSeats(address user, uint256 amount) public nonReentrant {
    require(
      seats[user].balances[msg.sender] >= amount,
      "Not enough seats to sell"
    );

    uint256 returnAmount = calculateTotalCost(
      seats[user].totalSupply - amount,
      amount
    );
    uint256 fee = returnAmount / feeDivider;
    uint256 compensation = returnAmount / compensationDivider;
    returnAmount -= (fee + compensation);

    payable(msg.sender).transfer(returnAmount);
    payable(feeRecipient).transfer(fee);
    payable(user).transfer(compensation);

    seats[user].balances[msg.sender] -= amount;
    seats[user].totalSupply -= amount;
    emit SeatsSold(user, msg.sender, amount, returnAmount, fee);
  }

  // Bonding curve math

  // Bonding curve is 30x^2 - 30x
  // Integral of the bonding curve is 10x^3 - 15x^2
  function calculateIntegral(uint256 x) private pure returns (uint256) {
    return 10 * x ** 3 - 15 * x ** 2;
  }

  function calculateTotalCost(
    uint256 startToken,
    uint256 amount
  ) private pure returns (uint256) {
    if (amount == 0) return 0;
    uint256 endToken = startToken + amount - 1;
    return calculateIntegral(endToken + 1) - calculateIntegral(startToken);
  }
}
