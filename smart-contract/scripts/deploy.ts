import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { viem } = await network.connect({
    network: "arcTestnet",
    chainType: "op",
  });

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying to Arc Testnet...");
  console.log("Deployer address:", deployer.account.address);

  // Get USDC address from env
  const usdcToken = process.env.USDC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  if (usdcToken === "0x0000000000000000000000000000000000000000") {
    console.warn("⚠️  USDC_TOKEN_ADDRESS not set, using zero address");
  }

  // Load compiled contract artifacts
  const stakingArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/StakingContract.sol/StakingContract.json"),
      "utf8"
    )
  );
  const arcStarShipArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/ArcStarShip.sol/ArcStarShip.json"),
      "utf8"
    )
  );

  // Deploy StakingContract first so we can pass address into ArcStarShip
  console.log("Deploying StakingContract...");
  const stakingHash = await deployer.deployContract({
    abi: stakingArtifact.abi,
    bytecode: stakingArtifact.bytecode as `0x${string}`,
    account: deployer.account,
    args: [usdcToken as `0x${string}`],
  });

  const stakingReceipt = await publicClient.waitForTransactionReceipt({
    hash: stakingHash,
  });
  const stakingAddress = stakingReceipt.contractAddress;
  if (!stakingAddress) {
    throw new Error("Failed to obtain StakingContract address from receipt");
  }

  // Deploy ArcStarShip router with staking dependency
  console.log("Deploying ArcStarShip...");
  const arcStarShipHash = await deployer.deployContract({
    abi: arcStarShipArtifact.abi,
    bytecode: arcStarShipArtifact.bytecode as `0x${string}`,
    account: deployer.account,
    args: [stakingAddress],
  });

  const arcStarShipReceipt = await publicClient.waitForTransactionReceipt({
    hash: arcStarShipHash,
  });

  console.log("✅ Deployment complete!");
  console.log("ArcStarShip:", arcStarShipReceipt.contractAddress);
  console.log("StakingContract:", stakingReceipt.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

