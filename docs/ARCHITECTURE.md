# Arc StarShip - On-Chain Architecture

## 🎯 Design Philosophy: Stress Testing with Every Collection On-Chain

This MVP is designed to **stress test the Arc testnet** by making every game action an on-chain transaction. With gasless passkey transactions via Circle Modular Wallets, we can generate high transaction volume while providing a seamless user experience.

## 📊 Transaction Flow

```
Player Action → Frontend → Circle Bundler → Arc Testnet → Smart Contract
     ↓              ↓            ↓              ↓              ↓
  Collect Item  Encode Call  UserOp (gasless)  TX Execution  State Update
```

### Key Design Decisions

1. **Every Collection = Transaction**
   - XP Star collected → `collectItem(ItemType.XP_STAR)`
   - USDC Token collected → `collectItem(ItemType.USDC_TOKEN)`
   - Bomb hit → `collectItem(ItemType.BOMB)`
   - Boost item → `collectItem(ItemType.BOOST_ITEM)`

2. **Batching for Optimization**
   - `batchCollectItems()` allows collecting multiple items in one transaction
   - Frontend can queue items and batch them every N items or every X seconds
   - Reduces transaction count while maintaining on-chain state

3. **Gasless via Circle Paymaster**
   - All transactions are gasless for users
   - Circle paymaster covers gas costs
   - Enables high-frequency transactions without user friction

## 🏗️ Smart Contract Architecture

### ArcStarShip.sol

**State Storage:**
```solidity
mapping(address => PlayerStats) public playerStats;
mapping(address => mapping(uint256 => GameSession)) public sessions;
mapping(address => uint256) public currentSessionId;
```

**Session Lifecycle:**
1. `startSession()` - Creates new session, emits `SessionStarted`
2. `collectItem()` - Updates session state, emits `ItemCollected` or `BombHit`
3. `batchCollectItems()` - Batch version for gas optimization
4. `endSession()` - Finalizes session, updates player stats, emits `SessionEnded`

**Optimizations:**
- Packed structs for gas efficiency
- Events for off-chain indexing
- Batch operations to reduce transaction count

### StakingContract.sol

**Tier System:**
- 25 USDC → 1.2x multiplier (12e17)
- 50 USDC → 1.5x multiplier (15e17)
- 100 USDC → 2.0x multiplier (2e18)

**Boost Duration:** 7 days

**State:**
- Tracks staked amount, multiplier, start time, duration
- `getCurrentMultiplier()` returns active multiplier or 1x default

## 🎮 Frontend Architecture

### State Management

**walletStore (Zustand):**
- Smart account, bundler client, public client
- Connection state, user address, username

**gameStore (Zustand):**
- Current session state (XP, USDC, health, etc.)
- Pending transaction counter
- Game playing state

### Transaction Handling

**useGameTransactions Hook:**
- `startSession()` - Begin new game
- `collectItem()` - Single item collection
- `batchCollectItems()` - Batch collection
- `endSession()` - End current session

**Transaction Queue Strategy (TODO):**
```typescript
// Option 1: Time-based batching
// Collect items for 1 second, then batch send

// Option 2: Count-based batching
// Collect 5 items, then batch send

// Option 3: Hybrid
// Send batch when: 5 items OR 1 second elapsed
```

### Game Engine Integration (TODO)

**Pixi.js Setup:**
1. Initialize Pixi Application
2. Create game scene with player ship
3. Spawn items (XP stars, USDC, bombs, boosts)
4. Collision detection
5. On collision → call `collectItem()` or queue for batching

**Example Flow:**
```typescript
// In Pixi.js game loop
function onItemCollision(item: Item) {
  if (batchingEnabled) {
    itemQueue.push(item.type);
    if (itemQueue.length >= BATCH_SIZE) {
      batchCollectItems(itemQueue, multiplier);
      itemQueue = [];
    }
  } else {
    collectItem(item.type, multiplier);
  }
}
```

