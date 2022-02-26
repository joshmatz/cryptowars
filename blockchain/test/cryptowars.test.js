const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployPromise, getTestProperties, main } = require("../scripts/deploy");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { BigNumber } = require("ethers");
const {
  collectRevenue,
  calculateCostToUpgrade,
  calculateTotalInvested,
} = require("./utils/properties");
require("hardhat-gas-reporter");

// Character is required to interact with other contracts
// Other contracts mint NFTs that get deposited into the owner's account
// Owner can assign (stake) NFTs to the character's Inventory Slots
// This allows Owners to trade NFTs like any other NFT
// How to prevent NFTs being minted and utilized from external parties?
// // // Allow a whitelist of NFT contracts that can only be added to (prevent removing functionality)
// How do we earn rewards for the character's actions?
// // // Mint NFTs from whitelisted contracts, set owner to CryptoChar contract and
// // // CryptoChar contract will track which character to which it belongs
// How will CryptoChar track?
// // // Mapping of adddress to tokenId

describe("CryptoChar", function () {
  let cryptoChar;
  let owner;
  let guest;
  let cryptoNyProperties;
  let cryptoNyERC20;
  let cryptoNyWallet;
  let ownerBalance;
  let ownerCharacterBalance;
  const ownerCharacterId = 0;
  const guestCharacterId = 1;
  const basicPropertyIndex = 0;
  const genesisCharacterBasicPropertyId = 0;
  const guestCharacterBasicPropertyId = 1;
  let propertyTypes = [];
  this.beforeAll(async function () {
    const results = await main();
    ({
      owner,
      guest,
      cryptoChar,
      cryptoNyProperties,
      cryptoNyERC20,
      cryptoNyWallet,
      cryptoNyJobs,
      propertyTypes,
    } = results);

    // ({
    //   owner,
    //   guest,
    //   cryptoChar,
    //   cryptoNyProperties,
    //   cryptoNyERC20,
    //   cryptoNyWallet,
    //   cryptoNyJobs,
    //   propertyTypes,
    // } = );
  });

  describe("contract creation", () => {
    it("should contain owner address", async () => {
      expect(await cryptoChar.owner()).to.equal(owner.address);
    });

    it("should have erc20 token owner set to wallet", async () => {
      expect(await cryptoNyERC20.owner()).to.equal(cryptoNyWallet.address);
    });

    it("region contract should be connected", async () => {
      const regionProperties = await cryptoChar.regionProperties(0);
      const characterContract = await cryptoNyProperties.characterContract();

      expect(regionProperties).to.equal(cryptoNyProperties.address);
      expect(characterContract).to.equal(cryptoChar.address);
    });

    it("should have region properties defined", async () => {
      const region = await cryptoChar.regions(0);

      expect(region.baseTravelTime).to.equal(60 * 60 * 9);
    });

    it("should have populated property types", async () => {
      const property = await cryptoNyProperties.propertyTypes(0);
      expect(property.incomePerLevel).to.equal(ethers.utils.parseEther("263"));
    });
  });

  describe("genesis creation", () => {
    let genesisCharacter;

    it("should mint a genesis character", async () => {
      expect(await cryptoChar.totalSupply()).to.equal(1);
    });

    it("should return properties of the genesis character", async () => {
      genesisCharacter = await cryptoChar.characters(ownerCharacterId);
      expect(genesisCharacter.name).to.equal("Genesis");
      expect(genesisCharacter.charClass).to.equal(0);
      expect(genesisCharacter.currentRegion).to.equal(0);
    });

    it("should say which character is owned by owner", async () => {
      expect(await cryptoChar.ownerOf(ownerCharacterId)).to.equal(
        owner.address
      );
    });

    it("should not allow travel immediately", async () => {
      await expect(cryptoChar.travel(ownerCharacterId, 1)).to.be.reverted;
    });

    // it("should pass level check for travel", async () => {
    //   const hours = 11 * 60 * 60;
    //   await ethers.provider.send("evm_increaseTime", [hours]); // add 10 seconds
    //   await ethers.provider.send("evm_mine", []); // force mine the next block

    //   await cryptoChar.travel(0, 1);
    //   genesisCharacter = await cryptoChar.characters(0);

    //   expect(genesisCharacter.currentRegion).to.equal(1);
    // });
  });

  describe("guest creation", () => {
    const guestName = "Bob";
    const guestClass = 2;
    let guestCharacter;

    it("Should allow another address to create another character", async () => {
      await cryptoChar.connect(guest).create(guestName, guestClass);
      guestCharacter = await cryptoChar.characters(guestCharacterId);
      expect(await cryptoChar.totalSupply()).to.equal(2);
    });

    it("should return properties of the genesis character", async () => {
      expect(guestCharacter.name).to.equal(guestName);
      expect(guestCharacter.charClass).to.equal(guestClass);
    });

    it("should say which character is owned by owner", async () => {
      expect(await cryptoChar.ownerOf(guestCharacterId)).to.equal(
        guest.address
      );
    });

    it("should prevent owner from transferring guest character", async () => {
      await cryptoChar.connect(owner);
      await expect(
        cryptoChar.transferFrom(owner.address, guest.address, guestCharacterId)
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    // it("should prevent owner from traveling guest character", async () => {
    //   await expect(cryptoChar.travel(1, 1)).to.be.revertedWith(
    //     "Caller is not owner"
    //   );
    // });

    // it("should allow guest to travel character to new region", async () => {
    //   await cryptoChar.connect(guest).travel(1, 2);
    //   guestCharacter = await cryptoChar.characters(1);

    //   expect(guestCharacter.currentRegion).to.equal(2);
    // });
  });

  describe("region properties", () => {
    // create a region property
    // assign region property to character
    // test for multiple characters

    describe("purchaseProperty", () => {
      it("should allow the purchase of a property for owner", async () => {
        await cryptoNyProperties.purchaseProperty(
          ownerCharacterId,
          basicPropertyIndex
        );
        const property = await cryptoNyProperties.properties(
          basicPropertyIndex
        );
        expect(property.level).to.equal(1);
      });

      it("should prevent guest from purchasing a property for owner", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .purchaseProperty(ownerCharacterId, genesisCharacterBasicPropertyId)
        ).to.be.revertedWith("CryptoNyProperties.characterOwner");
      });

      it("should allow guest to purchase property", async () => {
        await cryptoNyProperties
          .connect(guest)
          .purchaseProperty(guestCharacterId, basicPropertyIndex);

        const property = await cryptoNyProperties.properties(
          guestCharacterBasicPropertyId
        );

        expect(property.level).to.equal(1);
      });
    });

    describe("upgradeProperty", () => {
      it("should prevent upgrading for max level", async () => {
        await expect(
          cryptoNyProperties.upgradeProperty(
            ownerCharacterId,
            basicPropertyIndex,
            1
          )
        ).to.be.revertedWith(
          "CryptoNyProperties.upgradeProperty.maxLevelReached"
        );
      });

      it("should prevent guest from upgrading a property for owner", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .upgradeProperty(
              ownerCharacterId,
              genesisCharacterBasicPropertyId,
              1
            )
        ).to.be.revertedWith("CryptoNyProperties.characterOwner");
      });

      it("should prevent owner from upgrading guest property for owner's character", async () => {
        await expect(
          cryptoNyProperties.connect(owner).upgradeProperty(0, 1, 1)
        ).to.be.revertedWith("CryptoNyProperties.propertyOwner");
      });
    });
  });

  describe("collectRevenue", () => {
    it("should allow owner to collect 25% of revenue after 25% of time has passed", async () => {
      await cryptoNyProperties
        .connect(owner)
        .collectRevenue(ownerCharacterId, genesisCharacterBasicPropertyId);
      const oldBalance = await cryptoNyWallet.balances(ownerCharacterId);
      const ownedProperty = await cryptoNyProperties.properties(0);

      await ethers.provider.send("evm_setNextBlockTimestamp", [
        ownedProperty.lastCollected
          .add(propertyTypes[0].maxCollection * 0.25)
          .toNumber(),
      ]);

      await cryptoNyProperties
        .connect(owner)
        .collectRevenue(ownerCharacterId, genesisCharacterBasicPropertyId);

      const newBalance = await cryptoNyWallet.balances(ownerCharacterId);

      expect(BigNumber.from(newBalance)).to.be.equal(
        oldBalance.add(BigNumber.from(propertyTypes[0].incomePerLevel).div(4))
      );
    });

    it("should collect max revenue for property type", async () => {
      await ethers.provider.send("evm_increaseTime", [hoursToSeconds(24)]);
      const oldBalance = await cryptoNyWallet.balances(ownerCharacterId);
      await cryptoNyProperties
        .connect(owner)
        .collectRevenue(ownerCharacterId, genesisCharacterBasicPropertyId);
      const newBalance = await cryptoNyWallet.balances(ownerCharacterId);
      expect(newBalance).to.be.equal(
        oldBalance.add(
          BigNumber.from(propertyTypes[0].incomePerLevel).mul(11).div(10)
        )
      );
    });

    describe("deny permissions", async () => {
      it("requesting address matches neither parameters", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .collectRevenue(ownerCharacterId, genesisCharacterBasicPropertyId)
        ).to.be.revertedWith("CryptoNyProperties.characterOwner");
      });

      it("requesting address does not match character address", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .collectRevenue(ownerCharacterId, guestCharacterBasicPropertyId)
        ).to.be.revertedWith("CryptoNyProperties.characterOwner");
      });

      it("requesting address does not match property address", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .collectRevenue(guestCharacterId, genesisCharacterBasicPropertyId)
        ).to.be.revertedWith("CryptoNyProperties.propertyOwner");
      });
    });
  });

  describe("cryptoNYERC20", () => {
    it("should not allow guest to mint tokens", async () => {
      await expect(
        cryptoNyERC20.connect(guest).mint(guest.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("cryptoNyWallet", () => {
    it("should allow owner to withdrawToPlayer", async () => {
      ownerCharacterBalance = await cryptoNyWallet.balances(ownerCharacterId);
      ownerBalance = 0;

      await cryptoNyWallet
        .connect(owner)
        .withdrawToPlayer(0, ownerCharacterBalance);
      const balanceOfPerson = await cryptoNyERC20.balanceOf(owner.address);
      const balanceOfCharacter = await cryptoNyWallet.balances(0);
      expect(balanceOfPerson).to.equal(ownerBalance + ownerCharacterBalance);
      expect(balanceOfCharacter).to.equal(0);
      ownerBalance = ownerBalance + ownerCharacterBalance;
      ownerCharacterBalance = 0;
    });

    describe("depositToCharacter", function () {
      let startingBalanceOfPerson;
      let endingBalanceOfCharacter;
      let endingBalanceOfPerson;
      this.beforeAll(async () => {
        startingBalanceOfPerson = await cryptoNyERC20.balanceOf(owner.address);

        await cryptoNyWallet
          .connect(owner)
          .depositToCharacter(0, ethers.utils.parseEther("90"));

        endingBalanceOfPerson = await cryptoNyERC20.balanceOf(owner.address);
        endingBalanceOfCharacter = await cryptoNyWallet.balances(0);
      });

      it("should subtract from person", async () => {
        expect(endingBalanceOfPerson).to.equal(
          startingBalanceOfPerson.sub(ethers.utils.parseEther("90"))
        );
        ownerBalance = 10;
        ownerCharacterBalance = 90;
      });

      it("should add to character", async () => {
        expect(endingBalanceOfCharacter).to.equal(
          ethers.utils.parseEther("90")
        );
      });
    });

    describe("guest transactions", () => {
      it("should allow transfer from owner to guest", async () => {
        await cryptoNyERC20.transfer(
          guest.address,
          ethers.utils.parseEther("10")
        );
        const balanceOfPerson = await cryptoNyERC20.balanceOf(guest.address);
        expect(ethers.utils.formatEther(balanceOfPerson)).to.equal("10.0");
        guestBalance = 10;
        ownerBalance = 0;
      });

      it("should allow guest to depositToCharacter", async () => {
        await cryptoNyWallet
          .connect(guest)
          .depositToCharacter(guestCharacterId, ethers.utils.parseEther("9"));
        const balanceOfPerson = await cryptoNyERC20.balanceOf(guest.address);
        const balanceOfCharacter = await cryptoNyWallet.balances(1);
        expect(balanceOfPerson).to.equal(ethers.utils.parseEther("1"));
        expect(balanceOfCharacter).to.equal(ethers.utils.parseEther("9"));
        guestBalance = 1;
        guestCharacterBalance = 9;
      });

      it("should not allow owner to withdrawToPlayer from guest character", async () => {
        await expect(
          cryptoNyWallet.connect(owner).withdrawToPlayer(1, 10)
        ).to.be.revertedWith("CryptoNyWallet.characterOwner");
      });

      describe("withdrawToPlayer guest", function () {
        let startingBalanceOfPerson;
        let startingBalanceOfCharacter;
        this.beforeAll(async () => {
          startingBalanceOfPerson = await cryptoNyERC20.balanceOf(
            guest.address
          );
          startingBalanceOfCharacter = await cryptoNyWallet.balances(
            guestCharacterId
          );
          await cryptoNyWallet
            .connect(guest)
            .withdrawToPlayer(guestCharacterId, ethers.utils.parseEther("1"));
        });

        it("should have correct balance for person", async () => {
          const balanceOfPerson = await cryptoNyERC20.balanceOf(guest.address);

          expect(balanceOfPerson).to.equal(
            startingBalanceOfPerson.add(ethers.utils.parseEther("1"))
          );
        });

        it("should have correct balance for character", async () => {
          const balanceOfCharacter = await cryptoNyWallet.balances(
            guestCharacterId
          );

          expect(balanceOfCharacter).to.equal(
            startingBalanceOfCharacter.sub(ethers.utils.parseEther("1"))
          );
        });
      });
    });
  });

  describe("Multiple property types", function () {
    let propertyTypeAttributes;
    const propertyTypeId = 1;

    this.beforeAll(() => {
      propertyTypeAttributes = propertyTypes[1];
    });

    describe("failure purchase scenarios", function () {
      it("will deny for lack of funds", async () => {
        const balance = await cryptoNyWallet.balances(ownerCharacterId);

        await expect(
          cryptoNyProperties
            .connect(owner)
            .purchaseProperty(ownerCharacterId, propertyTypeId)
        ).to.be.revertedWith("CryptoNyWallet.balance");
      });
    });

    describe("after successful owner purchase", function () {
      this.beforeAll(async () => {
        for (i = 0; i <= 57; i++) {
          await collectRevenue({
            signer: owner,
            walletContract: cryptoNyWallet,
            propertiesContract: cryptoNyProperties,
            characterId: ownerCharacterId,
            propertyId: genesisCharacterBasicPropertyId,
          });
        }
      });

      it("purchase property with sufficient funds", async () => {
        await cryptoNyProperties
          .connect(owner)
          .purchaseProperty(ownerCharacterId, propertyTypeId);
      });

      it("should collect 25% of funds for second property", async () => {
        const { oldBalance, newBalance } = await collectRevenue({
          signer: owner,
          walletContract: cryptoNyWallet,
          propertiesContract: cryptoNyProperties,
          characterId: ownerCharacterId,
          propertyId: 2,
          setTime: propertyTypes[1].maxCollection * 0.25,
        });

        expect(BigNumber.from(newBalance)).to.be.equal(
          oldBalance.add(BigNumber.from(propertyTypes[1].incomePerLevel).div(4))
        );
      });

      describe("upgrading property", function () {
        describe("one level", function () {
          let previousBalance;
          let newBalance;
          let previousProperty;
          let newProperty;

          this.beforeAll(async () => {
            for (i = 0; i < 100; i++) {
              await collectRevenue({
                signer: owner,
                walletContract: cryptoNyWallet,
                propertiesContract: cryptoNyProperties,
                characterId: ownerCharacterId,
                propertyId: 2,
                setTime: propertyTypes[1].maxCollection,
              });
            }

            previousProperty = await cryptoNyProperties.properties(2);

            previousBalance = await cryptoNyWallet.balances(ownerCharacterId);

            await cryptoNyProperties.upgradeProperty(ownerCharacterId, 2, 1);

            newProperty = await cryptoNyProperties.properties(2);

            newBalance = await cryptoNyWallet.balances(ownerCharacterId);
          });

          it("should have a new level", async () => {
            expect(newProperty.level.toNumber()).to.equal(
              previousProperty.level.toNumber() + 1
            );
          });

          it("should cost the correct amount to upgrade", async () => {
            let costOfUpgrade = BigNumber.from(0);
            for (let i = 1; i > 0; i--) {
              costOfUpgrade = costOfUpgrade.add(
                propertyTypeAttributes.cost.add(
                  previousProperty.level
                    .add(i)
                    .sub(1)
                    .mul(propertyTypeAttributes.costPerLevel)
                )
              );
            }
            expect(previousBalance.sub(newBalance)).to.be.equal(costOfUpgrade);
          });

          it("should collect more revenue", async () => {
            const { newBalance, oldBalance } = await collectRevenue({
              signer: owner,
              walletContract: cryptoNyWallet,
              propertiesContract: cryptoNyProperties,
              characterId: ownerCharacterId,
              propertyId: 2,
              setTime: propertyTypes[1].maxCollection * 0.25,
            });

            expect(BigNumber.from(newBalance)).to.be.equal(
              oldBalance.add(
                BigNumber.from(propertyTypes[1].incomePerLevel).div(2)
              )
            );
          });
        });

        describe("three levels", function () {
          let previousBalance;
          let newBalance;
          let previousProperty;
          let newProperty;

          this.beforeAll(async () => {
            for (i = 0; i < 100; i++) {
              await collectRevenue({
                signer: owner,
                walletContract: cryptoNyWallet,
                propertiesContract: cryptoNyProperties,
                characterId: ownerCharacterId,
                propertyId: 2,
                setTime: propertyTypes[1].maxCollection,
              });
            }

            previousProperty = await cryptoNyProperties.properties(2);

            previousBalance = await cryptoNyWallet.balances(ownerCharacterId);

            await cryptoNyProperties.upgradeProperty(ownerCharacterId, 2, 3);

            newProperty = await cryptoNyProperties.properties(2);

            newBalance = await cryptoNyWallet.balances(ownerCharacterId);
          });

          it("should have a new level", async () => {
            expect(newProperty.level.toNumber()).to.equal(
              previousProperty.level.toNumber() + 3
            );
          });

          it("should cost the correct amount to upgrade", async () => {
            const costOfUpgrade = calculateCostToUpgrade({
              fromLevel: previousProperty.level,
              levels: 3,
              costPerLevel: propertyTypeAttributes.costPerLevel,
              baseCost: propertyTypeAttributes.cost,
            });

            expect(previousBalance.sub(newBalance)).to.be.equal(costOfUpgrade);
          });

          it("should collect more revenue for all total levels", async () => {
            const { oldBalance, newBalance } = await collectRevenue({
              signer: owner,
              walletContract: cryptoNyWallet,
              propertiesContract: cryptoNyProperties,
              characterId: ownerCharacterId,
              propertyId: 2,
              setTime: propertyTypes[1].maxCollection * 0.25,
            });

            expect(newBalance).to.be.equal(
              oldBalance.add(
                BigNumber.from(propertyTypes[1].incomePerLevel.mul(5)).div(4)
              )
            );
          });
        });
      });

      describe("transferring to guest", function () {
        this.beforeAll(async () => {
          await cryptoNyProperties.transferFrom(
            owner.address,
            guest.address,
            2
          );
        });
        it("should be transferred to guest", async () => {
          const property = await cryptoNyProperties.ownerOf(2);
          expect(property).to.be.equal(guest.address);
        });

        it("should not allow upgrading by owner's character", async () => {
          await expect(
            cryptoNyProperties.upgradeProperty(ownerCharacterId, 2, 1)
          ).to.be.revertedWith("CryptoNyProperties.propertyOwner");
        });

        it("should not allow upgrading by owner with guest's character", async () => {
          await expect(
            cryptoNyProperties.upgradeProperty(guestCharacterId, 2, 1)
          ).to.be.revertedWith("CryptoNyProperties.characterOwner");
        });

        it("should not allow upgrading by guest with guest's character", async () => {
          await expect(
            cryptoNyProperties
              .connect(guest)
              .upgradeProperty(guestCharacterId, 2, 1)
          ).to.be.revertedWith("CryptoNyProperties.characterPropertyOwner");
        });

        it("should not allow upgrading by guest with owner's character", async () => {
          await expect(
            cryptoNyProperties
              .connect(guest)
              .upgradeProperty(ownerCharacterId, 2, 1)
          ).to.be.revertedWith("CryptoNyProperties.characterOwner");
        });
      });

      describe("assigning property to character without required fee", function () {
        it("should fail", async () => {
          await expect(
            cryptoNyProperties
              .connect(guest)
              .assignPropertyToCharacter(guestCharacterId, 2)
          ).to.be.revertedWith("CryptoNyWallet.balance");
        });
      });

      describe("assigning property to character", function () {
        let previousBalance;
        let newBalance;

        this.beforeAll(async () => {
          for (i = 0; i < 100; i++) {
            await collectRevenue({
              signer: guest,
              walletContract: cryptoNyWallet,
              propertiesContract: cryptoNyProperties,
              characterId: guestCharacterId,
              propertyId: 1,
              setTime: propertyTypes[0].maxCollection,
            });
          }

          previousBalance = await cryptoNyWallet.balances(guestCharacterId);

          await cryptoNyProperties
            .connect(guest)
            .assignPropertyToCharacter(guestCharacterId, 2);

          newBalance = await cryptoNyWallet.balances(guestCharacterId);
        });

        it("should be assigned to guest character", async () => {
          const property = await cryptoNyProperties.properties(2);
          expect(property.characterId).to.be.equal(guestCharacterId);
        });

        it("should have cost 3% of total investment", async () => {
          const property = await cryptoNyProperties.properties(2);
          const costOfUpgrade = calculateTotalInvested({
            baseCost: propertyTypeAttributes.cost,
            levels: property.level,
            costPerLevel: propertyTypeAttributes.costPerLevel,
          });

          expect(previousBalance.sub(newBalance)).to.be.equal(
            costOfUpgrade.mul(3).div(100)
          );
        });
      });
    });

    describe("purchase of already owned property type", function () {
      it("should be reverted", async () => {
        await expect(
          cryptoNyProperties
            .connect(guest)
            .purchaseProperty(guestCharacterId, 2)
        ).to.be.revertedWith(
          "CryptoNyProperties.purchaseProperty.alreadyOwned"
        );
      });
    });

    describe("purchase and assign owned property type to same character", function () {
      this.beforeAll(async () => {
        await cryptoNyProperties.purchaseProperty(ownerCharacterId, 2);
        await cryptoNyProperties
          .connect(guest)
          .transferFrom(guest.address, owner.address, 2);
      });

      it("should not allow assigning a the property type", async () => {
        await expect(
          cryptoNyProperties
            .connect(owner)
            .assignPropertyToCharacter(ownerCharacterId, 2)
        ).to.be.revertedWith(
          "CryptoNyProperties.transferPropertyToCharacter.alreadyOwnsProperty"
        );
      });
    });
  });
});
