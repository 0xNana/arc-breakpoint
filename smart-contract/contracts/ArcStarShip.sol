// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStakingContract {
    function getCurrentMultiplier(address user) external view returns (uint256);
}

/**
 * @title ArcStarShip (TX Clicker Edition)
 * @notice Logs every user action on-chain to stress test the Arc testnet
 * @dev Designed for ultra-high transaction throughput with lightweight bookkeeping
 */
contract ArcStarShip {
    enum ActionType {
        COLLECT,
        DODGE,
        SCAN,
        BOOST,
        CLAIM
    }

    struct PlayerStats {
        uint256 xp;
        uint256 totalActions;
        uint256 dodges;
        uint256 scans;
        uint256 boosts;
        uint256 claims;
        uint256 referralXp;
        uint256 totalClaimedXp;
        uint256 lastActionBlock;
    }

    // ======== Constants ========
    uint256 public constant ONE = 1e18;
    uint256 public constant BASE_XP = 10;
    uint256 public constant DODGE_BONUS = 5;
    uint256 public constant SCAN_BONUS = 3;
    uint256 public constant REFERRAL_BONUS = 5;

    // ======== Storage ========
    mapping(address => PlayerStats) public playerStats;
    mapping(address => address) public referrerOf;
    IStakingContract public immutable stakingContract;

    // ======== Events ========
    event ActionLogged(
        address indexed player,
        ActionType action,
        uint256 xpDelta,
        uint256 newXp,
        address indexed referrer,
        bytes metadata
    );

    event ReferralSet(address indexed player, address indexed referrer, uint256 bonusXp);

    constructor(address _stakingContract) {
        stakingContract = IStakingContract(_stakingContract);
    }

    // ======== Public functions ========

    /**
     * @notice Perform a clicker action that gets fully logged on-chain
     * @param action Action identifier (Collect, Dodge, Scan, Boost, Claim)
     * @param metadata Optional payload emitted for subgraph/indexers
     * @param referrer Optional address to attribute referral XP
     */
    function performAction(
        ActionType action,
        bytes calldata metadata,
        address referrer
    ) external {
        PlayerStats storage stats = playerStats[msg.sender];
        _maybeAssignReferrer(msg.sender, referrer);

        uint256 xpDelta = _applyAction(stats, action);

        stats.totalActions += 1;
        stats.lastActionBlock = block.number;

        emit ActionLogged(
            msg.sender,
            action,
            xpDelta,
            stats.xp,
            referrerOf[msg.sender],
            metadata
        );
    }

    /**
     * @notice View helper for the subgraph or frontend
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @notice Batch getter for leaderboards
     */
    function getPlayerStatsBatch(address[] calldata players)
        external
        view
        returns (PlayerStats[] memory results)
    {
        results = new PlayerStats[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            results[i] = playerStats[players[i]];
        }
    }

    // ======== Internal helpers ========

    function _applyAction(PlayerStats storage stats, ActionType action) internal returns (uint256 xpDelta) {
        if (action == ActionType.CLAIM) {
            require(stats.xp > 0, "No XP to claim");
            stats.totalClaimedXp += stats.xp;
            stats.xp = 0;
            stats.claims += 1;
            return 0;
        }

        uint256 multiplier = _currentMultiplier(msg.sender);

        if (action == ActionType.COLLECT) {
            xpDelta = (BASE_XP * multiplier) / ONE;
        } else if (action == ActionType.DODGE) {
            xpDelta = (DODGE_BONUS * multiplier) / ONE;
            stats.dodges += 1;
        } else if (action == ActionType.SCAN) {
            xpDelta = (SCAN_BONUS * multiplier) / ONE;
            stats.scans += 1;
        } else if (action == ActionType.BOOST) {
            stats.boosts += 1;
            xpDelta = 0;
        } else {
            revert("Unknown action");
        }

        if (xpDelta > 0) {
            stats.xp += xpDelta;
        }

        return xpDelta;
    }

    function _maybeAssignReferrer(address player, address referrer) internal {
        if (referrer == address(0) || referrer == player) {
            return;
        }
        if (referrerOf[player] != address(0)) {
            return;
        }

        referrerOf[player] = referrer;

        PlayerStats storage refStats = playerStats[referrer];
        refStats.referralXp += REFERRAL_BONUS;
        refStats.xp += REFERRAL_BONUS;

        emit ReferralSet(player, referrer, REFERRAL_BONUS);
    }

    function _currentMultiplier(address player) internal view returns (uint256) {
        if (address(stakingContract) == address(0)) {
            return ONE;
        }

        try stakingContract.getCurrentMultiplier(player) returns (uint256 multiplier) {
            if (multiplier == 0) {
                return ONE;
            }
            return multiplier;
        } catch {
            return ONE;
        }
    }
}

