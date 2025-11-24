
# **Arc StarShip — MVP Developer Document**

### **First GameFi Experience on Arc | USDC-Powered | Viral Testnet Mini-Game**

Arc StarShip is a lightweight, addictive GameFi loop built around **collecting** ⭐, 💰 and 🚀 items while **dodging bombs**, accumulating **XP**, and optionally **staking USDC** for boosts.
The game provides **ecosystem diversity**, **USDC utility**, and **high-retention gameplay** that’s perfect for Arc's testnet growth.

---

# **1. LOADING / SPLASH SCREEN**

```
┌───────────────────────────────────────────┐
│             ARC STARSHIP ⚡                │
│        Explore • Collect • Survive        │
│                                           │
│              [   Loading...   ]           │
└───────────────────────────────────────────┘
```

---

# **2. MAIN MENU**

```
┌───────────────────────────────────────────┐
│               ARC STARSHIP                │
│        The First GameFi on ARC            │
│                                           │
│    1) Start Game                          │
│    2) Stake USDC for Boosts ⛽            │
│    3) Leaderboard                         │
│    4) Quest Board                         │
│    5) Invite a Friend                     │
└───────────────────────────────────────────┘
```

---

# **3. STAKING / BOOST SCREEN**

```
┌───────────────────────────────────────────┐
│            USDC STAKING BOOSTS            │
│                                           │
│  Stake USDC to increase:                  │
│   • Drop Frequency  ↑                     │
│   • Rare Items Chance ↑                   │
│   • XP Multiplier 1.2x – 2.0x             │
│                                           │
│   Amount: [    25 USDC    ]               │
│                                           │
│               [   STAKE   ]               │
└───────────────────────────────────────────┘
```

---

# **4. GAMEPLAY SCREEN**

```
┌───────────────────────────────────────────┐
│ XP: 120        Boost: 1.5x       Life: ❤❤ │
│                                           │
│         .       ✦      $                  │
│      ✦        💣         ✦                │
│                 🚀                         │
│                                           │
│                  ^                         │
│                 / \   ← Player Ship        │
│                /___\                       │
│                                           │
│  Collect: ✦ = XP   $ = USDC   🚀 = Boost   │
│  Avoid:   💣 = Bomb (Lose XP/Life)         │
└───────────────────────────────────────────┘
```

---

# **5. GAME OVER SCREEN**

```
┌───────────────────────────────────────────┐
│                 GAME OVER                 │
│                                           │
│            Final XP:     1,420            │
│            USDC Found:   7.8              │
│                                           │
│   [ Retry ]     [ Leaderboard ]           │
└───────────────────────────────────────────┘
```

---

# **6. LEADERBOARD SCREEN**

```
┌───────────────────────────────────────────┐
│               LEADERBOARD 🏆              │
│                                           │
│   #   Player         XP        USDC       │
│  ---------------------------------------   │
│  1   0xKofi        14,200     22.4        │
│  2   0xAmina       13,880     19.1        │
│  3   0xMensah      12,770     14.8        │
│                                           │
│        [  Back  ]                          │
└───────────────────────────────────────────┘
```

---

# **7. QUEST BOARD / REFERRALS**

```
┌───────────────────────────────────────────┐
│               QUEST BOARD 📜              │
│                                           │
│  Daily Quests:                            │
│   • Collect 50 XP          +10 pts        │
│   • Dodge 10 Bombs         +15 pts        │
│   • Stake any USDC         +20 pts        │
│                                           │
│  Social / Growth Quests:                  │
│   • Invite a Friend        +30 pts        │
│   • Play 3 Games Today     +10 pts        │
│                                           │
│   Referral Link: arc.gg/ship/0xNana       │
└───────────────────────────────────────────┘
```

---

# **GAME MECHANICS SUMMARY (FOR DEV TEAM)**

### **Core Loop**

1. Player launches ship → random items fall from top.
2. Player moves left/right to:

   * Collect **XP stars**, **USDC tokens**, **boost items**
   * Avoid **bombs**
3. XP increases difficulty → more/faster drops.
4. Bombs reduce XP / health.
5. Session ends when health = 0.

---

### **Economy**

* **Stake USDC** for boosts:

  * XP multiplier
  * Rarer drop rate
  * Higher USDC discovery chance
* **USDC drops** are small testnet amounts (or points representing USDC).

---

### **Growth Hooks**

* Leaderboard
* Invitation / referral link
* Quest board (daily + growth quests)
* Shareable score card (future)

---


