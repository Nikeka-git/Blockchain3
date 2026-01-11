
class TokenManager {
  constructor(provider, signer, contractAddress, abi) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(contractAddress, abi, signer || provider);
    this.listeners = []; 
  }

  async getBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, 18);
    } catch (err) {
      console.error("Balance fetch failed:", err);
      throw err;
    }
  }

  async transfer(to, amount) {
    try {
      const tx = await this.contract.transfer(to, ethers.utils.parseUnits(amount, 18));
      await tx.wait();
      return tx;
    } catch (err) {
      console.error("Transfer failed:", err);
      throw err;
    }
  }

  async estimateGasTransfer(to, amount, shouldFail = false) {
    try {
      let txRequest;
      if (shouldFail) {
        const fakeAmount = ethers.utils.parseUnits("999999999", 18);
        txRequest = await this.contract.populateTransaction.transfer(to, fakeAmount);
      } else {
        txRequest = await this.contract.populateTransaction.transfer(to, ethers.utils.parseUnits(amount, 18));
      }

      const estimatedGas = await this.provider.estimateGas(txRequest);
      return ethers.utils.formatUnits(estimatedGas, "gwei") + " gas units";
    } catch (err) {
      return "Estimation failed (likely revert): " + (err.reason || err.message);
    }
  }

  listenToTransfers(callback) {
    const filter = this.contract.filters.Transfer(null, null);
    this.contract.on(filter, (from, to, value, event) => {
      callback({ from, to, value: ethers.utils.formatUnits(value, 18), event });
    });

    this.listeners.push(() => this.contract.removeAllListeners(filter));
  }

  cleanup() {
    this.listeners.forEach(cleanupFn => cleanupFn());
    this.listeners = [];
  }
}

export default TokenManager;