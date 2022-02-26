// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CryptoNYItems is ERC721, ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    enum ItemClass {
        WEAPON
    }

    struct Item {
        ItemClass class;
        uint256 attack;
        uint256 defense;
        uint256 buyPrice;
        uint256 sellPrice;
    }

    struct OwnedItems {
        uint256 total;
    }

    Item[] public itemTypes;
    address public contractOwner;
    address public characterContract;

    constructor(address charContract) ERC721("CryptoNY", "CNY") {
        contractOwner = msg.sender;
        characterContract = charContract;
    }

    function relinquishControl() external {
        require(
            contractOwner == msg.sender,
            "CryptoChar.relinquishControl.owner"
        );
        contractOwner = address(0);
    }

    function _createItemType(
        uint256 _class,
        uint256 _attack,
        uint256 _defense,
        uint256 _buyPrice,
        uint256 _sellPrice
    ) private {
        itemTypes.push(
            Item(ItemClass(_class), _attack, _defense, _buyPrice, _sellPrice)
        );
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
