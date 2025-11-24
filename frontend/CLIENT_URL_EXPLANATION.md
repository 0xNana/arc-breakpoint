# Understanding CLIENT_URL

## What is CLIENT_URL?

The `CLIENT_URL` is the **Circle API endpoint** that the Modular Wallets SDK uses to communicate with Circle's servers. It is **NOT** your frontend application URL.

## How to Get CLIENT_URL

According to Circle's documentation:

1. Visit the **Modular Wallet Console Setup page** (Circle's dashboard)
2. Create a Client Key
3. Configure the Domain Name for your Passkey
4. **Retrieve the Client URL** - This is provided by Circle

## Architecture

```
Your Frontend (localhost:3000)
    ↓
Circle SDK (@circle-fin/modular-wallets-core)
    ↓
CLIENT_URL → Circle's API Servers
    ↓
Circle handles: Passkey auth, Smart accounts, Bundler, Paymaster
```

## Important Points

1. **You don't need to run your own API server** - Circle provides the API
2. **CLIENT_URL is provided by Circle** - Not something you create
3. **CLIENT_KEY authenticates** your app with Circle's API
4. **All API calls go to Circle** - Not to your localhost

## Common Misconception

❌ **Wrong:** `CLIENT_URL=http://localhost:3000` (your frontend dev server)
✅ **Correct:** `CLIENT_URL=https://api.circle.com` (or Circle-provided URL)

## If You're Using Localhost

If Circle provides a localhost URL or you're using a local Circle API proxy:

1. **You must have a Circle API server running** on that localhost port
2. **It's NOT your frontend dev server** (Vite runs on 5173, not 3000)
3. **The server must have Circle's API endpoints** configured
4. **Check Circle's documentation** for local development setup

## Current Issue

Your request is going to `localhost:3000` (your frontend) which doesn't have Circle's API endpoints, hence the 404.

**Solution:** Set `CLIENT_URL` to Circle's actual API endpoint from their console.

