import TokenManager from './blockchain.js';

const CONTRACT_ADDRESS = "0xC977607a8C0E0e99C9224EA54c9E551c6B232D20"; 
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_initialSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let tokenManager;
let currentAccount;

const connectBtn = document.getElementById("connectBtn");
const balanceText = document.getElementById("balance");
const transferBtn = document.getElementById("transferBtn");
const toInput = document.getElementById("toAddress");
const amountInput = document.getElementById("amount");
const statusText = document.getElementById("status");
const gasEstimateSuccess = document.getElementById("gasSuccess");
const gasEstimateFail = document.getElementById("gasFail");

async function init() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not installed!");
    return;
  }

  connectBtn.onclick = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      currentAccount = await signer.getAddress();

      tokenManager = new TokenManager(provider, signer, CONTRACT_ADDRESS, CONTRACT_ABI);

      document.getElementById("account").innerText = `Connected: ${currentAccount}`;
      updateBalance();

      tokenManager.listenToTransfers((event) => {
        if (event.to === currentAccount || event.from === currentAccount) {
          updateBalance();
          statusText.innerText = `Transfer detected! From: ${event.from.slice(0,6)}... To: ${event.to.slice(0,6)}... Value: ${event.value} MTK`;
        }
      });

      connectBtn.disabled = true;
      connectBtn.innerText = "Connected";
    } catch (err) {
      alert("Connection failed: " + err.message);
      console.log("Connection failed: " + err.message);
    }
  };

  transferBtn.onclick = async () => {
    if (!tokenManager) return alert("Connect wallet first!");
    const to = toInput.value.trim();
    const amount = amountInput.value.trim();

    if (!ethers.utils.isAddress(to)) return alert("Invalid address!");
    if (isNaN(amount) || Number(amount) <= 0) return alert("Invalid amount!");

    statusText.innerText = "Processing transfer...";
    try {
      await tokenManager.transfer(to, amount);
      statusText.innerText = "Transfer successful!";
      updateBalance();
    } catch (err) {
      statusText.innerText = "Transfer failed: " + (err.reason || err.message);
    }
  };

  document.getElementById("estimateBtn").onclick = async () => {
    if (!tokenManager) return;
    const to = toInput.value.trim() || currentAccount;
    const amount = amountInput.value.trim() || "1";

    gasEstimateSuccess.innerText = "Success estimate: " + await tokenManager.estimateGasTransfer(to, amount, false);
    gasEstimateFail.innerText = "Fail estimate: " + await tokenManager.estimateGasTransfer(to, amount, true);
  };
}

async function updateBalance() {
  if (!tokenManager || !currentAccount) return;
  try {
    const bal = await tokenManager.getBalance(currentAccount);
    balanceText.innerText = `Your Balance: ${bal} MTK`;
  } catch (err) {
    balanceText.innerText = "Balance fetch failed";
  }
}

window.addEventListener("load", init);