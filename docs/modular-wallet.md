Modular Wallets Quickstart
This Quickstart guides you through creating your first modular wallet smart account and sending a gasless transaction using the modular wallets SDKs for Web, iOS, or Android. For a complete web app implementation, refer to the Circle Smart Account example in the modular wallets web SDK.


Prerequisites
Before you begin, ensure you have completed the following steps:

Familiarize yourself with API Keys and Client Keys authentication.
Visit the Modular Wallet Console Setup page to:
Create a Client Key for the modular wallets SDK
Configure the Domain Name for your Passkey.
Retrieve the Client URL for authentication.
Note:

Circle provides a robust built-in indexing service optimized for subscribed transactions per wallet. You can set up webhook subscriptions on the Circle Console to receive notifications for transfer activities or user operations. To retrieve data from our Indexing Service through your backend, use an API Key to authenticate RESTful API requests.


Installation and Setup
Follow the applicable setup steps for the SDK you are installing:


Run the following command in your shell, depending on your package manager:

npm install @circle-fin/modular-wallets-core


Create an .env file in your local directory and add the Client Key and Client URL obtained from the Modular Wallet Console Setup page:
Text
VITE_CLIENT_KEY=YOUR-CLIENT-KEY
VITE_CLIENT_URL=YOUR-CLIENT-URL


Follow the React development workflow to build your sample web app using the provided sample code.

The root dependencies should already be installed from the installation step above.
Install additional web app dependencies from the provided package.json file below.
package.json
JSON
{
  "name": "quickstart-circle-smart-account",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "viem": "^2.21.27",
    "@circle-fin/modular-wallets-core": "^1.x.x"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.0.3",
    "vite": "^5.4.14"
  }
}


Implement the quickstart steps below within a blank index.tsx file.
After completing all quickstart steps, you can test your app by launching a local web server.
For more details, see the Circle Smart Account Example.


Quickstart Steps
You can get started with the sample code below which showcases basic Modular Wallets capabilities, including Circle Smart Account, passkey, paymaster, and bundler services to send a gasless transaction with passkey signing.


1. Create or Use an Existing Passkey
Create a new Passkey or use an existing one from your client key, passkey domain, and client URL values.

WebSDK
import {
    toPasskeyTransport,
    toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core'

// 0. retrieve client key and client url from environment vars
const clientKey = import.meta.env.VITE_CLIENT_KEY as string
const clientUrl = import.meta.env.VITE_CLIENT_URL as string

// 1. register or login with a passkey and
//    Create a Passkey Transport from client key
const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register, //or WebAuthnMode.Login if login
    username: 'your-username'  //replace with actual username
})



2. Create and Set Up a Client
Create a client to access the desired blockchain network. The sample below demonstrates using the polygonAmoy chain.

WebSDK
import { toModularTransport } from "@circle-fin/modular-wallets-core";
import { createPublicClient } from "viem";
import { polygonAmoy } from "viem/chains";

// 2. Create modular transport for given chain from client url and client key
const modularTransport = toModularTransport(
  clientUrl + "/polygonAmoy",
  clientKey,
);

// 3. Create client to connect to specified blockchain
const client = createPublicClient({
  chain: polygonAmoy,
  transport: modularTransport,
});


Note:

When invoking toModularTransport(), you must specify the blockchain network. Supported networks include:

arbitrum
arbitrumSepolia
arcTestnet
avalanche
avalancheFuji
base
baseSepolia
optimism
optimismSepolia
polygon
polygonAmoy
unichain
unichainSepolia

3. Create a Circle Smart Account with Passkey
Create a Circle Smart Account using the transport client and the owner’s credentials. Then, create a bundler client to send user operations for the specified blockchain. The example below uses the polygonAmoy chain.

Web SDK
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";
import {
  createBundlerClient,
  toWebAuthnAccount,
} from "viem/account-abstraction";

// 4. create a circle smart account
const smartAccount = await toCircleSmartAccount({
  client,
  owner: toWebAuthnAccount({
    credential,
  }),
});

// 5. create a bundler client
const bundlerClient = createBundlerClient({
  smartAccount,
  chain: polygonAmoy,
  transport: modularTransport,
});



4. Send a Gasless Transaction
Encapsulate the transaction within a user operation (userOp) and send it to the bundler. The bundler then initiates the transaction on behalf of the sender and forwards the transaction receipt back upon request.

Note:

On mobile platforms, iOS and Android offer at least a second option to send a transaction using the encodeTransfer() method. In the code below, ensure you select either Option 1 or Option 2 based on your requirements.

Web SDK
import { encodeTransfer } from "@circle-fin/modular-wallets-core";

// 6. Send a user operation to the bundler.
//    Here we send 1 USDC to a random address
const USDC_CONTRACT_ADDRESS = "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582"; //Polygon Amoy testnet
const USDC_DECIMALS = 6;
const userOpHash = await bundlerClient.sendUserOperation({
  calls: [encodeTransfer(to, USDC_CONTRACT_ADDRESS, 100000n)],
  paymaster: true,
});

// 7. wait for transaction receipt
const { receipt } = await bundlerClient.waitForUserOperationReceipt({
  hash: userOpHash,
});


Summary
In this Quickstart, you were able to:

Set up the Modular Wallet SDK.
Create a Circle Smart Account with Passkey.
Send a gasless transaction using the bundler.
You can use these foundational steps to integrate modular wallets into your application and explore its full suite of capabilities.