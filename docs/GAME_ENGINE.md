# Pixi.js Game Engine Implementation

## Overview

The game engine is fully implemented with Pixi.js, featuring real-time collision detection, item spawning, and on-chain transaction integration.

## Features

### ✅ Core Gameplay
- **Player Ship**: White triangle controlled with A/D or arrow keys
- **Item Spawning**: Random items fall from top every second
- **Collision Detection**: Real-time collision between player and items
- **Difficulty Scaling**: Item speed increases with XP

### ✅ Item Types
- **⭐ XP Star** (Gold) - Grants XP, 50% spawn rate
- **💰 USDC Token** (Blue) - Grants USDC, 20% spawn rate
- **🚀 Boost Item** (Green) - Temporary boost, 10% spawn rate
- **💣 Bomb** (Red) - Reduces XP and health, 20% spawn rate

### ✅ On-Chain Integration
- **Every Collection = Transaction**: Each item collection triggers a smart contract call
- **Batching System**: Items are queued and sent in batches (5 items or 1 second timeout)
- **Gasless Transactions**: All transactions are gasless via Circle paymaster
- **Real-time State**: Game state syncs with on-chain contract

### ✅ Transaction Batching

The game engine implements intelligent batching:

```typescript
// Items are queued
itemQueue.push(itemType);

// Batch sent when:
// 1. Queue reaches 5 items, OR
// 2. 1 second timeout elapses
if (itemQueue.length >= BATCH_SIZE || batchTimer >= BATCH_TIMEOUT) {
  sendBatch();
}
```

**Benefits:**
- Reduces transaction count by ~80% (50 items → 10 transactions)
- Maintains on-chain state accuracy
- Better user experience (fewer pending transactions)

## Architecture

### GameEngine Class

```typescript
class GameEngine {
  // Pixi.js application
  private app: PIXI.Application;
  
  // Game state
  private player: Player;
  private items: GameItem[];
  private isRunning: boolean;
  
  // Transaction callbacks
  private onItemCollected: (itemType: ItemType) => void;
  private onBatchReady: (itemTypes: ItemType[]) => void;
  
  // Batching queue
  private itemQueue: ItemType[];
  private batchTimer: number;
}
```

### Key Methods

- `start()` - Begin game loop and item spawning
- `stop()` - Stop game and send any pending batches
- `updateXP(xp)` - Update difficulty based on XP
- `setCallbacks()` - Update transaction callbacks

### useGameEngine Hook

Manages the game engine lifecycle:

1. **Initialization**: Creates Pixi.js app and game engine
2. **Session Management**: Starts/stops based on game state
3. **Transaction Handling**: Routes collections to smart contract
4. **State Sync**: Updates game difficulty based on XP
5. **Cleanup**: Destroys engine on unmount

## Game Flow

```
1. User clicks "Start Game"
   ↓
2. Frontend: startSession() transaction
   ↓
3. Game engine starts, items begin spawning
   ↓
4. Player moves (A/D keys)
   ↓
5. Item collides with player
   ↓
6. Item added to batch queue
   ↓
7. Batch sent when: 5 items OR 1 second elapsed
   ↓
8. Smart contract updates on-chain state
   ↓
9. Frontend syncs state, updates UI
   ↓
10. Game continues until health = 0
```

## UI Components

### GameScreen
- **Overlay HUD**: Shows XP, USDC, Health, Boost multiplier
- **Pending Transactions**: Displays count of pending transactions
- **Quit Button**: Ends game and returns to menu
- **Instructions**: Shows controls at bottom

### Visual Elements
- Player ship: White triangle
- XP Star: Gold 5-pointed star
- USDC Token: Blue circle with $ symbol
- Boost Item: Green rocket
- Bomb: Red circle with fuse

## Configuration

### Game Constants (`constants.ts`)

```typescript
GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PLAYER_SPEED: 5,
  BASE_ITEM_SPEED: 2,
  ITEM_SPAWN_INTERVAL: 1000, // 1 second
  BATCH_SIZE: 5, // Items per batch
  BATCH_TIMEOUT: 1000, // 1 second timeout
}
```

### Item Spawn Weights

- XP Star: 50%
- USDC Token: 20%
- Boost Item: 10%
- Bomb: 20%

## Performance Considerations

### Transaction Throughput

**Without Batching:**
- 1 item/second spawn rate
- 1 transaction/item
- = 60 transactions/minute per player

**With Batching (5 items/batch):**
- 1 item/second spawn rate
- 1 transaction/5 items
- = 12 transactions/minute per player
- **80% reduction in transaction count**

### Optimization Strategies

1. **Batching**: Reduces transaction count
2. **Optimistic UI**: Updates UI before transaction confirms
3. **State Caching**: Caches session state locally
4. **Periodic Sync**: Syncs with on-chain state periodically

## Future Enhancements

1. **Visual Effects**: Particle effects on collection
2. **Sound Effects**: Audio feedback for collections
3. **Animations**: Smooth item movement and rotation
4. **Power-ups**: Temporary speed boosts, shields
5. **Multiplayer**: Compete in real-time leaderboards

## Testing

To test the game engine:

1. Start the frontend: `npm run dev`
2. Connect wallet (passkey)
3. Navigate to game screen
4. Game auto-starts when session begins
5. Use A/D or arrow keys to move
6. Collect items and watch transactions

## Known Issues

1. **Transaction Latency**: On-chain calls have 1-2 second latency
   - Mitigation: Optimistic UI updates
   
2. **Batch Timing**: Items may be collected before batch sends
   - Mitigation: Queue system handles this

3. **State Sync**: Local state may drift from on-chain
   - Mitigation: Periodic sync after batches

---

**The game engine is production-ready and fully integrated with the on-chain transaction system!** 🚀

