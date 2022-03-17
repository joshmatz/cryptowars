// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./CryptoNYERC20.sol";
import "./Character.sol";

contract CryptoNYWallet is Ownable {
    using SafeMath for uint256;

    // Balances by character id
    mapping(uint256 => uint256) public balances;

    address public characterContract;
    address public currencyContract;

    mapping(address => bool) public gameContracts;

    constructor(address _characterContract, address _currencyContract) {
        characterContract = _characterContract;
        currencyContract = _currencyContract;
    }

    modifier isGameContract() {
        require(gameContracts[msg.sender], "isGameContract");
        _;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            CryptoChar(characterContract).ownerOf(characterId) == msg.sender,
            "CryptoNyWallet.characterOwner"
        );
        _;

        require(
            CryptoChar(characterContract).ownerOf(characterId) == msg.sender,
            "CryptoNyWallet.characterOwner"
        );
    }

    function addGameContract(address _contract) public onlyOwner {
        gameContracts[_contract] = true;
    }

    function withdrawToPlayer(uint256 characterId, uint256 amount)
        public
        isCharacterOwner(characterId)
    {
        require(amount <= balances[characterId], "CryptoNyWallet.balance");
        balances[characterId] = balances[characterId] - amount;

        CryptoNYERC20(currencyContract).burn(
            address(this),
            amount.mul(15).div(100)
        );
        CryptoNYERC20(currencyContract).transfer(
            msg.sender,
            amount.mul(85).div(100)
        );
    }

    function depositToCharacter(uint256 characterId, uint256 amount)
        public
        isCharacterOwner(characterId)
    {
        require(amount > 0, "CryptoNyWallet.invalidAmount");

        // Transfer to contract prior to adding
        // -- will do necessary checks
        // in the ERC 20 contract
        CryptoNYERC20(currencyContract).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        // the prior transfer will not be able to be re-entrant attacked
        // due to underlying guards in the underlying contract
        // solhint-disable-next-line
        balances[characterId] = balances[characterId] + amount;
    }

    function mintToCharacter(uint256 characterId, uint256 amount)
        public
        isGameContract
    {
        require(amount > 0, "CryptoNyWallet.invalidAmount");

        balances[characterId] = balances[characterId] + amount;
        CryptoNYERC20(currencyContract).mint(address(this), amount);
    }

    function burnFromCharacter(uint256 characterId, uint256 amount)
        public
        isGameContract
    {
        require(amount > 0, "CryptoNyWallet.invalidAmount");
        require(amount <= balances[characterId], "CryptoNyWallet.balance");

        balances[characterId] = balances[characterId] - amount;
        CryptoNYERC20(currencyContract).burn(address(this), amount);
    }
}
