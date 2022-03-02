// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const hoursToSeconds = require("date-fns/hoursToSeconds");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { jobTiers } = require("../test/utils/jobs");
const { propertyTypes } = require("../test/utils/properties");

const propertyTypePropsToArray = (props) => {
  return [
    props.cost,
    props.costPerLevel,
    props.incomePerLevel,
    props.maxLevel,
    props.maxCollection,
  ];
};

const jobPropsToArray = (props) => {
  return [
    props.energy,
    props.payout,
    props.experience,
    props.experiencePerTier,
  ];
};

async function main() {
  let cryptoChar;
  let owner;
  let guest;
  let cryptoNyProperties;
  let cryptoNyERC20;
  let cryptoNyWallet;
  let cryptoNyJobs;

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const transactions = [];
  const signers = await ethers.getSigners();
  owner = signers[0];
  guest = signers[1];

  const CryptoChar = await ethers.getContractFactory("CryptoChar");
  cryptoChar = await CryptoChar.deploy();
  transactions.push(await cryptoChar.deployed());

  /**
   * Set up token
   */
  const CryptoNYERC20 = await ethers.getContractFactory("CryptoNYERC20");
  cryptoNyERC20 = await CryptoNYERC20.deploy();
  transactions.push(await cryptoNyERC20.deployed());

  /**
   * Set up wallet
   */
  const CryptoNYWallet = await ethers.getContractFactory("CryptoNYWallet");
  cryptoNyWallet = await CryptoNYWallet.deploy(
    cryptoChar.address,
    cryptoNyERC20.address
  );

  transactions.push(await cryptoNyWallet.deployed());

  transactions.push(
    await cryptoNyERC20.transferOwnership(cryptoNyWallet.address)
  );

  transactions.push(
    await cryptoNyERC20.approve(
      cryptoNyWallet.address,
      ethers.constants.MaxUint256
    )
  );

  transactions.push(
    await cryptoNyERC20
      .connect(guest)
      .approve(cryptoNyWallet.address, ethers.constants.MaxUint256)
  );

  /**
   * Set up Properties
   */
  const CryptoNYProperties = await ethers.getContractFactory(
    "CryptoNYProperties"
  );
  cryptoNyProperties = await CryptoNYProperties.deploy(cryptoChar.address);
  transactions.push(await cryptoNyProperties.deployed());

  transactions.push(
    await cryptoChar._addRegion(0, 60 * 60 * 9, cryptoNyProperties.address)
  );

  transactions.push(
    await cryptoNyProperties.setWalletContract(cryptoNyWallet.address)
  );

  transactions.push(
    await cryptoNyWallet.addGameContract(cryptoNyProperties.address)
  );

  for (let i = 0; i < propertyTypes.length; i++) {
    transactions.push(
      await cryptoNyProperties._createPropertyType(
        ...propertyTypePropsToArray(propertyTypes[i])
      )
    );
  }

  /**
   * Set up jobs
   */

  const CryptoNYJobs = await ethers.getContractFactory("CryptoNYJobs");

  cryptoNyJobs = await CryptoNYJobs.deploy(
    cryptoChar.address,
    cryptoNyWallet.address
  );

  transactions.push(await cryptoNyWallet.addGameContract(cryptoNyJobs.address));
  transactions.push(await cryptoChar.addGameContract(cryptoNyJobs.address));

  for (let i = 0; i < jobTiers.length; i++) {
    try {
      await cryptoNyJobs._createJobTier();
      for (let j = 0; j < jobTiers[i].jobs.length; j++) {
        try {
          await cryptoNyJobs._createJobType(
            i,
            ...jobPropsToArray(jobTiers[i].jobs[j])
          );
        } catch (e) {
          console.log({ i, j, job: jobTiers[i].jobs[j], e });
        }
      }
    } catch (e) {
      console.log({ i });
    }
  }

  /**
   * Calculate Gas Costs
   */
  let gastotal = BigNumber.from(0);
  for (let i = 0; i < transactions.length; i++) {
    const receipt = await ethers.provider.getTransactionReceipt(
      transactions[i].deployTransaction?.hash || transactions[i].hash
    );
    // Use https://www.cryptoneur.xyz/gas-fees-calculator to look up cost to deploy
    gastotal = gastotal.add(receipt.gasUsed);
  }

  console.log("Gas to deploy: ", gastotal.toString());
  console.log(
    `export const CharacterContractAddress = "${cryptoChar.address}";`
  );
  console.log(
    `export const WalletContractAddress = "${cryptoNyWallet.address}";`
  );
  console.log(
    `export const PropertiesContractAddress = "${cryptoNyProperties.address}";`
  );
  console.log(`export const JobsContractAddress = "${cryptoNyJobs.address}";`);
  console.log(
    `export const TokenContractAddress = "${cryptoNyERC20.address}";`
  );

  await cryptoNyERC20.connect(owner);

  return {
    owner,
    guest,
    cryptoChar,
    cryptoNyProperties,
    cryptoNyERC20,
    cryptoNyWallet,
    cryptoNyJobs,
    propertyTypes,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
const deployPromise = main()
  .then(() => {})
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

module.exports = {
  // deployPromise,
  main,
};
