// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StakingContract
 * @notice USDC staking for game boosts
 * @dev Tiers: 25 USDC = 1.2x, 50 USDC = 1.5x, 100 USDC = 2.0x
 */
contract StakingContract {
    using SafeERC20 for IERC20;

    // ============ Types ============
    
    struct StakeInfo {
        uint256 amount;           // Staked USDC amount
        uint256 multiplier;       // XP multiplier (1e18 = 1x, 12e17 = 1.2x)
        uint256 startTime;        // When staking started
        uint256 duration;         // Boost duration in seconds
        bool isActive;            // Whether stake is active
    }

    // ============ State Variables ============
    
    IERC20 public immutable usdcToken;
    
    mapping(address => StakeInfo) public stakes;
    
    // Staking tiers
    uint256 public constant TIER_1_AMOUNT = 25e6;  // 25 USDC (6 decimals)
    uint256 public constant TIER_1_MULTIPLIER = 12e17; // 1.2x (1.2 * 1e18)
    uint256 public constant TIER_2_AMOUNT = 50e6;  // 50 USDC
    uint256 public constant TIER_2_MULTIPLIER = 15e17; // 1.5x
    uint256 public constant TIER_3_AMOUNT = 100e6; // 100 USDC
    uint256 public constant TIER_3_MULTIPLIER = 2e18; // 2.0x
    
    uint256 public constant DEFAULT_DURATION = 7 days; // 7 days boost duration
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 multiplier, uint256 duration);
    event Unstaked(address indexed user, uint256 amount);
    event BoostExpired(address indexed user);

    // ============ Constructor ============
    
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcToken);
    }

    // ============ Functions ============

    /**
     * @notice Stake USDC to get game boost
     * @param amount Amount of USDC to stake (must match tier amounts)
     */
    function stake(uint256 amount) external {
        require(amount == TIER_1_AMOUNT || amount == TIER_2_AMOUNT || amount == TIER_3_AMOUNT, 
                "Invalid staking amount");
        
        address user = msg.sender;
        StakeInfo storage stakeInfo = stakes[user];
        
        // If user has existing stake, they must unstake first
        require(!stakeInfo.isActive || block.timestamp >= stakeInfo.startTime + stakeInfo.duration,
                "Active stake exists");
        
        // Determine multiplier based on amount
        uint256 multiplier;
        if (amount == TIER_1_AMOUNT) {
            multiplier = TIER_1_MULTIPLIER;
        } else if (amount == TIER_2_AMOUNT) {
            multiplier = TIER_2_MULTIPLIER;
        } else {
            multiplier = TIER_3_MULTIPLIER;
        }
        
        // Transfer USDC from user
        usdcToken.safeTransferFrom(user, address(this), amount);
        
        // Update stake info
        stakeInfo.amount = amount;
        stakeInfo.multiplier = multiplier;
        stakeInfo.startTime = block.timestamp;
        stakeInfo.duration = DEFAULT_DURATION;
        stakeInfo.isActive = true;
        
        emit Staked(user, amount, multiplier, DEFAULT_DURATION);
    }

    /**
     * @notice Unstake USDC (only after boost expires)
     */
    function unstake() external {
        address user = msg.sender;
        StakeInfo storage stakeInfo = stakes[user];
        
        require(stakeInfo.isActive, "No active stake");
        require(block.timestamp >= stakeInfo.startTime + stakeInfo.duration, 
                "Boost still active");
        
        uint256 amount = stakeInfo.amount;
        
        // Reset stake info
        stakeInfo.amount = 0;
        stakeInfo.multiplier = 0;
        stakeInfo.startTime = 0;
        stakeInfo.duration = 0;
        stakeInfo.isActive = false;
        
        // Return USDC to user
        usdcToken.safeTransfer(user, amount);
        
        emit Unstaked(user, amount);
    }

    /**
     * @notice Get current active multiplier for a user
     * @param user Address to check
     * @return multiplier Current multiplier (1e18 = 1x) or 1e18 if no active stake
     */
    function getCurrentMultiplier(address user) external view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        
        if (!stakeInfo.isActive) {
            return 1e18; // 1x default
        }
        
        if (block.timestamp >= stakeInfo.startTime + stakeInfo.duration) {
            return 1e18; // Expired
        }
        
        return stakeInfo.multiplier;
    }

    /**
     * @notice Check if user has active boost
     */
    function hasActiveBoost(address user) external view returns (bool) {
        StakeInfo memory stakeInfo = stakes[user];
        
        if (!stakeInfo.isActive) {
            return false;
        }
        
        return block.timestamp < stakeInfo.startTime + stakeInfo.duration;
    }

    /**
     * @notice Get remaining boost time for user
     */
    function getRemainingBoostTime(address user) external view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        
        if (!stakeInfo.isActive) {
            return 0;
        }
        
        uint256 endTime = stakeInfo.startTime + stakeInfo.duration;
        if (block.timestamp >= endTime) {
            return 0;
        }
        
        return endTime - block.timestamp;
    }
}

