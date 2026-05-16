# MONADDICT 🔥
> Commit or Get Rekt. Accountability on Monad.

## Setup

```bash
npm install
npm run dev
```

## After deploying contract on Remix

1. Copy your deployed contract address
2. Paste into `src/contract/index.js` → `CONTRACT_ADDRESS`
3. Copy ABI from Remix → replace `CONTRACT_ABI` in same file

## Stack
- Vite + React
- wagmi + RainbowKit
- Tailwind CSS
- Monad Testnet

## Contract Deployment
Use Remix IDE (remix.ethereum.org):
1. Paste `AccountabilityProtocol.sol`
2. Compile with 0.8.20
3. Deploy & Run → Injected Provider (MetaMask on Monad Testnet)
4. Copy address + ABI into `src/contract/index.js`
