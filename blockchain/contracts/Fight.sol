// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ICharacter.sol";
import "./ICryptoNYWallet.sol";
import "./IItems.sol";

contract CryptoNYJobs is Ownable {
    using SafeMath for uint256;

    uint256 public constant REGION = 0;

    address public contractOwner;
    address public characterContract;
    address public walletContract;
    address public itemsContract;

    constructor(
        address _charContract,
        address _walletContract,
        address _itemsContract
    ) {
        contractOwner = msg.sender;
        characterContract = _charContract;
        walletContract = _walletContract;
        itemsContract = _itemsContract;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            ICharacter(characterContract).ownerOf(characterId) == msg.sender,
            "Fight.characterOwner"
        );
        _;
    }

    modifier isCharacterInRegion(uint256 characterId) {
        require(
            ICharacter(characterContract).isCharacterInRegion(
                characterId,
                REGION
            ) == true,
            "Fight.characterInRegion"
        );
        _;
    }

    function attackCharacter(uint256 fromCharacterId, uint256 toCharacterId)
        public
        isCharacterOwner(fromCharacterId)
    {
        // Get fromCharacter
        // Get toCharacter

        // require both exist

        // require both are not the same character

        // require levels are similar

        //
        console.log(fromCharacterId, toCharacterId);
    }

    function _setWalletContract(address _walletContract) public {
        require(_walletContract != address(0), "Fight.setWalletContract");
        walletContract = _walletContract;
    }
}
