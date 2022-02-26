const hoursToSeconds = require("date-fns/hoursToSeconds");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const propertyTypes = [
  {
    name: "Louie's Deli",
    cost: 0,
    costPerLevel: 0,
    incomePerLevel: ethers.utils.parseEther("263.0"),
    maxLevel: 1,
    maxCollection: hoursToSeconds(1),
  },
  {
    name: "Flophouse",
    cost: ethers.utils.parseEther("15000.0"),
    costPerLevel: ethers.utils.parseEther("950.0"),
    incomePerLevel: ethers.utils.parseEther("2520.0"),
    maxLevel: ethers.constants.MaxUint256,
    maxCollection: hoursToSeconds(8),
  },
  {
    name: "Pawnshop",
    cost: ethers.utils.parseEther("35000.0"),
    costPerLevel: ethers.utils.parseEther("3000.0"),
    incomePerLevel: ethers.utils.parseEther("1680.0"),
    maxLevel: ethers.utils.parseEther("500000.0"),
    maxCollection: hoursToSeconds(24),
  },
  {
    name: "Tenement",
    cost: ethers.utils.parseEther("250000.0"),
    costPerLevel: ethers.utils.parseEther("20000"),
    incomePerLevel: ethers.utils.parseEther("240000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(48),
  },
  {
    name: "Warehouse",
    cost: ethers.utils.parseEther("450000.0"),
    costPerLevel: ethers.utils.parseEther("20000"),
    incomePerLevel: ethers.utils.parseEther("120000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(12),
  },
  {
    name: "Restaurant",
    cost: ethers.utils.parseEther("550000.0"),
    costPerLevel: ethers.utils.parseEther("50000"),
    incomePerLevel: ethers.utils.parseEther("24000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(2),
  },
  {
    name: "Dockyard",
    cost: ethers.utils.parseEther("9000000.0"),
    costPerLevel: ethers.utils.parseEther("500000"),
    incomePerLevel: ethers.utils.parseEther("400000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(8),
  },
  {
    name: "Office Park",
    cost: ethers.utils.parseEther("17000000.0"),
    costPerLevel: ethers.utils.parseEther("1600000"),
    incomePerLevel: ethers.utils.parseEther("1800000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(12),
  },
  {
    name: "Uptown Hotel",
    cost: ethers.utils.parseEther("24000000.0"),
    costPerLevel: ethers.utils.parseEther("2000000"),
    incomePerLevel: ethers.utils.parseEther("4800000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(24),
  },
  {
    name: "Mega Casino",
    cost: ethers.utils.parseEther("41000000.0"),
    costPerLevel: ethers.utils.parseEther("4000000"),
    incomePerLevel: ethers.utils.parseEther("14400000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(48),
  },
];

const collectRevenue = async ({
  signer,
  walletContract,
  propertiesContract,
  characterId,
  propertyId,
  increaseTime = hoursToSeconds(24),
  setTime,
}) => {
  if (increaseTime) {
    await ethers.provider.send("evm_increaseTime", [increaseTime]);
  }

  if (setTime) {
    // We need to collectRevenue prior to setting the time stamp
    // so the exact time difference between old/new balance can be utilized for calculations.
    await propertiesContract
      .connect(signer)
      .collectRevenue(characterId, propertyId);

    const ownedProperty = await propertiesContract.properties(propertyId);

    await ethers.provider.send("evm_setNextBlockTimestamp", [
      ownedProperty.lastCollected.add(setTime).toNumber(),
    ]);
  }
  const oldBalance = await walletContract.balances(characterId);
  await propertiesContract
    .connect(signer)
    .collectRevenue(characterId, propertyId);
  const newBalance = await walletContract.balances(characterId);

  return { oldBalance, newBalance };
};

const calculateCostToUpgrade = ({
  fromLevel,
  levels,
  costPerLevel,
  baseCost,
}) => {
  const costOfUpgrade = baseCost
    .mul(levels)
    .add(fromLevel.add(levels).div(2).mul(levels).mul(costPerLevel));

  return costOfUpgrade;
};

const calculateTotalInvested = ({ baseCost, levels, costPerLevel }) => {
  const totalInvested = baseCost
    .mul(levels)
    .add(levels.div(2).mul(levels).mul(costPerLevel));
  return totalInvested;
};

module.exports = {
  calculateTotalInvested,
  calculateCostToUpgrade,
  collectRevenue,
  propertyTypes,
};
