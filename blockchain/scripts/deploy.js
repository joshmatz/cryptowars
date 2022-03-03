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

const transactions = [];

const deployCharacterContract = async () => {
  if (process.env.CHARACTER_CONTRACT_ADDRESS) {
    console.log("Skipping Character Contract Deployment");
    return process.env.CHARACTER_CONTRACT_ADDRESS;
  }
  const CryptoChar = await ethers.getContractFactory("CryptoChar");
  const cryptoChar = await CryptoChar.deploy();
  transactions.push(await cryptoChar.deployed());
  console.log(`CHARACTER_CONTRACT_ADDRESS=${cryptoChar.address}`);

  return cryptoChar.address;
};

const deployCryptoNYERC20Contract = async () => {
  if (process.env.ERC20_CONTRACT_ADDRESS) {
    console.log("Skipping ERC20 Contract Deployment");
    return process.env.ERC20_CONTRACT_ADDRESS;
  }

  const CryptoNYERC20 = await ethers.getContractFactory("CryptoNYERC20");
  const cryptoNyERC20 = await CryptoNYERC20.deploy();
  transactions.push(await cryptoNyERC20.deployed());
  console.log(`ERC20_CONTRACT_ADDRESS=${cryptoNyERC20.address}`);
  return cryptoNyERC20.address;
};

const deployCryptoNYWallet = async (characterAddress, ERC20Address) => {
  if (process.env.WALLET_CONTRACT_ADDRESS) {
    console.log("Skipping Wallet Deployment");
    return process.env.WALLET_CONTRACT_ADDRESS;
  }
  const CryptoNYWallet = await ethers.getContractFactory("CryptoNYWallet");
  const cryptoNyWallet = await CryptoNYWallet.deploy(
    characterAddress,
    ERC20Address
  );

  const cryptoNyERC20Contract = await ethers.getContractAt(
    "CryptoNYERC20",
    ERC20Address
  );

  transactions.push(await cryptoNyWallet.deployed());
  console.log(`WALLET_CONTRACT_ADDRESS=${cryptoNyWallet.address}`);

  transactions.push(
    await cryptoNyERC20Contract.transferOwnership(cryptoNyWallet.address)
  );
  console.log("Wallet Ownership Transferred");

  transactions.push(
    await cryptoNyERC20Contract.approve(
      cryptoNyWallet.address,
      ethers.constants.MaxUint256
    )
  );
  console.log("Contract approved");

  return cryptoNyWallet.address;
};

const deployCryptoPropertiesContract = async (
  characterAddress,
  walletAddress
) => {
  if (process.env.PROPERTIES_CONTRACT_ADDRESS) {
    console.log("Skipping Properties Deployment");
    return process.env.PROPERTIES_CONTRACT_ADDRESS;
  }
  const CryptoNYProperties = await ethers.getContractFactory(
    "CryptoNYProperties"
  );
  const cryptoNyProperties = await CryptoNYProperties.deploy(characterAddress);
  transactions.push(await cryptoNyProperties.deployed());
  console.log(`PROPERTIES_CONTRACT_ADDRESS=${cryptoNyProperties.address}`);

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract._addRegion(
      0,
      60 * 60 * 9,
      cryptoNyProperties.address
    )
  );
  console.log("Region Added");

  transactions.push(await cryptoNyProperties.setWalletContract(walletAddress));
  console.log("Wallet approved in Properties");

  const walletContract = await ethers.getContractAt(
    "CryptoNYWallet",
    walletAddress
  );
  transactions.push(
    await walletContract.addGameContract(cryptoNyProperties.address)
  );
  console.log("Properties approved in Wallet");

  return cryptoNyProperties.address;
};

