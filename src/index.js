// ─── PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE ───────────────────────────────
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// ─── PASTE YOUR ABI FROM REMIX HERE ──────────────────────────────────────────
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "_members", "type": "address[]" },
      { "internalType": "uint256", "name": "_deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "_stakeAmount", "type": "uint256" },
      { "internalType": "uint8", "name": "_mode", "type": "uint8" }
    ],
    "name": "createGroup",
    "outputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "markComplete",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "finalize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "groupId", "type": "uint256" }],
    "name": "getMembers",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "hasCompleted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "hasDeposited",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "groups",
    "outputs": [
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
      { "internalType": "uint8", "name": "mode", "type": "uint8" },
      { "internalType": "bool", "name": "finalized", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "GoalFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "member", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" }
    ],
    "name": "GroupFinalized",
    "type": "event"
  }
];
