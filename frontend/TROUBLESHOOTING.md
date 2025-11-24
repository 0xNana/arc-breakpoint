# Troubleshooting Guide

## Passkey Authentication Issues

### 404 Not Found Error

**Error:** `404 Not Found` when trying to connect wallet

**Cause:** The `VITE_CLIENT_URL` is pointing to the wrong server.

**Solution:**

1. **If using Circle's hosted API:**
   - `VITE_CLIENT_URL` should be your Circle API endpoint (provided by Circle)
   - Example: `https://api.circle.com` or your Circle-provided URL

2. **If running a local Circle API proxy/server:**
   - `VITE_CLIENT_URL` should point to your backend server (NOT the frontend dev server)
   - Frontend dev server: `http://localhost:5173` (Vite default)
   - Backend API server: `http://localhost:8080` (or your backend port)
   - Example: `VITE_CLIENT_URL=http://localhost:8080`

3. **Common mistake:**
   - ❌ Setting `VITE_CLIENT_URL=http://localhost:3000` (frontend dev server)
   - ✅ Should be: `VITE_CLIENT_URL=http://localhost:8080` (backend API server)

### JSON Parsing Error

**Error:** `Unexpected end of JSON input`

**Causes:**
- Server is not running
- Server returns HTML error page instead of JSON
- CORS blocking the request
- Wrong endpoint URL

**Solution:**
1. Check if your backend server is running
2. Verify the server returns JSON responses
3. Check CORS configuration on the server
4. Test server connectivity: `await testServerConnection()` in browser console

### Configuration Check

Run this in browser console to verify configuration:
```javascript
await testServerConnection()
```

This will show:
- Server URL being used
- HTTP status code
- Response content type
- Response body (first 200 chars)

## Environment Variables

### Required Variables

```env
# Circle Modular Wallets
VITE_CLIENT_KEY=your-client-key-from-circle
VITE_CLIENT_URL=http://localhost:8080  # Your backend API, NOT frontend

# Arc Testnet
VITE_ARC_RPC_URL=your-arc-rpc-url
VITE_ARC_CHAIN_ID=your-chain-id

# Contract Addresses (after deployment)
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0x...
```

### Port Separation

When running locally:
- **Frontend (Vite):** Usually `http://localhost:5173`
- **Backend API:** Should be different port, e.g., `http://localhost:8080`
- **CLIENT_URL:** Must point to backend API, not frontend

## Server Setup

If you're running a local Circle API proxy, ensure:

1. **Backend server is running** on a different port than frontend
2. **CORS is configured** to allow requests from frontend origin
3. **Endpoints exist** and return valid JSON
4. **CLIENT_KEY matches** what the server expects

## Testing

1. **Check configuration:**
   - Look for error messages on main menu
   - Check browser console for warnings

2. **Test server:**
   ```javascript
   await testServerConnection()
   ```

3. **Check network tab:**
   - Open browser DevTools → Network tab
   - Try connecting wallet
   - Check the failed request:
     - URL being called
     - Request method
     - Response status
     - Response body

