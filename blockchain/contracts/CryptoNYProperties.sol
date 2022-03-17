// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface ICharacter {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

interface ICryptoNyWallet {
    function burnFromCharacter(uint256 _characterId, uint256 _amount) external;

    function mintToCharacter(uint256 _characterId, uint256 _amount) external;
}

contract CryptoNYProperties is ERC721, ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    enum PropertyClass {
        CASH
    }

    struct Property {
        uint256 cost;
        uint256 costPerLevel;
        uint256 incomePerLevel;
        uint256 maxLevel;
        uint256 maxCollection;
    }

    struct OwnedProperty {
        uint256 characterId;
        uint256 propertyType;
        uint256 level;
        uint256 lastCollected;
        uint256 investedFunds;
    }

    // On-chain properties of each property type
    Property[10] public propertyTypes;

    // Propertys are NFTs and ERC721 stores the owner information
    // This stores the properties of each NFT on-chain.
    OwnedProperty[] public properties;

    // Characters can only have a single property type NFT
    // so map character IDs to property types as a way to
    // check ownership of property types.
    // [characterId][propertyType] = 0 || 1
    mapping(uint256 => mapping(uint256 => bool)) public characterPropertyTypes;
    mapping(uint256 => mapping(uint256 => uint256)) public characterPropertyIds;

    // Management contracts
    address public characterContract;
    address public walletContract;

    constructor(address charContract) ERC721("CryptoNY", "CNY") {
        characterContract = charContract;
    }

    modifier isCharacterOwner(uint256 characterId) {
        require(
            ICharacter(characterContract).ownerOf(characterId) == msg.sender,
            "CryptoNyProperties.characterOwner"
        );
        _;
    }

    modifier isPropertyOwner(uint256 propertyId) {
        require(
            ownerOf(propertyId) == msg.sender,
            "CryptoNyProperties.propertyOwner"
        );
        _;
    }

    function setWalletContract(address _walletContract) public {
        require(
            _walletContract != address(0),
            "CryptoNyProperties.setWalletContract"
        );
        walletContract = _walletContract;
    }

    function purchaseProperty(uint256 characterId, uint256 propertyType)
        external
        isCharacterOwner(characterId)
    {
        Property storage _b = propertyTypes[propertyType];
        require(
            _b.incomePerLevel != 0,
            "CryptoNyProperties.purchaseProperty.invalidPropertyType"
        );

        require(
            characterPropertyTypes[characterId][propertyType] == false,
            "CryptoNyProperties.purchaseProperty.alreadyOwned"
        );

        if (_b.cost != 0) {
            // Burn cost of purchase
            ICryptoNyWallet(walletContract).burnFromCharacter(
                characterId,
                _b.cost
            );
        }

        _safeMint(msg.sender, totalSupply());
        _createProperty(characterId, propertyType);
    }

    function upgradeProperty(
        uint256 characterId,
        uint256 propertyId,
        uint256 levels
    )
        external
        isCharacterOwner(characterId)
        isPropertyOwner(propertyId)
        returns (uint256)
    {
        require(levels > 0, "CryptoNyProperties.upgradeProperty.invalidLevels");
        require(
            properties[propertyId].characterId == characterId,
            "CryptoNyProperties.characterPropertyOwner"
        );
        OwnedProperty storage _b = properties[propertyId];
        Property storage _bType = propertyTypes[_b.propertyType];

        require(
            _b.level < _bType.maxLevel,
            "CryptoNyProperties.upgradeProperty.maxLevelReached"
        );

        require(
            _bType.incomePerLevel != 0,
            "CryptoNyProperties.upgradeProperty.invalidPropertyType"
        );

        // Base Cost + (BaseCost * Building Level * UpgradeRatio)
        // Sum of total upgrades required to reach the level the level
        // they are trying to upgrade to multiplied by the cost per level.
        // Sum of total = (n/2) * (levels) * costPerLevel
        uint256 costOfUpgrade = _bType.cost.mul(levels).add(
            _b.level.add(levels).div(2).mul(levels).mul(_bType.costPerLevel)
        );

        // burn cost of upgrade
        ICryptoNyWallet(walletContract).burnFromCharacter(
            characterId,
            costOfUpgrade
        );

        _b.investedFunds = _b.investedFunds.add(costOfUpgrade);
        _b.level = _b.level + levels;

        return _b.level;
    }

    function collectRevenue(uint256 characterId, uint256 propertyId)
        external
        isCharacterOwner(characterId)
        isPropertyOwner(propertyId)
        returns (uint256, uint256)
    {
        OwnedProperty storage _b = properties[propertyId];
        Property storage _bType = propertyTypes[_b.propertyType];

        require(
            _b.level > 0,
            "CryptoNyProperties.collectPropertyRevenue.propertyLevelZero"
        );

        require(
            _bType.incomePerLevel != 0,
            "CryptoNyProperties.collectPropertyRevenue.invalidPropertyType"
        );

        uint256 timeDifference = uint256(block.timestamp).sub(_b.lastCollected);

        if (timeDifference > _bType.maxCollection) {
            timeDifference = _bType.maxCollection;
        }

        uint256 revenue = _b
            .level
            .mul(_bType.incomePerLevel)
            .mul(timeDifference)
            .div(_bType.maxCollection);

        require(
            revenue > 0,
            "CryptoNyProperties.collectPropertyRevenue.noRevenue"
        );

        // 10% bonus for filling the entire collection time
        if (timeDifference == _bType.maxCollection) {
            revenue = revenue.mul(11).div(10);
        }

        _b.lastCollected = block.timestamp;

        ICryptoNyWallet(walletContract).mintToCharacter(characterId, revenue);

        return (_b.lastCollected, revenue);
    }

    function assignPropertyToCharacter(uint256 characterId, uint256 propertyId)
        external
        isCharacterOwner(characterId)
        isPropertyOwner(propertyId)
    {
        OwnedProperty storage _b = properties[propertyId];

        require(
            characterPropertyTypes[characterId][_b.propertyType] == false,
            "CryptoNyProperties.transferPropertyToCharacter.alreadyOwnsProperty"
        );

        Property storage _bType = propertyTypes[_b.propertyType];

        ICryptoNyWallet(walletContract).burnFromCharacter(
            characterId,
            _bType
                .cost
                .mul(_b.level)
                .add(_b.level.div(2).mul(_b.level).mul(_bType.costPerLevel))
                .mul(3)
                .div(100)
        );

        characterPropertyTypes[properties[propertyId].characterId][
            _b.propertyType
        ] = false;
        characterPropertyTypes[characterId][_b.propertyType] = true;
        characterPropertyIds[characterId][_b.propertyType] = propertyId;
        properties[propertyId].characterId = characterId;
    }

    function _createPropertyType(
        uint256 propertyId,
        uint256 cost,
        uint256 costPerLevel,
        uint256 incomePerLevel,
        uint256 maxLevel,
        uint256 maxCollection
    ) external onlyOwner {
        propertyTypes[propertyId] = Property(
            cost,
            costPerLevel,
            incomePerLevel,
            maxLevel,
            maxCollection
        );
    }

    function _createProperty(uint256 characterId, uint256 propertyType)
        private
    {
        // Properties are owned by the address that minted the property,
        // but in order to be useful they are tied to a characterId.
        // The Property NFTs can be freely traded, but will incur a 3% fee
        // to change the character that owns the property.
        properties.push(
            OwnedProperty(characterId, propertyType, 1, block.timestamp, 0)
        );
        characterPropertyTypes[characterId][propertyType] = true;
        characterPropertyIds[characterId][propertyType] = properties.length - 1;
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
