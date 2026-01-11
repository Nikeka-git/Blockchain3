require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  networks: {
    hardhat: {},
  },
};