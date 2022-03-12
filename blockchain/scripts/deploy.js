const hre = require("hardhat");

const { main } = require("./deployHelper");

const deployPromise = main()
  .then(() => {})
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
