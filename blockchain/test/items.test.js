const { expect } = require("chai");
const { waffle, ethers, artifacts } = require("hardhat");
const { deployPromise, getTestProperties, main } = require("../scripts/deploy");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { BigNumber } = require("ethers");
const { jobTiers } = require("./utils/jobs");
const things = require("./utils/items");

const CharacterArtifact = artifacts.readArtifactSync("CryptoChar");
const ItemsArtifact = artifacts.readArtifactSync("CryptoNYItems");
const { provider, deployContract, deployMockContract } = waffle;

const [wallet, otherWallet] = provider.getWallets();

describe("cryptoWars.items", function () {
  let cryptoChar;
  let owner;
  let guest;
  let itemsAddres;
  let itemsContract;
  let characterAddress;
  let characterContract;
  this.beforeAll(async function () {
    characterContract = await deployMockContract(wallet, CharacterArtifact.abi);
    itemsContract = await deployContract(wallet, ItemsArtifact, [
      characterContract.address,
    ]);
    await itemsContract._addGameContract(wallet.address);
    // const results = await main({
    //   setItems: false,
    //   setJobs: false,
    //   setProperties: false,
    // });

    // ({ owner, guest, itemsAddress, characterAddress } = results);

    // itemsContract = await ethers.getContractAt("CryptoNYItems", itemsAddress);
  });

  describe("initial deployment", function () {
    it("returns the no item types", async function () {
      const result = await itemsContract.totalItemTypes();
      expect(result).to.equal(0);
    });
  });

  describe("single createItemType", function () {
    const itemTypeId = 0;

    let previousTotalItemTypes;
    let afterTotalItemTypes;
    let createdItemType;
    this.beforeAll(async function () {
      previousTotalItemTypes = await itemsContract.totalItemTypes();
      await itemsContract._createItemType(
        itemTypeId,
        things.weapons[itemTypeId].class,
        things.weapons[itemTypeId].attack,
        things.weapons[itemTypeId].defense,
        things.weapons[itemTypeId].rarity
      );
      createdItemType = await itemsContract.itemTypes(0);
      afterTotalItemTypes = await itemsContract.totalItemTypes();
    });

    it("should add to totalItemTypes", async function () {
      expect(afterTotalItemTypes).to.equal(previousTotalItemTypes + 1);
    });

    it("item should have an attack value", async () => {
      expect(createdItemType.attack).to.equal(
        things.weapons[itemTypeId].attack
      );
    });

    it("item should have a defense value", async () => {
      expect(createdItemType.defense).to.equal(
        things.weapons[itemTypeId].defense
      );
    });

    it("item should have a rarity value", async () => {
      expect(createdItemType.rarity).to.equal(
        things.weapons[itemTypeId].rarity
      );
    });

    it("item should have a class value", async () => {
      expect(createdItemType.class).to.equal(things.weapons[itemTypeId].class);
    });
  });

  describe("duplicate createItemType", function () {
    let previousTotalItemTypes;
    let afterTotalItemTypes;

    this.beforeAll(async function () {
      previousTotalItemTypes = await itemsContract.totalItemTypes();
      await itemsContract._createItemType(
        0,
        things.weapons[0].class,
        things.weapons[0].attack,
        things.weapons[0].defense,
        things.weapons[0].rarity
      );
      afterTotalItemTypes = await itemsContract.totalItemTypes();
    });

    it("should keep totalItemTypes the same", async function () {
      expect(afterTotalItemTypes).to.equal(previousTotalItemTypes);
    });
  });

  describe("multiple itemTypes created", function () {
    let previousTotalItemTypes;
    let afterTotalItemTypes;
    let oldItemType;
    let newItemType;
    const itemTypeId = 1;

    this.beforeAll(async function () {
      previousTotalItemTypes = await itemsContract.totalItemTypes();
      await itemsContract._createItemType(
        itemTypeId,
        things.weapons[itemTypeId].class,
        things.weapons[itemTypeId].attack,
        things.weapons[itemTypeId].defense,
        things.weapons[itemTypeId].rarity
      );
      oldItemType = await itemsContract.itemTypes(0);
      newItemType = await itemsContract.itemTypes(1);

      afterTotalItemTypes = await itemsContract.totalItemTypes();
    });

    it("should keep totalItemTypes the same", async function () {
      expect(afterTotalItemTypes).to.equal(previousTotalItemTypes.add(1));
    });

    describe("old item", function () {
      it("should have an attack value", async () => {
        expect(oldItemType.attack).to.equal(things.weapons[0].attack);
      });

      it("should have a defense value", async () => {
        expect(oldItemType.defense).to.equal(things.weapons[0].defense);
      });

      it("should have a rarity value", async () => {
        expect(oldItemType.rarity).to.equal(things.weapons[0].rarity);
      });

      it("should have a class value", async () => {
        expect(oldItemType.class).to.equal(things.weapons[0].class);
      });
    });

    describe("new item", function () {
      it("should have an attack value", async () => {
        expect(newItemType.attack).to.equal(things.weapons[1].attack);
      });

      it("should have a defense value", async () => {
        expect(newItemType.defense).to.equal(things.weapons[1].defense);
      });

      it("should have a rarity value", async () => {
        expect(newItemType.rarity).to.equal(things.weapons[1].rarity);
      });

      it("should have a class value", async () => {
        expect(newItemType.class).to.equal(things.weapons[1].class);
      });
    });
  });

  describe("mint single item to character", function () {
    const itemTypeId = 0;
    const characterId = 0;
    this.beforeAll(async () => {
      //   await characterContract.mock.ownerOf
      //     .withArgs(characterId)
      //     .returns(characterAddress);
      await itemsContract.mintItemToCharacter(
        wallet.address,
        itemTypeId,
        characterId
      );
    });

    it("should increase total item supply", async () => {
      const totalSupply = await itemsContract.totalSupply();
      expect(totalSupply).to.equal(1);
    });

    it("should belong to wallet", async () => {
      const owner = await itemsContract.ownerOf(0);
      expect(owner).to.equal(wallet.address);
    });

    it("should add to characterItemTypeListLength", async () => {
      const characterItemTypeListLength =
        await itemsContract.characterItemTypeListLength(characterId);
      expect(characterItemTypeListLength).to.equal(1);
    });

    it("should register characterItemType", async () => {
      const characterItemType = await itemsContract.characterItemType(
        characterId,
        0
      );
      expect(characterItemType).to.equal(0);
    });

    it("should have registered characterItemSupply", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(
        characterId,
        itemTypeId
      );
      expect(characterItemSupply).to.equal(1);
    });
  });

  describe("mint a second of same type to character", function () {
    const itemTypeId = 0;
    const characterId = 0;
    this.beforeAll(async () => {
      await itemsContract.mintItemToCharacter(
        wallet.address,
        itemTypeId,
        characterId
      );
    });

    it("should increase total item supply", async () => {
      const totalSupply = await itemsContract.totalSupply();
      expect(totalSupply).to.equal(2);
    });

    it("should belong to wallet", async () => {
      const owner = await itemsContract.ownerOf(1);
      expect(owner).to.equal(wallet.address);
    });

    it("should not change characterItemTypeListLength", async () => {
      const characterItemTypeListLength =
        await itemsContract.characterItemTypeListLength(characterId);
      expect(characterItemTypeListLength).to.equal(1);
    });

    it("should not change characterItemType", async () => {
      const characterItemType = await itemsContract.characterItemType(
        characterId,
        0
      );
      expect(characterItemType).to.equal(0);
    });

    it("should increase characterItemSupply", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(
        characterId,
        itemTypeId
      );
      expect(characterItemSupply).to.equal(2);
    });
  });

  describe("mint a third of same type to second character", function () {
    const itemTypeId = 0;
    const characterId = 0;
    const secondCharacterId = 1;
    this.beforeAll(async () => {
      await itemsContract.mintItemToCharacter(
        otherWallet.address,
        itemTypeId,
        secondCharacterId
      );
    });

    it("should increase total item supply", async () => {
      const totalSupply = await itemsContract.totalSupply();
      expect(totalSupply).to.equal(3);
    });

    it("should belong to wallet", async () => {
      const owner = await itemsContract.ownerOf(2);
      expect(owner).to.equal(otherWallet.address);
    });

    it("should not change characterItemTypeListLength for first character", async () => {
      const characterItemTypeListLength =
        await itemsContract.characterItemTypeListLength(characterId);
      expect(characterItemTypeListLength).to.equal(1);
    });

    it("should not change characterItemType for first character", async () => {
      const characterItemType = await itemsContract.characterItemType(
        characterId,
        0
      );
      expect(characterItemType).to.equal(0);
    });

    it("should increase characterItemSupply for first character", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(
        characterId,
        itemTypeId
      );
      expect(characterItemSupply).to.equal(2);
    });

    it("should make new characterItemTypeListLength", async () => {
      const characterItemTypeListLength =
        await itemsContract.characterItemTypeListLength(secondCharacterId);
      expect(characterItemTypeListLength).to.equal(1);
    });

    it("should make new characterItemType", async () => {
      const characterItemType = await itemsContract.characterItemType(
        secondCharacterId,
        0
      );
      expect(characterItemType).to.equal(0);
    });

    it("should have one characterItemSupply for secondCharacter", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(
        secondCharacterId,
        itemTypeId
      );
      expect(characterItemSupply).to.equal(1);
    });

    it("should increase total supply", async () => {
      const totalSupply = await itemsContract.totalSupply();
      expect(totalSupply).to.equal(3);
    });
  });

  describe("mint second item type to character", function () {
    const characterId = 0;
    const itemTypeId = 1;

    this.beforeAll(async () => {
      await itemsContract.mintItemToCharacter(
        wallet.address,
        itemTypeId,
        characterId
      );
    });

    it("should increase total item supply", async () => {
      const totalSupply = await itemsContract.totalSupply();
      expect(totalSupply).to.equal(4);
    });

    it("should belong to wallet", async () => {
      const owner = await itemsContract.ownerOf(3);
      expect(owner).to.equal(wallet.address);
    });

    it("should add to characterItemTypeListLength", async () => {
      const characterItemTypeListLength =
        await itemsContract.characterItemTypeListLength(characterId);
      expect(characterItemTypeListLength).to.equal(2);
    });

    it("should register characterItemType", async () => {
      const characterItemTypeId = await itemsContract.characterItemType(
        characterId,
        1
      );
      expect(characterItemTypeId).to.equal(1);
    });

    it("should have registered characterItemSupply", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(
        characterId,
        itemTypeId
      );
      expect(characterItemSupply).to.equal(1);
    });
  });

  describe("rewardItemToCharacter", function () {
    let previousTotalSupply;
    let newTotalSupply;
    let previousCharacterItemTypeSupply;
    let newCharacterItemTypeSupply;

    this.beforeAll(async () => {
      previousTotalSupply = await itemsContract.totalSupply();
      previousCharacterItemTypeSupply = await itemsContract.characterItemSupply(
        0,
        0
      );
      await itemsContract.rewardItemToCharacter(
        wallet.address,
        0,
        0,
        Math.floor(Math.random() * 1000) + 1,
        50
      );

      newTotalSupply = await itemsContract.totalSupply();

      newCharacterItemTypeSupply = await itemsContract.characterItemSupply(
        0,
        0
      );
    });

    it("should increase total item supply randomly", async () => {
      expect(newTotalSupply.toNumber()).to.be.greaterThan(
        previousTotalSupply.toNumber()
      );
      expect(newTotalSupply.toNumber()).to.be.lessThan(20);
    });

    it("should register all items to owner's characterItemSupply", async () => {
      expect(newCharacterItemTypeSupply).to.equal(
        previousCharacterItemTypeSupply
          .add(newTotalSupply.sub(previousTotalSupply))
          .toNumber()
      );
    });
  });

  describe("burnItemFromCharacter", function () {
    let previousTotalSupply;
    let newTotalSupply;
    let previousCharacterItemTypeSupply;
    let newCharacterItemTypeSupply;

    this.beforeAll(async () => {
      previousTotalSupply = await itemsContract.totalSupply();
      previousCharacterItemTypeSupply = await itemsContract.characterItemSupply(
        0,
        0
      );
      await itemsContract.burnItemFromCharacter(0, 0);
      newTotalSupply = await itemsContract.totalSupply();
      newCharacterItemTypeSupply = await itemsContract.characterItemSupply(
        0,
        0
      );
    });

    it("should decrease total item supply", async () => {
      expect(newTotalSupply.toNumber()).to.be.equal(
        previousTotalSupply.sub(1).toNumber()
      );
    });

    it("should decrease characterItemSupply", async () => {
      expect(newCharacterItemTypeSupply).to.equal(
        previousCharacterItemTypeSupply.sub(1).toNumber()
      );
    });
  });

  describe("burn all the items", function () {
    this.beforeAll(async () => {
      const newCharacterItemTypeSupply =
        await itemsContract.characterItemSupply(0, 0);
      for (let i = 0; i < newCharacterItemTypeSupply.toNumber(); i++) {
        await itemsContract.burnItemFromCharacter(0, 0);
      }
    });

    it("should zero out characterItemSupply", async () => {
      const characterItemSupply = await itemsContract.characterItemSupply(0, 0);
      expect(characterItemSupply).to.equal(0);
    });

    it("should revert after another burn", async () => {
      await expect(
        itemsContract.burnItemFromCharacter(0, 0)
      ).to.be.revertedWith("CryptoNYItems.burnItemFromCharacter.noItemsOfType");
    });
  });

  describe("assignItemToCharacter", function () {
    describe("when not the owner", function () {
      it("should reject when not the owner", async () => {
        await characterContract.mock.ownerOf
          .withArgs(0)
          .returns(otherWallet.address);
        await expect(
          itemsContract.assignItemToCharacter(0, 0)
        ).to.be.revertedWith("CryptoNyJobs.characterOwner");
      });
    });

    describe("when the owner and item does not exist", function () {
      this.beforeAll(async () => {
        await characterContract.mock.ownerOf
          .withArgs(0)
          .returns(wallet.address);
      });

      it("should fail", async () => {
        await expect(
          itemsContract.assignItemToCharacter(0, 0)
        ).to.be.revertedWith("ERC721: owner query for nonexistent toke");
      });
    });

    describe("when the owner and item exist", function () {
      this.beforeAll(async () => {
        let res = await itemsContract.ownerOf(2);

        await itemsContract
          .connect(otherWallet)
          .transferFrom(otherWallet.address, wallet.address, 2);
        await characterContract.mock.ownerOf
          .withArgs(0)
          .returns(wallet.address);

        res = await itemsContract.ownerOf(2);

        await itemsContract.assignItemToCharacter(2, 0);
      });

      it("it should change owners", async () => {
        const owner = await itemsContract.ownerOf(2);
        expect(owner).to.equal(wallet.address);
      });

      it("item should have new character id", async () => {
        const { characterId } = await itemsContract.ownedItems(2);
        expect(characterId).to.equal(0);
      });
    });
  });
});
