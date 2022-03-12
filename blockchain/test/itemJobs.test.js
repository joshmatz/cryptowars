const { expect } = require("chai");
const { waffle, ethers, artifacts } = require("hardhat");
const {
  deployPromise,
  getTestProperties,
  main,
} = require("../scripts/deployHelper");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { BigNumber } = require("ethers");
const { jobTiers } = require("./utils/jobs");
const things = require("./utils/items");

const CharacterArtifact = artifacts.readArtifactSync("CryptoChar");
const ItemsArtifact = artifacts.readArtifactSync("CryptoNYItems");
const JobsArtifact = artifacts.readArtifactSync("CryptoNYJobs");
const WalletArtifact = artifacts.readArtifactSync("CryptoNYWallet");
const { provider, deployContract, deployMockContract } = waffle;

const [wallet, otherWallet] = provider.getWallets();

const getItemId = (name) => {
  const found = things.itemTypes.findIndex((item) => item.name === name);

  if (found === -1) {
    return 0;
  }

  return found;
};

const jobPropsToArray = (props) => {
  return [
    props.energy,
    props.payout,
    props.experience,
    props.experiencePerTier,
    props.requiredItemTypeNames.map(getItemId),
    props.requiredItemTypeCounts,
    props.rewardItemTypeNames.map(getItemId),
  ];
};

describe("cryptoWars.itemJobs", function () {
  let walletMock;
  let characterMock;
  let itemsMock;
  let jobsContract;

  this.beforeAll(async function () {
    characterMock = await deployMockContract(wallet, CharacterArtifact.abi);
    itemsMock = await deployMockContract(wallet, ItemsArtifact.abi);
    walletMock = await deployMockContract(wallet, WalletArtifact.abi);
    jobsContract = await deployContract(wallet, JobsArtifact, [
      characterMock.address,
      walletMock.address,
      itemsMock.address,
    ]);
    await jobsContract._createJobTiers(jobTiers.length);
    await jobsContract._setJobType(
      0,
      0,
      ...jobPropsToArray({
        energy: 0,
        payout: 0,
        experience: 0,
        experiencePerTier: 1,
        requiredItemTypeNames: [],
        requiredItemTypeCounts: [],
        rewardItemTypeNames: [],
      })
    );
    await jobsContract._setJobType(
      0,
      1,
      ...jobPropsToArray({
        energy: 0,
        payout: 0,
        experience: 0,
        experiencePerTier: 1,
        requiredItemTypeNames: [],
        requiredItemTypeCounts: [],
        rewardItemTypeNames: ["Baseball Bat"],
      })
    );

    await characterMock.mock.ownerOf.withArgs(0).returns(wallet.address);
    await characterMock.mock.isCharacterInRegion.withArgs(0, 0).returns(true);
    await walletMock.mock.mintToCharacter.returns();
    await characterMock.mock.updateCurrentAttributes.returns();
  });

  describe("complete a job with no rewardItemTypeId", function () {
    it("should pass", async () => {
      {
        await characterMock.mock.ownerOf.withArgs(0).returns(wallet.address);
        await characterMock.mock.isCharacterInRegion
          .withArgs(0, 0)
          .returns(true);
        await characterMock.mock.updateCurrentAttributes.returns();
        await expect(jobsContract.completeJob(0, 0, 0, 1)).to.emit(
          jobsContract,
          "JobComplete"
        );
      }
    });
  });

  describe("complete a job with a rewardItemTypeId", function () {
    it("should pass", async () => {
      {
        await characterMock.mock.ownerOf.withArgs(0).returns(wallet.address);
        await characterMock.mock.isCharacterInRegion
          .withArgs(0, 0)
          .returns(true);
        await itemsMock.mock.rewardItemToCharacter.returns();
        await characterMock.mock.updateCurrentAttributes.returns();
        await expect(jobsContract.completeJob(0, 0, 1, 1)).to.emit(
          jobsContract,
          "JobComplete"
        );
      }
    });
  });
});
