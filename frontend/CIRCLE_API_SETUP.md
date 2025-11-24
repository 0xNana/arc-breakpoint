# Circle API Setup Guide

## CLIENT_URL Configuration

Circle provides the CLIENT_URL in this format:
```
https://modular-sdk.circle.com/v1/rpc/w3s/buidl
```

## How It Works

1. **Passkey Transport** uses the base URL:
   - `https://modular-sdk.circle.com/v1/rpc/w3s/buidl`
   - Used for: Passkey registration/login

2. **Modular Transport** appends the chain name:
   - `https://modular-sdk.circle.com/v1/rpc/w3s/buidl/arcTestnet`
   - Used for: Blockchain operations, smart accounts, bundler

## Environment Variables

Set in your `.env` file:

```env
VITE_CLIENT_KEY=your-client-key-from-circle-console
VITE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl
```

## Important Notes

- ✅ This is Circle's API endpoint (not your server)
- ✅ The SDK automatically appends `/arcTestnet` for blockchain operations
- ✅ All API calls go directly to Circle's servers
- ✅ You don't need to run any backend server
- ❌ Do NOT use your frontend dev server URL

## Testing

Once configured correctly:
1. The SDK will call Circle's API at the CLIENT_URL
2. Passkey authentication will work
3. Smart account creation will work
4. All transactions will be gasless via Circle's paymaster

---

**The 404 error should be resolved once you set the correct CLIENT_URL!** ✅

