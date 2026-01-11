
const CONTRACT_ADDRESS = "0x2Ccf7CBcB43d54b872E0Ad145F774Cd80ed2321c";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider;
let signer;
let contract;

const connectBtn = document.getElementById("connectBtn");
const readBtn = document.getElementById("readBtn");
const accountText = document.getElementById("account");
const valueText = document.getElementById("value");

connectBtn.onclick = async () => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);  // Запрос подключения
    signer = provider.getSigner();
    const address = await signer.getAddress();
    accountText.innerText = "Account: " + address;

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log("Connected!");
  } catch (err) {
    console.error(err);
    alert("Connection failed: " + (err.message || "Unknown"));
  }
};

readBtn.onclick = async () => {
  if (!contract) {
    alert("Connect first!");
    return;
  }
  try {
    const value = await contract.getValue();
    valueText.innerText = "Contract value: " + value.toString();
  } catch (err) {
    console.error(err);
    valueText.innerText = "Error: " + (err.message || "Unknown");
    alert("Read failed: " + (err.message || "Unknown"));
  }
};