## 🔄 Data Flow

### Starting a Game

```
User clicks "Start Game"
  ↓
Frontend: startSession()
  ↓
Circle Bundler: sendUserOperation({ calls: [startSession()] })
  ↓
Arc Testnet: Execute transaction
  ↓
Smart Contract: Create GameSession, emit SessionStarted
  ↓
Frontend: Fetch session state, update gameStore
  ↓
Game begins, items start falling
```

### Collecting Items

```
Item collides with player
  ↓
Frontend: collectItem(itemType, multiplier)
  ↓
Circle Bundler: sendUserOperation({ calls: [collectItem()] })
  ↓
Arc Testnet: Execute transaction
  ↓
Smart Contract: Update session state, emit ItemCollected
  ↓
Frontend: Optimistic UI update OR fetch updated state
```

### Batching Strategy

```
Item 1 collected → Queue
Item 2 collected → Queue
Item 3 collected → Queue
Item 4 collected → Queue
Item 5 collected → Queue
  ↓
Trigger: 5 items OR 1 second elapsed
  ↓
Frontend: batchCollectItems([item1, item2, item3, item4, item5], multiplier)
  ↓
Circle Bundler: sendUserOperation({ calls: [batchCollectItems()] })
  ↓
Arc Testnet: Execute single transaction
  ↓
Smart Contract: Process all items, emit events
  ↓
Frontend: Sync state
```

## 📈 Stress Testing Considerations

### Transaction Volume

**Expected per game session:**
- Start: 1 transaction
- Collections: 50-200+ transactions (depending on batching)
- End: 1 transaction
- **Total: 52-202+ transactions per session**

**With 10 concurrent players:**
- 520-2,020+ transactions per session
- Multiple sessions = exponential growth

### Optimization Strategies

1. **Batching**
   - Reduce 50 individual calls → 10 batched calls
   - 80% reduction in transaction count
   - Still maintains on-chain state

2. **Event Indexing**
   - Use events for off-chain leaderboards
   - Reduce read calls to contract

3. **Caching**
   - Cache session state locally
   - Only sync on critical events (bomb hit, session end)

## 🚀 Next Implementation Steps

### Priority 1: Core Gameplay
1. Implement Pixi.js game engine
2. Item spawning system
3. Collision detection
4. Real-time transaction calls

### Priority 2: Transaction Optimization
1. Implement batching queue
2. Configurable batching strategy (time/count)
3. Transaction retry logic
4. Pending transaction UI

### Priority 3: Staking Integration
1. Staking UI
2. Multiplier display in game
3. Boost expiration handling

### Priority 4: Additional Features
1. Leaderboard (on-chain or indexed)
2. Quest system
3. Referral tracking
4. Shareable score cards

## 🔍 Monitoring & Analytics

### Key Metrics to Track

1. **Transaction Metrics:**
   - Transactions per second
   - Average transaction latency
   - Failed transaction rate
   - Gas costs (even if gasless for users)

2. **Game Metrics:**
   - Active sessions
   - Average session duration
   - Items collected per session
   - XP/USDC earned per session

3. **Chain Metrics:**
   - Block time
   - Transaction throughput
   - Pending transaction queue depth

## ⚠️ Known Considerations

1. **Transaction Latency**
   - On-chain calls have latency (1-2 seconds typically)
   - May need optimistic UI updates
   - Consider batching to reduce perceived latency

2. **Rate Limiting**
   - Circle bundler may have rate limits
   - Arc testnet may have throughput limits
   - Monitor and adjust batching strategy

3. **Cost Management**
   - Circle paymaster covers gas, but has limits
   - Monitor paymaster usage
   - Consider fallback strategies

4. **State Synchronization**
   - Local state vs on-chain state
   - Handle transaction failures gracefully
   - Sync state periodically

---

**This architecture is designed for stress testing. Monitor chain performance and adjust batching strategies as needed.**

