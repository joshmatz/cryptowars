const hoursToSeconds = require("date-fns/hoursToSeconds");
const { ethers, BigNumber } = require("hardhat");
const { propertyTypes } = require("../../../shared/utils/properties");
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
