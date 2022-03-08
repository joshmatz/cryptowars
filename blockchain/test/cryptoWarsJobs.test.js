const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployPromise, getTestProperties, main } = require("../scripts/deploy");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { BigNumber } = require("ethers");
const { jobTiers } = require("./utils/jobs");

describe("cryptoWars.jobs", function () {
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

  this.beforeAll(async function () {
    const results = await main();
    cryptoChar = await ethers.getContractAt(
      "CryptoChar",
      results.characterAddress
    );
    cryptoNyProperties = await ethers.getContractAt(
      "CryptoNYProperties",
      results.propertiesAddress
    );
    cryptoNyERC20 = await ethers.getContractAt(
      "CryptoNYERC20",
      results.ERC20Address
    );
    cryptoNyWallet = await ethers.getContractAt(
      "CryptoNYWallet",
      results.walletAddress
    );
    cryptoNyJobs = await ethers.getContractAt(
      "CryptoNYJobs",
      results.jobsAddress
    );
    owner = results.owner;
    guest = results.guest;
    propertyTypes = results.propertyTypes;
    await cryptoChar.connect(guest).create("hiya", 0);
  });

  describe("owner", function () {
    describe("permissions", function () {
      it("should not complete for nonexistent token", async () => {
        await expect(cryptoNyJobs.completeJob(34, 0, 0, 1)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      });

      it("should not let owner complete a job for a guest character", async () => {
        await expect(
          cryptoNyJobs.completeJob(guestCharacterId, 0, 0, 1)
        ).to.be.revertedWith("CryptoNyJobs.characterOwner");
      });

      it("should not complete a tier that is not unlocked", async () => {
        await expect(
          cryptoNyJobs.completeJob(ownerCharacterId, 1, 0, 1)
        ).to.be.revertedWith("CryptoNyJobs.completeJob.tierLocked");
      });
    });

    describe("completing a job", function () {
      let previousCharacter;
      let newCharacter;
      let previousCharacterBalance;
      let previousOwnerBalance;

      this.beforeAll(async () => {
        previousOwnerBalance = await cryptoNyERC20.balanceOf(owner.address);
        previousCharacterBalance = await cryptoNyWallet.balances(
          guestCharacterId
        );

        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        await cryptoNyJobs.completeJob(ownerCharacterId, 0, 0, 1);
        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      describe("wallet", function () {
        it("should increase character balance", async () => {
          const balance = await cryptoNyWallet.balances(ownerCharacterId);
          expect(balance).to.equal(
            previousCharacterBalance.add(jobTiers[0].jobs[0].payout)
          );
        });

        it("should keep owner balance the same", async () => {
          const balance = await cryptoNyERC20.balanceOf(owner.address);
          expect(balance).to.equal(previousOwnerBalance);
        });
      });

      describe("experience", function () {
        it("should gain experience", async () => {
          expect(newCharacter.experience).to.be.equal(
            previousCharacter.experience.add(jobTiers[0].jobs[0].experience)
          );
        });
      });

      describe("energy", function () {
        it("should expend energy", async () => {
          expect(newCharacter.energy.current).to.be.equal(
            previousCharacter.energy.current.sub(jobTiers[0].jobs[0].energy)
          );
        });

        it("should retain currentMax", async () => {
          expect(newCharacter.energy.currentMax).to.be.equal(
            previousCharacter.energy.currentMax
          );
        });

        it("should retain equippedMax", async () => {
          expect(newCharacter.energy.equippedMax).to.be.equal(
            previousCharacter.energy.equippedMax
          );
        });
      });

      describe("stamina", function () {
        it("should not affect current", async () => {
          expect(newCharacter.stamina.current).to.be.equal(
            previousCharacter.stamina.current
          );
        });

        it("should not affect currentMax", async () => {
          expect(newCharacter.stamina.currentMax).to.be.equal(
            previousCharacter.stamina.currentMax
          );
        });

        it("should not affect equippedMax", async () => {
          expect(newCharacter.stamina.equippedMax).to.be.equal(
            previousCharacter.stamina.equippedMax
          );
        });
      });

      describe("health", function () {
        it("should not affect current", async () => {
          expect(newCharacter.health.current).to.be.equal(
            previousCharacter.health.current
          );
        });

        it("should not affect currentMax", async () => {
          expect(newCharacter.health.currentMax).to.be.equal(
            previousCharacter.health.currentMax
          );
        });

        it("should not affect equippedMax", async () => {
          expect(newCharacter.health.equippedMax).to.be.equal(
            previousCharacter.health.equippedMax
          );
        });
      });
    });
  });

  describe("guest", function () {
    describe("completing a job", function () {
      let previousCharacter;
      let newCharacter;
      this.beforeAll(async () => {
        previousCharacter = await cryptoChar.characters(guestCharacterId);
        await cryptoNyJobs
          .connect(guest)
          .completeJob(guestCharacterId, 0, 0, 1);
        newCharacter = await cryptoChar.characters(guestCharacterId);
      });

      describe("experience", function () {
        it("should gain experience", async () => {
          expect(newCharacter.experience).to.be.equal(
            previousCharacter.experience.add(jobTiers[0].jobs[0].experience)
          );
        });
      });

      describe("energy", function () {
        it("should expend energy", async () => {
          expect(newCharacter.energy.current).to.be.equal(
            previousCharacter.energy.current.sub(jobTiers[0].jobs[0].energy)
          );
        });

        it("should retain currentMax", async () => {
          expect(newCharacter.energy.currentMax).to.be.equal(
            previousCharacter.energy.currentMax
          );
        });

        it("should retain equippedMax", async () => {
          expect(newCharacter.energy.equippedMax).to.be.equal(
            previousCharacter.energy.equippedMax
          );
        });
      });

      describe("stamina", function () {
        it("should not affect current", async () => {
          expect(newCharacter.stamina.current).to.be.equal(
            previousCharacter.stamina.current
          );
        });

        it("should not affect currentMax", async () => {
          expect(newCharacter.stamina.currentMax).to.be.equal(
            previousCharacter.stamina.currentMax
          );
        });

        it("should not affect equippedMax", async () => {
          expect(newCharacter.stamina.equippedMax).to.be.equal(
            previousCharacter.stamina.equippedMax
          );
        });
      });

      describe("health", function () {
        it("should not affect current", async () => {
          expect(newCharacter.health.current).to.be.equal(
            previousCharacter.health.current
          );
        });

        it("should not affect currentMax", async () => {
          expect(newCharacter.health.currentMax).to.be.equal(
            previousCharacter.health.currentMax
          );
        });

        it("should not affect equippedMax", async () => {
          expect(newCharacter.health.equippedMax).to.be.equal(
            previousCharacter.health.equippedMax
          );
        });
      });
    });
  });

  describe("Gain experience to increase levels", function () {
    describe("one level", function () {
      let previousCharacter;
      let newCharacter;
      let jobExperience;

      this.beforeAll(async () => {
        const experiencePerJob = jobTiers[0].jobs[0].experience;
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        const requiredJobsForLevelOne =
          (7 - previousCharacter.experience.toNumber()) / experiencePerJob;

        for (let i = 0; i < requiredJobsForLevelOne; i++) {
          await cryptoNyJobs.completeJob(ownerCharacterId, 0, 0, 1);
        }

        jobExperience = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          0,
          0
        );

        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      it("should level up character", async () => {
        expect(newCharacter.level).to.be.equal(previousCharacter.level.add(1));
      });

      it("should add 1 skillpoint", () => {
        expect(newCharacter.skillPoints).to.be.equal(
          previousCharacter.skillPoints.add(1)
        );
      });

      it("should have 3 energy remaining", () => {
        expect(newCharacter.energy.current).to.be.equal(3);
      });

      it("should have experience added to mastery", () => {
        expect(jobExperience.total).to.be.equal(7);
      });

      it("should level should not have increased", () => {
        expect(jobExperience.level).to.be.equal(0);
      });
    });

    describe("energy requirements", function () {
      it("should use up all energy and then require more", async () => {
        await expect(
          cryptoNyJobs.completeJob(ownerCharacterId, 0, 0, 4)
        ).to.be.revertedWith("CryptoChar.updateCurrentAttributes.energy");
      });
    });

    describe("energy regen", function () {
      let previousCharacter;
      let newCharacter;
      let requiredForLevelFive;
      let jobExperience;
      this.beforeAll(async () => {
        const lastBlock = await ethers.provider.getBlock();
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        console.log("fastforwarding...");
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          previousCharacter.energy.lastCollected.add(60 * 50).toNumber(),
        ]);
        await cryptoChar.regenerateEnergy(ownerCharacterId);
        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      it("should have 10 energy", () => {
        expect(newCharacter.energy.current).to.be.equal(10);
      });
    });

    describe("four levels", function () {
      let previousCharacter;
      let newCharacter;
      let requiredForLevelFive;
      let jobExperience;
      this.beforeAll(async () => {
        const experiencePerJob = jobTiers[0].jobs[0].experience;
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        requiredForLevelFive =
          (156.25 - previousCharacter.experience.toNumber()) / experiencePerJob;

        for (let i = 0; i < requiredForLevelFive; i++) {
          await cryptoNyJobs.completeJob(ownerCharacterId, 0, 0, 1);
          if (i % 9 === 0) {
            await ethers.provider.send("evm_increaseTime", [60 * 50]);

            await cryptoChar.regenerateEnergy(ownerCharacterId);
          }
        }

        jobExperience = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          0,
          0
        );

        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      it("should require 149.25 jobs", async () => {
        expect(requiredForLevelFive).to.be.equal(149.25);
      });

      it("should achieve mastery level 3", async () => {
        expect(jobExperience.level).to.be.equal(3);
      });

      it("should level up character", async () => {
        expect(newCharacter.level).to.be.equal(previousCharacter.level.add(4));
      });

      it("should add 7 skillpoints", () => {
        expect(newCharacter.skillPoints).to.be.equal(
          previousCharacter.skillPoints.add(7)
        );
      });
    });
  });

  describe("tier 1 job 2", function () {
    let previousCharacter;
    let newCharacter;
    let jobExperience;

    this.beforeAll(async () => {
      previousCharacter = await cryptoChar.characters(ownerCharacterId);
      await cryptoNyJobs.completeJob(ownerCharacterId, 0, 1, 1);
      jobExperience = await cryptoNyJobs.jobExperience(ownerCharacterId, 0, 1);
      newCharacter = await cryptoChar.characters(ownerCharacterId);
    });

    it("should have 1 energy", () => {
      expect(newCharacter.energy.current).to.be.equal(
        previousCharacter.energy.current.sub(jobTiers[0].jobs[1].energy)
      );
    });

    it("should have experience added to mastery", () => {
      expect(jobExperience.total).to.be.equal(jobTiers[0].jobs[1].experience);
    });

    it("should level should not have increased", () => {
      expect(jobExperience.level).to.be.equal(0);
    });
  });

  describe("unlock and complete jobs in tier 2", function () {
    describe("utilize skillpoints for energy", function () {
      let previousCharacter;
      let newCharacter;
      this.beforeAll(async () => {
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        await cryptoChar.useSkillPoints(
          ownerCharacterId,
          previousCharacter.skillPoints,
          0,
          0,
          0
        );
        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      it("should remove skillpoints", () => {
        expect(newCharacter.skillPoints).to.be.equal(0);
      });

      it("should increase energy.current", () => {
        expect(newCharacter.energy.current).to.be.equal(
          previousCharacter.energy.current.add(previousCharacter.skillPoints)
        );
      });

      it("should increase energy.characterMax", () => {
        expect(newCharacter.energy.characterMax).to.be.equal(
          previousCharacter.energy.characterMax.add(
            previousCharacter.skillPoints
          )
        );
      });

      it("should increase energy.equippedMax", () => {
        expect(newCharacter.energy.equippedMax).to.be.equal(
          previousCharacter.energy.equippedMax.add(
            previousCharacter.skillPoints
          )
        );
      });

      it("should leave stamina.current the same", () => {
        expect(newCharacter.stamina.current).to.be.equal(
          previousCharacter.stamina.current
        );
      });

      it("should leave attack.current the same", () => {
        expect(newCharacter.stamina.current).to.be.equal(
          previousCharacter.stamina.current
        );
      });

      it("should leave defense.current the same", () => {
        expect(newCharacter.stamina.current).to.be.equal(
          previousCharacter.stamina.current
        );
      });
    });

    describe(" get enough energy to complete all jobs in tier", function () {
      let newCharacter;
      this.beforeAll(async () => {
        for (let i = 0; i < 201; i++) {
          await cryptoNyJobs.completeJob(ownerCharacterId, 0, 3, 1);

          if (i % 3 === 0) {
            await ethers.provider.send("evm_increaseTime", [60 * 500]);
            await cryptoChar.regenerateEnergy(ownerCharacterId);
          }
        }
        newCharacter = await cryptoChar.characters(ownerCharacterId);
        // use skill points on energy
        await cryptoChar.useSkillPoints(
          ownerCharacterId,
          newCharacter.skillPoints,
          0,
          0,
          0
        );
        await ethers.provider.send("evm_increaseTime", [60 * 500]);
        await cryptoChar.regenerateEnergy(ownerCharacterId);
        newCharacter = await cryptoChar.characters(ownerCharacterId);
      });

      it("should have 25 energy.current", () => {
        expect(newCharacter.energy.current).to.be.equal(25);
      });

      it("should have 25 energy.characterMax", () => {
        expect(newCharacter.energy.characterMax).to.be.equal(25);
      });

      it("should have 25 energy.equippedMax", () => {
        expect(newCharacter.energy.equippedMax).to.be.equal(25);
      });
    });
  });

  describe("do all jobs in tier 0 to master level 1", function () {
    let previousCharacter;
    let newCharacter;
    let characterJobTier = 0;
    this.beforeAll(async () => {
      previousCharacter = await cryptoChar.characters(ownerCharacterId);
      for (let i = 0; i < jobTiers[0].jobs.length; i++) {
        for (let j = 0; j < 25; j++) {
          await cryptoNyJobs.completeJob(ownerCharacterId, 0, i, 1);
          await ethers.provider.send("evm_increaseTime", [60 * 500]);
          await cryptoChar.regenerateEnergy(ownerCharacterId);
        }
        const exp = await cryptoNyJobs.jobExperience(ownerCharacterId, 0, i);
      }
      newCharacter = await cryptoChar.characters(ownerCharacterId);
      // get character tier level
      characterJobTier = await cryptoNyJobs.characterJobTier(ownerCharacterId);
    });

    it("should have 25 energy.characterMax", () => {
      expect(newCharacter.energy.characterMax).to.be.equal(25);
    });

    it("should have 25 energy.equippedMax", () => {
      expect(newCharacter.energy.equippedMax).to.be.equal(25);
    });

    it("should have increased characterExperience tier", () => {
      expect(characterJobTier).to.be.equal(1);
    });
  });

  describe("do jobs in second tier", function () {
    let previousCharacter;
    let newCharacter;
    let characterJobTier = 0;
    const JOB_TIER = 1;
    this.beforeAll(async () => {
      previousCharacter = await cryptoChar.characters(ownerCharacterId);
      for (let i = 0; i < jobTiers[JOB_TIER].jobs.length; i++) {
        for (let j = 0; j < 25; j++) {
          await cryptoNyJobs.completeJob(ownerCharacterId, JOB_TIER, i, 1);
          await ethers.provider.send("evm_increaseTime", [60 * 500]);
          await cryptoChar.regenerateEnergy(ownerCharacterId);
        }
        const exp = await cryptoNyJobs.jobExperience(ownerCharacterId, 0, i);
      }
      newCharacter = await cryptoChar.characters(ownerCharacterId);
      // get character tier level
      characterJobTier = await cryptoNyJobs.characterJobTier(ownerCharacterId);
    });

    it("should have 25 energy.characterMax", () => {
      expect(newCharacter.energy.characterMax).to.be.equal(25);
    });

    it("should have 25 energy.equippedMax", () => {
      expect(newCharacter.energy.equippedMax).to.be.equal(25);
    });

    it("should have increased characterExperience tier", () => {
      expect(characterJobTier).to.be.equal(2);
    });
  });

  describe("multiple job runs", function () {
    const jobTier = 2;
    describe("2 runs", function () {
      let newCharacter;
      let previousExp;
      let previousCharacter;
      let exp;
      let previousCharacterBalance;
      let characterBalance;
      this.beforeAll(async () => {
        previousExp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          0
        );
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        previousCharacterBalance = await cryptoNyWallet.balances(
          ownerCharacterId
        );
        await cryptoChar.useSkillPoints(
          ownerCharacterId,
          previousCharacter.skillPoints,
          0,
          0,
          0
        );
        previousCharacter = await cryptoChar.characters(ownerCharacterId);

        await cryptoNyJobs.completeJob(ownerCharacterId, jobTier, 0, 2);

        exp = await cryptoNyJobs.jobExperience(ownerCharacterId, jobTier, 0);

        newCharacter = await cryptoChar.characters(ownerCharacterId);
        characterBalance = await cryptoNyWallet.balances(ownerCharacterId);
      });

      it("should use double energy", () => {
        expect(newCharacter.energy.current).to.be.equal(
          previousCharacter.energy.current.sub(
            jobTiers[jobTier].jobs[0].energy * 2
          )
        );
      });

      it("should double experience for character", () => {
        expect(newCharacter.experience).to.be.equal(
          previousCharacter.experience.add(
            jobTiers[jobTier].jobs[0].experience * 2
          )
        );
      });

      it("should double experience of jobExperience", () => {
        expect(exp.total).to.be.equal(
          previousExp.total.add(jobTiers[jobTier].jobs[0].experience * 2)
        );
      });

      it("should double payout", () => {
        expect(characterBalance).to.be.equal(
          previousCharacterBalance.add(jobTiers[jobTier].jobs[0].payout.mul(2))
        );
      });
    });

    describe("8 runs", function () {
      const runs = 8;
      let newCharacter;
      let previousExp;
      let previousCharacter;
      let exp;
      let previousCharacterBalance;
      let characterBalance;
      this.beforeAll(async () => {
        previousExp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          0
        );
        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        previousCharacterBalance = await cryptoNyWallet.balances(
          ownerCharacterId
        );

        await cryptoNyJobs.completeJob(ownerCharacterId, jobTier, 0, runs);

        exp = await cryptoNyJobs.jobExperience(ownerCharacterId, jobTier, 0);

        newCharacter = await cryptoChar.characters(ownerCharacterId);
        characterBalance = await cryptoNyWallet.balances(ownerCharacterId);
      });

      it("should use double energy", () => {
        expect(newCharacter.energy.current).to.be.equal(
          previousCharacter.energy.current.sub(
            jobTiers[jobTier].jobs[0].energy * runs
          )
        );
      });

      it("should double experience for character", () => {
        expect(newCharacter.experience).to.be.equal(
          previousCharacter.experience.add(
            jobTiers[jobTier].jobs[0].experience * runs
          )
        );
      });

      it("should double experience of jobExperience", () => {
        expect(exp.total).to.be.equal(
          previousExp.total.add(jobTiers[jobTier].jobs[0].experience * runs)
        );
      });

      it("should double payout", () => {
        expect(characterBalance).to.be.equal(
          previousCharacterBalance.add(
            jobTiers[jobTier].jobs[0].payout.mul(runs)
          )
        );
      });
    });

    describe("30 runs without enough energy", function () {
      it("should fail", async () => {
        await expect(
          cryptoNyJobs.completeJob(ownerCharacterId, 2, 1, 30)
        ).to.be.revertedWith("CryptoChar.updateCurrentAttributes.energy");
      });
    });

    describe("30 runs with enough energy", function () {
      const runs = 20;
      const jobId = 1;
      let newCharacter;
      let previousExp;
      let previousCharacter;
      let exp;
      let previousCharacterBalance;
      let characterBalance;
      this.beforeAll(async () => {
        previousCharacter = await cryptoChar.characters(ownerCharacterId);

        await ethers.provider.send("evm_setNextBlockTimestamp", [
          previousCharacter.energy.lastCollected.add(60 * 5000).toNumber(),
        ]);

        await cryptoChar.regenerateEnergy(ownerCharacterId);
        let completions = 0;
        let jobsCompleted = 0;
        do {
          previousCharacter = await cryptoChar.characters(ownerCharacterId);

          await cryptoNyJobs.completeJob(
            ownerCharacterId,
            jobTier,
            0,
            previousCharacter.energy.current.div(
              jobTiers[jobTier].jobs[0].energy
            )
          );

          await ethers.provider.send("evm_setNextBlockTimestamp", [
            previousCharacter.energy.lastCollected.add(60 * 5000).toNumber(),
          ]);
          jobsCompleted += previousCharacter.energy.current
            .div(jobTiers[jobTier].jobs[0].energy)
            .toNumber();

          await cryptoChar.regenerateEnergy(ownerCharacterId);
          if (previousCharacter.skillPoints.toNumber()) {
            console.log(
              "level up!",
              ++completions,
              "jobs done: ",
              jobsCompleted
            );
            await cryptoChar.useSkillPoints(
              ownerCharacterId,
              previousCharacter.skillPoints,
              0,
              0,
              0
            );
          }
          previousCharacter = await cryptoChar.characters(ownerCharacterId);
        } while (previousCharacter.energy.current.lt(155));
        previousCharacter = await cryptoChar.characters(ownerCharacterId);

        await ethers.provider.send("evm_setNextBlockTimestamp", [
          previousCharacter.energy.lastCollected.add(60 * 500).toNumber(),
        ]);

        await cryptoChar.regenerateEnergy(ownerCharacterId);

        previousCharacter = await cryptoChar.characters(ownerCharacterId);
        previousExp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          jobId
        );
        previousCharacterBalance = await cryptoNyWallet.balances(
          ownerCharacterId
        );

        await cryptoNyJobs.completeJob(ownerCharacterId, jobTier, jobId, runs);

        exp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          jobId
        );

        newCharacter = await cryptoChar.characters(ownerCharacterId);
        characterBalance = await cryptoNyWallet.balances(ownerCharacterId);
      });

      it("should increase skill points twice", () => {
        expect(newCharacter.skillPoints).to.be.equal(
          previousCharacter.skillPoints.add(2)
        );
      });
    });

    describe("20 runs with enough energy and prev tier experience", function () {
      const runs = 20;
      const jobId = 1;
      let newCharacter;
      let previousExp;
      let previousCharacter;
      let exp;
      let previousCharacterBalance;
      let characterBalance;
      this.beforeAll(async () => {
        previousCharacter = await cryptoChar.characters(ownerCharacterId);

        await ethers.provider.send("evm_setNextBlockTimestamp", [
          previousCharacter.energy.lastCollected.add(60 * 5000).toNumber(),
        ]);

        await cryptoChar.regenerateEnergy(ownerCharacterId);
        previousCharacter = await cryptoChar.characters(ownerCharacterId);

        previousExp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          jobId
        );
        previousCharacterBalance = await cryptoNyWallet.balances(
          ownerCharacterId
        );

        await cryptoNyJobs.completeJob(ownerCharacterId, jobTier, jobId, runs);

        exp = await cryptoNyJobs.jobExperience(
          ownerCharacterId,
          jobTier,
          jobId
        );

        newCharacter = await cryptoChar.characters(ownerCharacterId);
        characterBalance = await cryptoNyWallet.balances(ownerCharacterId);
      });

      it("should increase skill points once to max", () => {
        expect(newCharacter.skillPoints).to.be.equal(
          previousCharacter.skillPoints.add(1)
        );
      });
    });
  });
});
