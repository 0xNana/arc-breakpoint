# Arc BreakPoint

**Passkey Authentication & Chain TPS Testing | USDC-Powered | Stress Testing with OnChain Transactions**

Arc BreakPoint is an experimental platform where **every click is an on-chain transaction**, designed to stress test the Arc testnet with gasless passkey-based transactions and measure chain throughput.

## 🎯 Purpose

Arc BreakPoint serves as a research platform for:
- **Passkey Authentication**: Testing WebAuthn-based wallet authentication via Circle Modular Wallets
- **Chain TPS Testing**: Measuring Arc Testnet throughput by generating high-frequency on-chain transactions
- **Gasless UX**: Demonstrating USDC-powered paymaster transactions

## 🏗️ Architecture Overview

### On-Chain First Approach
- **Every click = Transaction**: Each user action triggers a smart contract call
- **Gasless Transactions**: Using Circle Modular Wallets with passkey authentication
- **Stress Testing**: Designed to generate high transaction volume on Arc testnet
- **Progressive Art Unlocks**: 10 levels from 10K to 1M transactions

### Tech Stack

**Smart Contracts:**
- Solidity 0.8.28
- Hardhat + Viem
- Arc Testnet (OP Stack)

**Frontend:**
- React 18 + TypeScript
- Vite
- Circle Modular Wallets SDK
- Zustand (state management)

**Key Features:**
- Passkey-based wallet (no seed phrases)
- Gasless transactions via Circle paymaster
- Session-based batching (reduce passkey prompts)
- Real-time on-chain transaction tracking
- Progressive art reveal system

## 📁 Project Structure

```
arc-starship/
├── smart-contract/
│   ├── contracts/
│   │   ├── ArcStarShip.sol      # Main contract (tracks totalActions)
│   │   └── StakingContract.sol   # USDC staking (optional)
│   ├── scripts/
│   │   └── deploy.ts             # Deployment script
│   └── ignition/
│       └── modules/
│           └── ArcStarShip.ts    # Ignition deployment module
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArtGallery.tsx    # Progressive art reveal
│   │   │   └── ErrorBoundary.tsx
│   │   ├── config/               # Chain & contract config
│   │   ├── lib/                  # Wallet & contract utilities
│   │   │   ├── wallet.ts         # Circle wallet integration
│   │   │   ├── passkey-manager.ts
│   │   │   ├── game-contract.ts  # Contract ABI & functions
│   │   │   ├── art-levels.ts     # Art unlock thresholds
│   │   │   └── session-keys.ts   # Session batching logic
│   │   ├── store/                # Zustand state stores
│   │   ├── hooks/                # React hooks
│   │   │   ├── useGameTransactions.ts
│   │   │   └── useSessionKey.ts
│   │   └── pages/                # React pages
│   │       ├── MainMenu.tsx      # Landing page
│   │       └── ClickerScreen.tsx # Main clicker interface
│   └── public/
│       └── art/                  # Art assets (a.webp - j.webp)
│
└── docs/
    └── USER_FLOW.md              # User flow documentation
```

## 🚀 Getting Started

### Prerequisites

1. **Circle Modular Wallets Setup:**
   - Client Key from Circle Console
   - Domain configured (e.g., `arc.0xelegant.dev`)
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

# Create .env file
# VITE_CLIENT_KEY=your-client-key
# VITE_CLIENT_URL=https://arc.0xelegant.dev
# VITE_ARC_RPC_URL=your-arc-rpc-url
# VITE_ARC_CHAIN_ID=your-chain-id
# VITE_GAME_CONTRACT_ADDRESS=deployed-game-address
# VITE_STAKING_CONTRACT_ADDRESS=deployed-staking-address (optional)
# VITE_USDC_CONTRACT_ADDRESS=usdc-address

