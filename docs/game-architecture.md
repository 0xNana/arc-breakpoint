# **Arc StarShip — System Architecture Diagram**

```
                                      ┌────────────────────────┐
                                      │        Frontend        │
                                      │  (React / Pixi.js)     │
                                      └────────────┬───────────┘
                                                   │
                                                   │ Player actions
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           GAME CLIENT LAYER                             │
│                                                                         │
│   ┌────────────────────────────┐     ┌──────────────────────────────┐   │
│   │  Game Engine               │     │  UI Layer (Menus, Screens)   │   │
│   │  - Physics (drops)         │     │  - Loading screen            │   │
│   │  - Collision detection     │     │  - Staking screen            │   │
│   │  - XP & difficulty scaling │     │  - Leaderboard UI            │   │
│   │  - Randomized item spawns  │     │  - Quest board               │   │
│   └──────────────┬─────────────┘     └──────────────┬──────────────┘   │
│                  │                                   │                  │
│                  │ Game events                       │ UI events        │
│                  ▼                                   ▼                  │
│   ┌───────────────────────────────┐   ┌─────────────────────────────┐   │
│   │  Session Manager              │   │  Wallet Connector            │   │
│   │  - Start / end run            │   │  - Arc Passkey login         │   │
│   │  - Track XP, health, drops    │   │  - USDC staking TXs          │   │
│   │  - Local scoring logic        │   │  - Claim interactions        │   │
│   └──────────────┬────────────────┘   └──────────────┬──────────────┘   │
│                  │ Game stats                        │ On-chain actions │
└──────────────────┼────────────────────────────────────┼──────────────────┘
                   │                                    │
                   ▼                                    ▼
         ┌────────────────────────┐           ┌───────────────────────────┐
         │  Backend API (Node)    │           │  Arc Blockchain (Testnet) │
         └────────────────┬────────┘           └───────────────┬──────────┘
                          │ API calls                          │ TX / Reads
                          │                                      │
                          ▼                                      ▼
         ┌─────────────────────────────────────────────────────────────────┐
         │                         SERVER LAYER                            │
         │                                                                 │
         │  ┌──────────────────────────────┐   ┌────────────────────────┐ │
         │  │ Leaderboard Service          │   │ Quest & Referral Logic │ │
         │  │ - Score submission           │   │ - Quest progression     │ │
         │  │ - Anti-cheat checks          │   │ - Referral tracking     │ │
         │  └──────────────┬───────────────┘   └──────────────┬────────┘ │
         │                  │                                     │        │
         │                  ▼                                     ▼        │
         │    ┌─────────────────────────┐        ┌───────────────────────┐ │
         │    │ Database (Postgres)     │        │ Event Processor        │ │
         │    │ - Users                 │        │ - Webhooks from chain  │ │
         │    │ - Scores                │        │ - Update quests        │ │
         │    │ - Referrals             │        │ - Update boosts        │ │
         │    └─────────────────────────┘        └───────────────────────┘ │
         └─────────────────────────────────────────────────────────────────┘
                   ▲                                      ▲
                   │                                      │
                   │ Stats sync                            │ Stake/Claim
                   │                                      │
                   ▼                                      ▼
      ┌──────────────────────────────┐       ┌────────────────────────────────┐
      │  Smart Contract Suite        │       │ USDC Token Contract (existing) │
      └──────────────────────────────┘       └────────────────────────────────┘

```

---

# **Component Breakdown**

### **1. Frontend Layer**

* React + Pixi.js or Phaser for rendering
* Handles movement, collision, animations
* Connects to wallet via Arc Passkeys
* Calls backend for leaderboard + quests
* Sends signed TXs for staking / claiming rewards

---

### **2. Gameplay Engine**

* Pure client-side logic to keep it cheap
* Deterministic XP, spawns, bomb patterns
* Difficulty scaling → faster drops as XP increases

---

### **3. Backend (Node / Typescript)**

* Leaderboard submission
* Anti-cheat heuristics
* XP thresholds & reward validation
* Quest progression
* Referral tracking
* Caching user profiles

*No critical gameplay trust here.*
On-chain pieces handle the money.

---

### **4. Smart Contracts (Arc Testnet)**

**a) Staking Contract**

* Stake USDC
* Track multiplier (1.2x, 1.5x, 2x)
* Track boost duration

**b) Reward Bank**

* Holds USDC used for drops
* Payouts triggered by backend after validation

**c) Points / XP Minting (Optional ERC20)**

* Allow users to mint XP token for off-chain events
* Optional to track achievements

---

### **5. Database**

* Player profiles
* Session logs
* On-chain staking state cache
* Leaderboard
* Quest & referral tables

---

# **6. Data Flow Summary**

### **Start Game → Play**

* Purely client-side
* Smooth 60fps no latency
* XP calculated locally

### **End Game → Submit**

* Client sends:

  * XP
  * USDC collected
  * Session signature
* Backend:

  * Anti-cheat
  * Insert leaderboard entry

### **Staking**

* Goes on-chain
* Backend listens to events
* Updates user's boost state

---


