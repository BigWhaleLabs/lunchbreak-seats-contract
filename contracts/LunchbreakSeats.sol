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
  struct Seats {
    mapping(address => uint256) balances;
    uint256 totalSupply;
  }

  mapping(address => Seats) seats;

  event SeatsBought(
    address indexed user,
    address indexed buyer,
    uint256 amount
  );
  event SeatsSold(address indexed user, address indexed seller, uint256 amount);

  function initialize(address initialOwner) public initializer {
    __Ownable_init(initialOwner);
  }

  function buySeats(address user, uint256 amount) public nonReentrant {
    seats[user].balances[msg.sender] += amount;
    seats[user].totalSupply += amount;
    emit SeatsBought(user, msg.sender, amount);
  }

  function sellSeats(address user, uint256 amount) public nonReentrant {
    require(
      seats[user].balances[msg.sender] >= amount,
      "Not enough seats to sell"
    );
    seats[user].balances[msg.sender] -= amount;
    seats[user].totalSupply -= amount;
    emit SeatsSold(user, msg.sender, amount);
  }
}
