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
import "./LunchbreakSeats.sol";

contract LunchbreakRegistry is
  Initializable,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  // State

  LunchbreakSeats public lunchbreakSeats;
  mapping(address => address) public registry;

  // Events
  event SetLunchbreakSeats(address indexed lunchbreakSeats);
  event Registered(address indexed wallet, address indexed lunchbreakWallet);

  // Initializer

  function initialize(address _lunchbreakSeats) public initializer {
    __Ownable_init(msg.sender);
    __ReentrancyGuard_init();
    lunchbreakSeats = LunchbreakSeats(_lunchbreakSeats);
  }

  // Setters

  function setLunchbreakSeats(address _lunchbreakSeats) public onlyOwner {
    lunchbreakSeats = LunchbreakSeats(_lunchbreakSeats);
    emit SetLunchbreakSeats(_lunchbreakSeats);
  }

  // Getters

  function balanceOf(
    address user,
    address chairHolder
  ) public view returns (uint256) {
    return lunchbreakSeats.balanceOf(user, registry[chairHolder]);
  }

  function cumulativeBalanceOf(
    address user,
    address chairHolder
  ) public view returns (uint256) {
    uint256 balance = 0;
    // Original balance
    balance += lunchbreakSeats.balanceOf(user, chairHolder);
    // Get variables
    address userRegistry = registry[user];
    address chairHolderRegistry = registry[chairHolder];
    // Chair holder registered
    if (chairHolderRegistry != address(0)) {
      balance += lunchbreakSeats.balanceOf(user, chairHolderRegistry);
      // And user registered
      if (userRegistry != address(0)) {
        balance += lunchbreakSeats.balanceOf(userRegistry, chairHolderRegistry);
      }
    }
    // User registered
    if (userRegistry != address(0)) {
      balance += lunchbreakSeats.balanceOf(userRegistry, chairHolder);
      // And chair holder registered
      if (chairHolderRegistry != address(0)) {
        balance += lunchbreakSeats.balanceOf(userRegistry, chairHolderRegistry);
      }
    }
    return balance;
  }

  // Registry logic

  function register(address wallet, address lunchbreakWallet) public onlyOwner {
    registry[lunchbreakWallet] = wallet;
    emit Registered(wallet, lunchbreakWallet);
  }
}
