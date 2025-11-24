import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ArcStarShipModule = buildModule("ArcStarShipModule", (m) => {
  // USDC token address on Arc Testnet (to be set via env or parameter)
  const usdcToken = m.getParameter(
    "usdcToken",
    "0x0000000000000000000000000000000000000000"
  );

  // Deploy StakingContract first (ArcStarShip references it for multipliers)
  const stakingContract = m.contract("StakingContract", [usdcToken]);

  // Deploy ArcStarShip TX clicker router with staking dependency
  const arcStarShip = m.contract("ArcStarShip", [stakingContract]);

  return { arcStarShip, stakingContract };
});

export default ArcStarShipModule;

