const hoursToSeconds = require("date-fns/hoursToSeconds");
const { ethers, BigNumber } = require("ethers");

const propertyTypes = [
  {
    cost: 0,
    costPerLevel: 0,
    incomePerLevel: ethers.utils.parseEther("263"),
    maxLevel: 1,
    maxCollection: hoursToSeconds(1),
  },
  {
    cost: ethers.utils.parseEther("15000"),
    costPerLevel: ethers.utils.parseEther("950"),
    incomePerLevel: ethers.utils.parseEther("2520"),
    maxLevel: ethers.constants.MaxUint256,
    maxCollection: hoursToSeconds(8),
  },
  {
    cost: ethers.utils.parseEther("35000"),
    costPerLevel: ethers.utils.parseEther("3000"),
    incomePerLevel: ethers.utils.parseEther("16800"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(24),
  },
  {
    cost: ethers.utils.parseEther("250000"),
    costPerLevel: ethers.utils.parseEther("20000"),
    incomePerLevel: ethers.utils.parseEther("240000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(48),
  },
  {
    cost: ethers.utils.parseEther("450000"),
    costPerLevel: ethers.utils.parseEther("20000"),
    incomePerLevel: ethers.utils.parseEther("120000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(12),
  },
  {
    cost: ethers.utils.parseEther("550000"),
    costPerLevel: ethers.utils.parseEther("50000"),
    incomePerLevel: ethers.utils.parseEther("24000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(2),
  },
  {
    cost: ethers.utils.parseEther("9000000"),
    costPerLevel: ethers.utils.parseEther("500000"),
    incomePerLevel: ethers.utils.parseEther("400000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(8),
  },
  {
    cost: ethers.utils.parseEther("17000000"),
    costPerLevel: ethers.utils.parseEther("1600000"),
    incomePerLevel: ethers.utils.parseEther("1800000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(12),
  },
  {
    cost: ethers.utils.parseEther("24000000"),
    costPerLevel: ethers.utils.parseEther("2000000"),
    incomePerLevel: ethers.utils.parseEther("4800000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(24),
  },
  {
    cost: ethers.utils.parseEther("41000000"),
    costPerLevel: ethers.utils.parseEther("4000000"),
    incomePerLevel: ethers.utils.parseEther("14400000"),
    maxLevel: ethers.utils.parseEther("500000"),
    maxCollection: hoursToSeconds(48),
  },
];

module.exports = {
  propertyTypes,
};