const deployJobsContract = async (characterAddress, walletAddress) => {
  if (process.env.JOBS_CONTRACT_ADDRESS) {
    console.log("Skipping Jobs Deployment");
    return process.env.JOBS_CONTRACT_ADDRESS;
  }
  const CryptoNYJobs = await ethers.getContractFactory("CryptoNYJobs");

  const cryptoNyJobs = await CryptoNYJobs.deploy(
    characterAddress,
    walletAddress
  );
  transactions.push(await cryptoNyJobs.deployed());
  console.log(`JOBS_CONTRACT_ADDRESS=${cryptoNyJobs.address}`);

  const walletContract = await ethers.getContractAt(
    "CryptoNYWallet",
    walletAddress
  );
  transactions.push(await walletContract.addGameContract(cryptoNyJobs.address));
  console.log("Jobs approved in Wallet");

  const characterContract = await ethers.getContractAt(
    "CryptoChar",
    characterAddress
  );
  transactions.push(
    await characterContract.addGameContract(cryptoNyJobs.address)
  );
  console.log("Jobs approved in CryptoChar");

  return cryptoNyJobs.address;
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

  const signers = await ethers.getSigners();
  owner = signers[0];
  guest = signers[1];

  let characterAddress;
  let ERC20Address;
  let walletAddress;
  let propertiesAddress;
  let jobsAddress;

  characterAddress = await deployCharacterContract();
  ERC20Address = await deployCryptoNYERC20Contract();
  walletAddress = await deployCryptoNYWallet(characterAddress, ERC20Address);
  propertiesAddress = await deployCryptoPropertiesContract(
    characterAddress,
    walletAddress
  );
  jobsAddress = await deployJobsContract(characterAddress, walletAddress);

  console.log({
    characterAddress,
    ERC20Address,
    walletAddress,
    propertiesAddress,
    jobsAddress,
  });
  /**
   * Set up wallet
   */

  // if (guest) {
  //   console.log("guest");
  //   const c = await ethers.getContractAt("CryptoNYERC20", ERC20Address);
  //   transactions.push(
  //     await c.connect(guest).approve(walletAddress, ethers.constants.MaxUint256)
  //   );
  //   console.log("guest approval complete");
  // }

  /**
   * Set up Properties
   */
  // let startingProperty = process.env.STARTING_PROPERTY || 0;

  // if (typeof startingProperty === "number") {
  // propertiesContract = await ethers.getContractAt(
  //   "CryptoNYProperties",
  //   propertiesAddress
  // );
  // for (let i = startingProperty; i < propertyTypes.length; i++) {
  //   transactions.push(
  //     await propertiesContract._createPropertyType(
  //       ...propertyTypePropsToArray(propertyTypes[i])
  //     )
  //   );
  //   console.log(`Property ${i} Type Created`);
  // }

  // console.log("Properties completed");

  /**
   * Set up jobs
   */

  let startingTier = process.env.STARTING_TIER || 0;

  const jobsContract = await ethers.getContractAt("CryptoNYJobs", jobsAddress);
  for (let i = startingTier; i < jobTiers.length; i++) {
    try {
      await jobsContract._createJobTier();
      console.log(`Tier ${i} Created`);
    } catch (e) {
      console.log(e, { i });
      break;
    }
  }

  let startingJob = process.env.STARTING_JOB || 0;
  startingTier = process.env.STARTING_JOB_TIER || 0;
  for (let i = startingTier; i < jobTiers.length; i++) {
    for (let j = startingJob; j < jobTiers[i].jobs.length; j++) {
      startingJob = 0;

      try {
        await jobsContract._createJobType(
          i,
          ...jobPropsToArray(jobTiers[i].jobs[j])
        );
        console.log(`Job Tier ${i} Job ${j} Created`);
      } catch (e) {
        console.log({ i, j, job: jobTiers[i].jobs[j], e });
        break;
      }
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
  console.log(`export const CharacterContractAddress = "${characterAddress}";`);
  console.log(`export const WalletContractAddress = "${walletAddress}";`);
  console.log(
    `export const PropertiesContractAddress = "${propertiesAddress}";`
  );
  console.log(`export const JobsContractAddress = "${jobsAddress}";`);
  console.log(`export const TokenContractAddress = "${ERC20Address}";`);

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
