// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CryptoNYERC20 is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    // solhint-disable-next-line
    constructor() ERC20("CryptoWars $", "CW$") {}

    // TODO: Maybe add a function topUp() to re-approve wallet contract
    // in the event so many tokens swapped...

    function mint(address to, uint256 amount) public onlyOwner nonReentrant {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner nonReentrant {
        _burn(from, amount);
    }
}
