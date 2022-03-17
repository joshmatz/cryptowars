const { waffle, artifacts } = require("hardhat");
const { expect } = require("chai");

const CharacterArtifact = artifacts.readArtifactSync("CryptoChar");
const FightArtifact = artifacts.readArtifactSync("CryptoNYFight");
const WalletArtifact = artifacts.readArtifactSync("CryptoNYWallet");
const ERC20Artifact = artifacts.readArtifactSync("CryptoNYERC20");

const { provider, deployContract, deployMockContract } = waffle;

const [genesisOwner, otherOwner] = provider.getWallets();

describe("cryptoWars.fight", function () {
  let genesisCharacterId = 0;
  let otherCharacterId = 1;
  let characterContract;
  this.beforeAll(async function () {
    tokenContract = await deployContract(genesisOwner, ERC20Artifact);
    characterContract = await deployContract(genesisOwner, CharacterArtifact);
    walletContract = await deployContract(genesisOwner, WalletArtifact, [
      characterContract.address,
      tokenContract.address,
    ]);
    fightContract = await deployContract(genesisOwner, FightArtifact, [
      characterContract.address,
      walletContract.address,
    ]);

    await characterContract.addGameContract(fightContract.address);
    await characterContract.addGameContract(genesisOwner.address);

    await characterContract.create("Loopy", 0);
  });

  describe("Attacking self", function () {
    it("should not be able to attack self", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, genesisCharacterId)
      ).to.be.revertedWith("Fight.sameCharacter");
    });
  });

  describe("Attacking as non-character owner", function () {
    it("should reject", async () => {
      await expect(
        fightContract
          .connect(otherOwner)
          .attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("Fight.characterOwner");
    });
  });

  describe("Attacking as level 0", function () {
    it("should not be able to attack as level 0", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("Fight.attackingCharacterExists");
    });
  });

  describe("Level 1 attacking Level 0", function () {
    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        genesisCharacterId,
        7,
        0,
        0,
        0,
        0
      );
    });

    it("shoudl not allow as defender is level 0", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("Fight.defendingCharacterExists");
    });
  });

  describe("Level 1 attacking L1", function () {
    let previousGenesisCharacter;
    let previousOtherCharacter;
    let nextGenesisCharacter;
    let nextOtherCharacter;
    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        otherCharacterId,
        7,
        0,
        0,
        0,
        0
      );
      previousGenesisCharacter = await characterContract.characters(
        genesisCharacterId
      );
      previousOtherCharacter = await characterContract.characters(
        otherCharacterId
      );
      await fightContract.attackCharacter(genesisCharacterId, otherCharacterId);
      nextGenesisCharacter = await characterContract.characters(
        genesisCharacterId
      );
      nextOtherCharacter = await characterContract.characters(otherCharacterId);
    });

    it("attacker should lose 9 health", async () => {
      expect(nextGenesisCharacter.health.current).to.be.equal(
        previousGenesisCharacter.health.current.sub(9)
      );
    });

    it("defender should lose 11 health", async () => {
      expect(nextOtherCharacter.health.current).to.be.equal(
        previousOtherCharacter.health.current.sub(11)
      );
    });
  });

  describe("a second attack", function () {
    let previousGenesisCharacter;
    let previousOtherCharacter;
    let nextGenesisCharacter;
    let nextOtherCharacter;
    this.beforeAll(async () => {
      previousGenesisCharacter = await characterContract.characters(
        genesisCharacterId
      );
      previousOtherCharacter = await characterContract.characters(
        otherCharacterId
      );
      await fightContract.attackCharacter(genesisCharacterId, otherCharacterId);
      nextGenesisCharacter = await characterContract.characters(
        genesisCharacterId
      );
      nextOtherCharacter = await characterContract.characters(otherCharacterId);
    });

    it("attacker should lose 9 health", async () => {
      expect(nextGenesisCharacter.health.current).to.be.equal(
        previousGenesisCharacter.health.current.sub(11)
      );
    });

    it("defender should lose 11 health", async () => {
      expect(nextOtherCharacter.health.current).to.be.equal(
        previousOtherCharacter.health.current.sub(9)
      );
    });
  });

  describe("no stamina remaining", function () {
    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        genesisCharacterId,
        0,
        -5,
        0,
        0,
        0
      );
    });

    it("should reject", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("Fight.noStamina");
    });
  });

  describe("defender has no health", function () {
    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        genesisCharacterId,
        0,
        10,
        0,
        0,
        0
      );

      await characterContract.updateCurrentAttributes(
        otherCharacterId,
        0,
        0,
        0,
        -100,
        0
      );

      const previousOtherCharacter = await characterContract.characters(
        otherCharacterId
      );
    });

    it("should reject", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("CryptoChar.updateCurrentAttributes.dead");
    });
  });

  describe("attacker has no health", function () {
    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        genesisCharacterId,
        0,
        0,
        0,
        -100,
        0
      );

      await characterContract.updateCurrentAttributes(
        otherCharacterId,
        0,
        0,
        0,
        100,
        0
      );
    });

    it("should reject", async () => {
      await expect(
        fightContract.attackCharacter(genesisCharacterId, otherCharacterId)
      ).to.be.revertedWith("CryptoChar.updateCurrentAttributes.dead");
    });
  });

  describe("attacker kills defender", function () {
    let previousOtherCharacter;
    let nextOtherCharacter;

    const experience = 100;
    const stamina = 0;
    const energy = 0;
    const health = -99;
    const skillPoints = 0;

    this.beforeAll(async () => {
      await characterContract.updateCurrentAttributes(
        genesisCharacterId,
        0,
        10,
        0,
        100,
        0
      );

      await characterContract.updateCurrentAttributes(
        otherCharacterId,
        experience,
        stamina,
        energy,
        health,
        skillPoints
      );

      previousOtherCharacter = await characterContract.characters(
        otherCharacterId
      );

      await fightContract.attackCharacter(genesisCharacterId, otherCharacterId);

      nextOtherCharacter = await characterContract.characters(otherCharacterId);
    });

    it("should lose experience", async () => {
      expect(nextOtherCharacter.experience).to.be.equal(
        previousOtherCharacter.experience.sub(10)
      );
    });
  });
});
