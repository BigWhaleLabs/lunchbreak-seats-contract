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
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./LunchbreakSeats.sol";

contract LunchbreakSeatsWrapper is
  Initializable,
  ERC1155Upgradeable,
  ERC1155BurnableUpgradeable,
  ERC1155PausableUpgradeable,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  // State
  address public seats;

  // Errors

  error NotEnoughTokens(uint256 amount);
  error InsufficientReturnAmount(
    uint256 returnAmount,
    uint256 minSellReturnAmount
  );
  error SendingSellReturnFailed(
    address user,
    uint256 returnAmount,
    uint256 totalCost
  );

  // Events

  event TokensMinted(address indexed account, uint256 amount);
  event TokensBurned(address indexed account, uint256 amount);
  event SeatsSet(address newSeats);

  // Initializer

  function initialize(
    address initialOwner,
    string memory uri
  ) public initializer {
    __Ownable_init(initialOwner);
    __ReentrancyGuard_init();
    __ERC1155_init(uri);
    __Pausable_init();
  }

  // Setters

  function setSeats(address newSeats) public onlyOwner nonReentrant {
    seats = newSeats;
    emit SeatsSet(newSeats);
  }

  // Minting

  function mintTokens(
    address user,
    uint256 amount
  ) public payable whenNotPaused nonReentrant {
    LunchbreakSeats(seats).buySeats{value: msg.value}(user, amount);
    _mint(msg.sender, uint256(uint160(user)), amount, "");
    emit TokensMinted(msg.sender, amount);
  }

  // Burning

  function burnTokens(
    address user,
    uint256 amount,
    uint256 minSellReturnAmount
  ) public nonReentrant {
    uint256 tokenId = uint256(uint160(user));
    LunchbreakSeats seatsContract = LunchbreakSeats(seats);
    if (balanceOf(msg.sender, tokenId) < amount) {
      revert NotEnoughTokens(amount);
    }
    _burn(msg.sender, tokenId, amount);
    emit TokensBurned(msg.sender, amount);
    LunchbreakSeats.SeatParameters memory userSeatParameters = seatsContract
      .getCurveParameters(user);
    uint256 returnAmount = seatsContract.calculateTotalCost(
      seatsContract.supplyOf(user) - amount,
      amount,
      userSeatParameters.curveFactor,
      userSeatParameters.initialPrice
    );
    if (returnAmount < minSellReturnAmount) {
      revert InsufficientReturnAmount(returnAmount, minSellReturnAmount);
    }
    uint256 initialFee = (returnAmount + userSeatParameters.feeDivider - 1) /
      userSeatParameters.feeDivider;
    uint256 initialCompensation = (returnAmount +
      userSeatParameters.compensationDivider -
      1) / userSeatParameters.compensationDivider;
    returnAmount -= initialFee + initialCompensation;
    uint256 fee = returnAmount / userSeatParameters.feeDivider;
    uint256 compensation = returnAmount /
      userSeatParameters.compensationDivider;
    returnAmount -= fee + compensation;
    seatsContract.sellSeats(user, amount, minSellReturnAmount);
    (bool sent, ) = payable(msg.sender).call{value: returnAmount}("");
    if (!sent) {
      revert SendingSellReturnFailed(user, amount, returnAmount);
    }
  }

  // The following functions are overrides required by Solidity.

  function _update(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory values
  ) internal override(ERC1155Upgradeable, ERC1155PausableUpgradeable) {
    super._update(from, to, ids, values);
  }
}
