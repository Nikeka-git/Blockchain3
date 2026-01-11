const { expect } = require("chai");
const hre = require("hardhat");

describe("MyToken", function () {
    let MyToken, myToken, owner, addr1, addr2;

    const INITIAL_SUPPLY = 1000000;
    const DECIMALS = 18;
    const TOTAL_SUPPLY = BigInt(INITIAL_SUPPLY) * BigInt(10 ** DECIMALS);

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        const MyTokenFactory = await hre.ethers.getContractFactory("MyToken");
        myToken = await MyTokenFactory.deploy(INITIAL_SUPPLY);
        await myToken.deployed();
    });

    describe("Deployment", function () {
        it("should set correct name, symbol and decimals", async function () {
            expect(await myToken.name()).to.equal("MyToken");
            expect(await myToken.symbol()).to.equal("MTK");
            expect(await myToken.decimals()).to.equal(DECIMALS);
        });

        it("should assign the total supply to the deployer", async function () {
            const ownerBalance = await myToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(TOTAL_SUPPLY);
        });

        it("should emit Transfer event on deployment (from zero address)", async function () {
            const receipt = await myToken.deployTransaction.wait();
            const transferEvent = receipt.events.find(e => e.event === "Transfer");

            expect(transferEvent).to.exist;
            expect(transferEvent.args.from).to.equal(hre.ethers.constants.AddressZero);
            expect(transferEvent.args.to).to.equal(owner.address);
            expect(transferEvent.args.value).to.equal(TOTAL_SUPPLY);
        });
    });

    describe("Transfers", function () {
        it("should transfer tokens successfully between accounts", async function () {
            const transferAmount = BigInt(5000) * BigInt(10 ** DECIMALS);

            await expect(myToken.transfer(addr1.address, transferAmount))
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);

            expect(await myToken.balanceOf(addr1.address)).to.equal(transferAmount);
            expect(await myToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - transferAmount);
        });

        it("should fail when transferring more tokens than balance", async function () {
            const tooMuch = TOTAL_SUPPLY + BigInt(1);

            await expect(myToken.transfer(addr1.address, tooMuch))
                .to.be.revertedWith("Insufficient balance");
        });

        it("should fail when transferring to zero address", async function () {
            const amount = BigInt(1000) * BigInt(10 ** DECIMALS);

            await expect(myToken.transfer(hre.ethers.constants.AddressZero, amount))
                .to.be.revertedWith("Invalid recipient address");
        });

        it("should allow transferring to yourself (no state change)", async function () {
            const amount = BigInt(500) * BigInt(10 ** DECIMALS);

            const initialBalance = await myToken.balanceOf(owner.address);

            await expect(myToken.transfer(owner.address, amount))
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, owner.address, amount);

            const finalBalance = await myToken.balanceOf(owner.address);
            expect(finalBalance).to.equal(initialBalance);
        });
    });

    describe("transferFrom & Approve", function () {
        it("should allow approved spender to transferFrom", async function () {
            const approveAmount = BigInt(3000) * BigInt(10 ** DECIMALS);

            await myToken.approve(addr1.address, approveAmount);

            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, approveAmount))
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, addr2.address, approveAmount);

            expect(await myToken.balanceOf(addr2.address)).to.equal(approveAmount);
            expect(await myToken.allowance(owner.address, addr1.address)).to.equal(0);
        });

        it("should fail transferFrom without sufficient allowance", async function () {
            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, 1000))
                .to.be.revertedWith("Insufficient allowance");
        });

        it("should fail transferFrom without sufficient balance", async function () {
            const amount = BigInt(5000000) * BigInt(10 ** DECIMALS);

            await myToken.approve(addr1.address, amount);

            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, amount))
                .to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Mint & Burn", function () {
        it("should allow minting new tokens", async function () {
            const mintAmount = BigInt(50000) * BigInt(10 ** DECIMALS);

            await expect(myToken.mint(addr1.address, mintAmount))
                .to.emit(myToken, "Transfer")
                .withArgs(hre.ethers.constants.AddressZero, addr1.address, mintAmount);

            expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);
            expect(await myToken.totalSupply()).to.equal(TOTAL_SUPPLY + mintAmount);
        });

        it("should allow burning tokens", async function () {
            const burnAmount = BigInt(20000) * BigInt(10 ** DECIMALS);

            await expect(myToken.burn(burnAmount))
                .to.emit(myToken, "Transfer")
                .withArgs(owner.address, hre.ethers.constants.AddressZero, burnAmount);

            expect(await myToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - burnAmount);
            expect(await myToken.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
        });

        it("should fail burning more than balance", async function () {
            const tooMuch = TOTAL_SUPPLY + BigInt(1);

            await expect(myToken.burn(tooMuch))
                .to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Gas & Console Logging", function () {
        it("should estimate gas for transfer correctly", async function () {
            const amount = BigInt(1000) * BigInt(10 ** DECIMALS);

            const gasEstimate = await myToken.estimateGas.transfer(addr1.address, amount);
            expect(gasEstimate).to.be.gt(0);
            expect(gasEstimate).to.be.lte(80000);
        });

        it("should show state evolution with console.log (visible in test output)", async function () {
            await myToken.transfer(addr1.address, BigInt(1000) * BigInt(10 ** DECIMALS));
        });
    });
});