# Start dev server
npm run dev
```

## 🎮 How It Works

### User Flow

1. **Connect**: User authenticates with passkey (WebAuthn)
2. **Click**: User clicks "⚡ CLICK TO TX" button
3. **Transaction**: Each click triggers `performAction()` on-chain
4. **Progress**: `totalActions` increments, art unlocks progressively
5. **Batching**: Optional session mode batches clicks to reduce passkey prompts

### Transaction Modes

**Default Mode (Session Disabled):**
- Each click = One passkey prompt = One transaction
- Immediate on-chain execution

**Session Mode (Batching):**
- One passkey prompt to start session
- Clicks are queued locally
- Batched every 3 seconds OR after 5 clicks
- Single transaction with multiple calls

### Art Unlock Levels

- **Level 1**: 10,000 TXs — "Initiate"
- **Level 2**: 25,000 TXs — "Cadre"
- **Level 3**: 50,000 TXs — "Voyager"
- **Level 4**: 80,000 TXs — "Navigator"
- **Level 5**: 120,000 TXs — "Stellar Pilot"
- **Level 6**: 180,000 TXs — "Sector Commander"
- **Level 7**: 260,000 TXs — "Cosmic Sentinel"
- **Level 8**: 360,000 TXs — "Nebula Warden"
- **Level 9**: 520,000 TXs — "Arc Vanguard"
- **Level 10**: 1,000,000 TXs — "Chainbreaker Prime"

## 📜 Smart Contracts

### ArcStarShip.sol
Main contract tracking transaction counts and player stats.

**Key Functions:**
- `performAction(action, metadata, referrer)` - Execute action (increments totalActions)
- `getPlayerStats(player)` - View player statistics

**On-Chain State:**
- `totalActions` - Total transaction count (used for level calculation)
- `xp`, `dodges`, `scans`, `boosts`, `claims` - Action counters
- `referralXp` - Referral bonuses

### StakingContract.sol (Optional)
USDC staking for game boosts (currently not used in simplified version).

## 🔄 Transaction Flow

1. **User connects** → Passkey authentication via Circle SDK
2. **User clicks** → `performAction(COLLECT)` userOp (gasless)
3. **On-chain** → `totalActions++`, event emitted
4. **Frontend** → Stats refresh, art reveal updates

All transactions are **gasless** via Circle paymaster (USDC).

## 🎨 Frontend Architecture

### State Management
- `walletStore` - Wallet connection, session keys, preferences
- `gameStore` - Player profile, pending transactions

### Key Hooks
- `useGameTransactions` - Handles transaction sending and batching
- `useSessionKey` - Manages session lifecycle and preferences

### Components
- `MainMenu` - Landing page with passkey authentication
- `ClickerScreen` - Main interface with stats, click button, art gallery
- `ArtGallery` - Progressive art reveal based on transaction count
- `ErrorBoundary` - Error handling

## ⚙️ Environment Variables

### Frontend (.env)
```env
VITE_CLIENT_KEY=your-circle-client-key
VITE_CLIENT_URL=https://arc.0xelegant.dev
VITE_ARC_RPC_URL=your-arc-rpc-url
VITE_ARC_CHAIN_ID=your-chain-id
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x... (optional)
VITE_USDC_CONTRACT_ADDRESS=0x...
```

### Smart Contract (.env)
```env
ARC_TESTNET_RPC_URL=your-rpc-url
ARC_TESTNET_PRIVATE_KEY=your-deployer-key
USDC_TOKEN_ADDRESS=0x...
```

## 📊 Testing & Metrics

Arc BreakPoint is designed to:
- Generate high-frequency on-chain transactions
- Measure Arc Testnet throughput (TPS)
- Test passkey authentication at scale
- Validate gasless transaction UX

Monitor:
- Transaction success rate
- Average confirmation time
- Passkey prompt frequency
- Chain throughput under load

## ⚠️ Important Notes

- **Stress Testing**: Designed to generate high transaction volume
- **Gasless**: All user transactions are gasless via Circle paymaster
- **On-Chain State**: Every action is recorded on-chain
- **Testnet Only**: Currently configured for Arc Testnet
- **Experimental**: This is a research platform, not production-ready

## 🤝 Contributing

This is an experimental platform for stress testing Arc testnet. Focus areas:
1. Reliable transaction execution
2. Efficient batching strategies
3. Chain performance monitoring
4. Passkey UX optimization

---

**Built for Arc Testnet | Powered by Circle Modular Wallets | Every Click is On-Chain**
