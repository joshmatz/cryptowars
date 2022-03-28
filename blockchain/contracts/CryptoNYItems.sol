// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./ICharacter.sol";

contract CryptoNYItems is ERC721, ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    event CharacterMint(uint256 _characterId, uint256 _itemTypeId);

    address public characterContract;

    enum ItemClass {
        IS_NOT_SET,
        WEAPON,
        ARMOR,
        VEHICLE,
        SHILL,
        BOOST,
        CONSUMABLE
    }

    // TODO: Reward items guaranteed
    enum ItemRarity {
        IS_NOT_SET,
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY
    }

    uint256 public currentTokenId = 0;
    uint256[] public itemRarityWeights = [0, 850, 925, 970, 990, 999];

    struct ItemType {
        ItemClass class;
        uint256 attack;
        uint256 defense;
        ItemRarity rarity;
    }

    struct OwnedItem {
        uint256 itemTypeId;
        uint256 characterId;
        bool equipped;
    }

    // Describes the minted itemId
    // items[itemId] = OwnedItem
    mapping(uint256 => OwnedItem) public ownedItems;

    // itemTypes[itemTypeId] = available item types in game
    mapping(uint256 => ItemType) public itemTypes;
    uint256 public totalItemTypes = 0;

    // totalItemTypeSupply[itemTypeId] = total supply of a particular item type
    mapping(uint256 => uint256) public totalItemTypeSupply;

    //characterItems[characterId] = Set of itemTypeIds owned by character
    mapping(uint256 => EnumerableSet.UintSet) private characterItemTypes;

    //characterItems[characterId][itemTypeId] = set of itemIds owned by character
    mapping(uint256 => mapping(uint256 => EnumerableSet.UintSet))
        private characterItems;

    mapping(uint256 => mapping(uint256 => EnumerableSet.UintSet))
        private characterEquippedItems;

    // unequipped items

    mapping(address => bool) public gameContracts;

    constructor(address charContract) ERC721("CryptoNY", "CNY") {
        gameContracts[charContract] = true;
        characterContract = charContract;
    }

    modifier isGameContract() {
        require(gameContracts[msg.sender], "isGameContract");
        _;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            ICharacter(characterContract).ownerOf(characterId) == msg.sender,
            "CryptoNyJobs.characterOwner"
        );
        _;
    }

    function characterItemTypeListLength(uint256 characterId)
        public
        view
        returns (uint256)
    {
        return characterItemTypes[characterId].length();
    }

    function characterItemType(uint256 characterId, uint256 itemTypeIndex)
        public
        view
        returns (uint256)
    {
        return characterItemTypes[characterId].at(itemTypeIndex);
    }

    function characterItemSupply(uint256 characterId, uint256 itemTypeId)
        public
        view
        returns (uint256)
    {
        return characterItems[characterId][itemTypeId].length();
    }

    function characterItem(
        uint256 characterId,
        uint256 itemTypeId,
        uint256 itemIndex
    ) public view returns (uint256) {
        return characterItems[characterId][itemTypeId].at(itemIndex);
    }

    // _rewardData = [job.rewardItemIds[i], characterId, newExp, runs]
    function rewardItemToCharacter(
        address _caller,
        uint256[4] calldata _rewardData
    ) public {
        require(
            itemTypes[_rewardData[0]].class != ItemClass.IS_NOT_SET,
            "CryptoNYItems.createItemForCharacter.invalidItemTypeId"
        );
        uint256 _rarityChance = itemRarityWeights[
            uint256(itemTypes[_rewardData[0]].rarity)
        ];

        for (uint256 i = 0; i < _rewardData[3]; i++) {
            uint256 _rarityRoll = _random(
                // ItemID + EXP + Run
                _rewardData[0] + _rewardData[2] + i,
                1000
            );
            if (_rarityRoll > _rarityChance) {
                mintItemToCharacter(_caller, _rewardData[0], _rewardData[1]);
            }
        }
    }

    function mintItemToCharacter(
        address _caller,
        uint256 _itemTypeId,
        uint256 _characterId
    ) public {
        require(
            itemTypes[_itemTypeId].class != ItemClass.IS_NOT_SET,
            "CryptoNYItems.createItemForCharacter.invalidItemTypeId"
        );

        uint256 itemId = currentTokenId;
        currentTokenId += 1;
        _safeMint(_caller, itemId);
        ownedItems[itemId] = OwnedItem(_itemTypeId, _characterId, false);
        characterItemTypes[_characterId].add(_itemTypeId);
        characterItems[_characterId][_itemTypeId].add(itemId);
        totalItemTypeSupply[_itemTypeId]++;
    }

    function useItemFromCharacter(
        uint256 _itemTypeId,
        uint256 _characterId,
        uint256 _itemCount
    ) public isGameContract {
        require(
            characterItems[_characterId][_itemTypeId].length() >= _itemCount,
            "CryptoNYItems.useItemFromCharacter.notEnoughItems"
        );

        if (itemTypes[_itemTypeId].class == ItemClass.CONSUMABLE) {
            burnItemFromCharacter(_itemTypeId, _characterId);
        }
    }

    function burnItemFromCharacter(uint256 _itemTypeId, uint256 _characterId)
        public
        isGameContract
    {
        require(
            itemTypes[_itemTypeId].class != ItemClass.IS_NOT_SET,
            "CryptoNYItems.createItemForCharacter.invalidItemTypeId"
        );

        require(
            characterItems[_characterId][_itemTypeId].length() > 0,
            "CryptoNYItems.burnItemFromCharacter.noItemsOfType"
        );

        uint256 itemId = characterItems[_characterId][_itemTypeId].at(0);

        require(
            ownedItems[itemId].characterId == _characterId,
            "CryptoNYItems.burnItemFromCharacter.invalidCharacterId"
        );

        characterItems[_characterId][_itemTypeId].remove(itemId);
        totalItemTypeSupply[_itemTypeId]--;
        if (totalItemTypeSupply[_itemTypeId] == 0) {
            characterItemTypes[_characterId].remove(_itemTypeId);
        }
        _burn(itemId);
        delete ownedItems[itemId];
    }

    // function equipItemToCharacter(uint256 _itemId, uint256 _characterId)
    //     public
    //     isCharacterOwner(_characterId)
    // {
    //     // Todo: write internal equip
    // }

    function assignItemToCharacter(uint256 _itemId, uint256 _characterId)
        public
        isCharacterOwner(_characterId)
    {
        require(ownerOf(_itemId) == msg.sender, "assignItemToCharacter.owner");

        // Get the item so we know who currently owns it and what type it is.
        OwnedItem storage item = ownedItems[_itemId];

        characterItemTypes[_characterId].add(item.itemTypeId);
        characterItems[_characterId][item.itemTypeId].add(_itemId);
        characterItemTypes[item.characterId].remove(item.itemTypeId);
        characterItems[item.characterId][item.itemTypeId].remove(_itemId);
        ownedItems[_itemId].characterId = _characterId;

        // TODO: Run internal equip method.
    }

    // TODO: TokenURI View

    function _equipItemToCharacter(uint256 _itemId, uint256 _characterId)
        internal
    {
        // TODO: Check to see if item is equipped already
        // TODO: Check to see if character has maximum items equipped
        // TODO: Check lowest value item if all item slots are taken.
        // TODO: Unequip lowest value item and equip this new item.
        // What is the next lowest item type?
        // TODO: Update character stats.
    }

    // TODO: Add this call to the "beforeTokenTransfer"
    function _unequipItemFromCharacteR(uint256 _itemId, uint256 _characterId)
        internal
    {
        // TODO: Remove item from equipped storage
        // TODO: Update character stats.
    }

    function _createItemType(
        uint256 _itemTypeId,
        uint256 _class,
        uint256 _attack,
        uint256 _defense,
        uint256 _rarity
    ) public onlyOwner {
        itemTypes[_itemTypeId] = ItemType(
            ItemClass(_class),
            _attack,
            _defense,
            ItemRarity(_rarity)
        );
        if (totalItemTypes <= _itemTypeId) {
            totalItemTypes = _itemTypeId + 1;
        }
    }

    function _addGameContract(address _contract) public onlyOwner {
        gameContracts[_contract] = true;
    }

    function _random(uint256 nonce, uint256 _modulus)
        internal
        view
        returns (uint256)
    {
        return
            uint256(keccak256(abi.encodePacked(block.timestamp, nonce))) %
            _modulus;
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
