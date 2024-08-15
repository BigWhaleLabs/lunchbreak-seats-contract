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

contract LunchbreakScoutPass is
  Initializable,
  ERC1155Upgradeable,
  ERC1155BurnableUpgradeable,
  ERC1155PausableUpgradeable,
  OwnableUpgradeable,
  ReentrancyGuardUpgradeable
{
  // State

  uint256 public tokenId;
  uint256 public rate;
  address public seats;

  // Errors

  error WrongEtherValueSent(uint256 amount);
  error FailedToWithdrawETH(address user, uint256 amount);
  error WrongRate(uint256 rate);
  error NotEnoughTokens(uint256 amount);

  // Events

  event TokensMinted(address indexed account, uint256 amount);
  event AmountWithdrawn(address indexed account, uint256 amount);
  event RateSet(uint256 newRate);
  event URISet(string newURI);
  event TokenIdSet(uint256 newTokenId);
  event TokensBurned(address indexed account, uint256 amount);
  event SeatsSet(address newSeats);

  // Initializer

  function initialize(
    address initialOwner,
    uint256 initialTokenId,
    uint256 initialRate,
    string memory uri
  ) public initializer {
    __Ownable_init(initialOwner);
    __ReentrancyGuard_init();
    __ERC1155_init(uri);
    __Pausable_init();

    tokenId = initialTokenId;
    rate = initialRate;
  }

  // Setters

  function setRate(uint256 newRate) public onlyOwner nonReentrant {
    if (newRate == 0) {
      revert WrongRate(newRate);
    }
    rate = newRate;
    emit RateSet(newRate);
  }

  function setURI(string memory newURI) public onlyOwner nonReentrant {
    _setURI(newURI);
    emit URISet(newURI);
  }

  function setTokenId(uint256 newTokenId) public onlyOwner nonReentrant {
    tokenId = newTokenId;
    emit TokenIdSet(newTokenId);
  }

  function setSats(address newSeats) public onlyOwner nonReentrant {
    seats = newSeats;
    emit SeatsSet(newSeats);
  }

  // Utils

  function pause() public onlyOwner nonReentrant {
    _pause();
  }

  function unpause() public onlyOwner nonReentrant {
    _unpause();
  }

  // Minting

  function mintTokens() public payable whenNotPaused nonReentrant {
    // Checks
    if (msg.value % rate != 0) {
      revert WrongEtherValueSent(msg.value);
    }
    // Effects
    uint256 tokenAmount = msg.value / rate;
    _mint(msg.sender, tokenId, tokenAmount, "");
    emit TokensMinted(msg.sender, tokenAmount);
  }

  // Burning

  function burnTokens(uint256 amount) public nonReentrant {
    // Checks
    if (balanceOf(msg.sender, tokenId) < amount) {
      revert NotEnoughTokens(amount);
    }
    // Effects
    _burn(msg.sender, tokenId, amount);
    emit TokensBurned(msg.sender, amount);
    // Interactions
    (bool sent, ) = payable(msg.sender).call{value: rate * amount}("");
    if (!sent) {
      revert FailedToWithdrawETH(msg.sender, amount);
    }
  }

  function burnTokenAndBuySeat(address user) public payable nonReentrant {
    // Checks
    if (balanceOf(msg.sender, tokenId) < 1) {
      revert NotEnoughTokens(1);
    }
    // Effects
    _burn(msg.sender, tokenId, 1);
    emit TokensBurned(msg.sender, 1);
    // Interactions
    LunchbreakSeats(seats).buySeats{value: msg.value}(user, 1);
  }

  receive() external payable {
    mintTokens();
  }

  // Admin function to withdraw the contract's balance

  function withdraw(uint256 amount) public onlyOwner nonReentrant {
    (bool sent, ) = payable(msg.sender).call{value: amount}("");
    if (!sent) {
      revert FailedToWithdrawETH(msg.sender, amount);
    }
    emit AmountWithdrawn(msg.sender, amount);
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
