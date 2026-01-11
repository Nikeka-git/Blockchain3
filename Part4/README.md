# Part 4 - Hardhat Setup

## Setup
- Hardhat v2.x
- Solidity 0.8.20
- Mocha + Chai tests
- Gas reporter
- dotenv for secrets

## Commands
- Compile: npx hardhat compile
- Tests + gas report: npx hardhat test
- Deploy locally: npx hardhat run scripts/deploy.js --network hardhat
- Local network: npx hardhat node
- Console: npx hardhat console

## Features
- ERC-20 contract (MyToken.sol)
- Deployment script
- Tests for name/symbol, mint, transfer
- Gas reporting enabled in config