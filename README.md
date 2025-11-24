# Arc StarShip ⚡

**The First GameFi on ARC | USDC-Powered | Stress Testing with On-Chain Transactions**

Arc StarShip is a GameFi space shooter where **every item collection is an on-chain transaction**, designed to stress test the Arc testnet with gasless passkey-based transactions.

## 🎮 Architecture Overview

### On-Chain First Approach
- **Every collection = Transaction**: XP stars, USDC tokens, boost items, and bombs all trigger smart contract calls
- **Gasless Transactions**: Using Circle Modular Wallets with passkey authentication
- **Stress Testing**: Designed to generate high transaction volume on Arc testnet

### Tech Stack

**Smart Contracts:**
- Solidity 0.8.28
- Hardhat + Viem
- OpenZeppelin Contracts
- Arc Testnet (OP Stack)

**Frontend:**
- React 18 + TypeScript
- Vite
- Pixi.js (for game rendering)
- Circle Modular Wallets SDK
- Zustand (state management)

**Key Features:**
- Passkey-based wallet (no seed phrases)
- Gasless transactions via Circle paymaster
- Real-time on-chain game state
- USDC staking for XP multipliers
- Leaderboards and quests (future)

## 📁 Project Structure

```
arc-starship/
├── smart-contract/
│   ├── contracts/
│   │   ├── ArcStarShip.sol      # Main game contract (on-chain state)
│   │   └── StakingContract.sol   # USDC staking for boosts
│   ├── scripts/
│   │   └── deploy.ts             # Deployment script
│   └── ignition/
│       └── modules/
│           └── ArcStarShip.ts    # Ignition deployment module
│
├── frontend/
│   ├── src/
│   │   ├── config/               # Chain & contract config
│   │   ├── lib/                  # Wallet & contract utilities
│   │   ├── store/                # Zustand state stores
│   │   ├── hooks/                # React hooks
│   │   └── pages/                # React pages
│   └── package.json
│
└── docs/
    ├── game-architecture.md
    ├── modular-wallet.md
    └── mvp-developer-guide.md
```

## 🚀 Getting Started

### Prerequisites

1. **Circle Modular Wallets Setup:**
   - Client Key from Circle Console
   - Domain configured: `arc.0xelegant.dev`
   - API Key for backend (optional)

2. **Arc Testnet Access:**
   - RPC URL for Arc Testnet
   - Chain ID
   - USDC contract address on Arc Testnet

### Smart Contract Setup

```bash
cd smart-contract
npm install

# Set environment variables
# Create .env file with:
# ARC_TESTNET_RPC_URL=your-rpc-url
# ARC_TESTNET_PRIVATE_KEY=your-deployer-key (optional)
# USDC_TOKEN_ADDRESS=usdc-contract-address

# Deploy contracts
npx hardhat ignition deploy ignition/modules/ArcStarShip.ts --network arcTestnet
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (copy from .env.example)
# VITE_CLIENT_KEY=your-client-key
# VITE_CLIENT_URL=https://arc.0xelegant.dev
# VITE_ARC_RPC_URL=your-arc-rpc-url
# VITE_ARC_CHAIN_ID=your-chain-id
# VITE_GAME_CONTRACT_ADDRESS=deployed-game-address
# VITE_STAKING_CONTRACT_ADDRESS=deployed-staking-address
# VITE_USDC_CONTRACT_ADDRESS=usdc-address

# Start dev server
npm run dev
```

## 🎯 Game Mechanics

### Core Loop
1. Player starts session → `startSession()` transaction
2. Items fall from top (XP stars ⭐, USDC 💰, boosts 🚀, bombs 💣)
3. **Every collection** → `collectItem()` or `batchCollectItems()` transaction
4. Game ends when health = 0 → `endSession()` transaction

### On-Chain State
- XP accumulated
- USDC collected
- Items collected count
- Bombs hit
- Health remaining
- Session active status

### Staking Boosts
- **25 USDC** → 1.2x XP multiplier (7 days)
- **50 USDC** → 1.5x XP multiplier (7 days)
- **100 USDC** → 2.0x XP multiplier (7 days)

## 🔧 Smart Contracts

### ArcStarShip.sol
Main game contract tracking all session state on-chain.

**Key Functions:**
- `startSession()` - Begin new game session
- `collectItem(sessionId, itemType, multiplier)` - Collect single item
- `batchCollectItems(sessionId, itemTypes[], multiplier)` - Batch collect (gas optimization)
- `endSession(sessionId)` - End current session
- `getCurrentSession(player)` - View current session state

### StakingContract.sol
USDC staking for game boosts.

**Key Functions:**
- `stake(amount)` - Stake USDC (25, 50, or 100 USDC)
- `unstake()` - Unstake after boost expires
- `getCurrentMultiplier(user)` - Get active multiplier
- `hasActiveBoost(user)` - Check if boost is active

## 📝 Transaction Flow

1. **User connects** → Passkey authentication via Circle SDK
2. **Start game** → `startSession()` userOp (gasless)
3. **During gameplay** → Each collection triggers:
   - `collectItem()` for single items, OR
   - `batchCollectItems()` for multiple items (batched)
4. **Game ends** → `endSession()` userOp

All transactions are **gasless** via Circle paymaster.

## 🎨 Frontend Architecture

### State Management
- `walletStore` - Wallet connection state
- `gameStore` - Current game session state

### Transaction Handling
- `useGameTransactions` hook manages all on-chain calls
- Supports batching for gas optimization
- Pending transaction tracking

### Game Engine (TODO)
- Pixi.js for rendering
- Collision detection
- Item spawning logic
- Real-time transaction calls on collection

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_CLIENT_KEY=your-circle-client-key
VITE_CLIENT_URL=https://arc.0xelegant.dev
VITE_ARC_RPC_URL=your-arc-rpc-url
VITE_ARC_CHAIN_ID=your-chain-id
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0x...
```

### Smart Contract (.env)
```env
ARC_TESTNET_RPC_URL=your-rpc-url
ARC_TESTNET_PRIVATE_KEY=your-deployer-key
USDC_TOKEN_ADDRESS=0x...
```

## 🚧 Next Steps

1. **Game Engine Implementation**
   - Pixi.js integration
   - Collision detection
   - Item spawning system
   - Real-time transaction calls

2. **Transaction Optimization**
   - Implement batching queue
   - Batch multiple collections into single tx
   - Optimize for high-frequency calls

3. **Backend (Optional)**
   - Leaderboard API
   - Quest tracking
   - Referral system
   - Anti-cheat validation

4. **UI/UX**
   - Game screen with Pixi.js
   - Staking interface
   - Leaderboard display
   - Quest board

## 📚 Documentation

- [Game Architecture](./docs/game-architecture.md)
- [Modular Wallet Setup](./docs/modular-wallet.md)
- [MVP Developer Guide](./docs/mvp-developer-guide.md)

## ⚠️ Important Notes

- **Stress Testing**: This is designed to generate high transaction volume
- **Gasless**: All user transactions are gasless via Circle paymaster
- **On-Chain State**: Every game action is recorded on-chain
- **Testnet Only**: Currently configured for Arc Testnet

## 🤝 Contributing

This is an MVP for stress testing Arc testnet. Focus on:
1. Reliable transaction execution
2. Smooth gameplay experience
3. Efficient batching strategies
4. Chain performance monitoring

---

**Built for Arc Testnet | Powered by Circle Modular Wallets | Every Collection is On-Chain** ⚡

