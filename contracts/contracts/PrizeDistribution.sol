// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title PrizeDistribution
 * @dev Handles prize distribution to top 5 NFTs each season
 */
contract PrizeDistribution is Ownable, ReentrancyGuard {
    // USDC token (Base mainnet)
    IERC20 public usdcToken;
    
    // Prize distribution percentages
    uint256[5] public prizePercentages = [40, 25, 15, 10, 10]; // 40%, 25%, 15%, 10%, 10%
    
    // Prize pool
    uint256 public totalPrizePool = 0;
    
    // Claimed prizes
    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) public prizeClaimed; // seasonId => nftId => position => claimed
    
    // Season prize info
    struct SeasonPrize {
        uint256 seasonId;
        uint256 totalPool;
        uint256 distributedAmount;
        bool finalized;
    }
    
    mapping(uint256 => SeasonPrize) public seasonPrizes;
    
    // Events
    event PrizePoolUpdated(uint256 newTotal);
    event PrizeClaimed(uint256 indexed seasonId, uint256 indexed nftId, uint256 position, uint256 amount, address winner);
    event PrizeAllocated(uint256 indexed seasonId, uint256 amount);
    
    /**
     * @dev Initialize with USDC token address
     */
    constructor(address _usdcAddress) {
        usdcToken = IERC20(_usdcAddress);
    }
    
    /**
     * @dev Add funds to prize pool
     */
    function depositPrizePool(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be > 0");
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        totalPrizePool += _amount;
        emit PrizePoolUpdated(totalPrizePool);
    }
    
    /**
     * @dev Allocate prize pool to a season
     */
    function allocatePrizeForSeason(uint256 _seasonId, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= totalPrizePool, "Insufficient pool");
        
        seasonPrizes[_seasonId] = SeasonPrize({
            seasonId: _seasonId,
            totalPool: _amount,
            distributedAmount: 0,
            finalized: false
        });
        
        totalPrizePool -= _amount;
        emit PrizeAllocated(_seasonId, _amount);
    }
    
    /**
     * @dev Claim prize for NFT
     * Only the current owner can claim
     */
    function claimPrize(
        uint256 _seasonId,
        uint256 _nftId,
        uint256 _position,
        address _nftOwner
    ) external nonReentrant returns (bool) {
        require(_position >= 1 && _position <= 5, "Invalid position");
        require(_nftOwner != address(0), "Invalid owner");
        require(!prizeClaimed[_seasonId][_nftId][_position], "Already claimed");
        
        SeasonPrize storage seasonPrize = seasonPrizes[_seasonId];
        require(seasonPrize.totalPool > 0, "No prize pool");
        
        // Calculate prize amount
        uint256 prizeAmount = (seasonPrize.totalPool * prizePercentages[_position - 1]) / 100;
        
        require(prizeAmount > 0, "Prize amount is 0");
        require(
            usdcToken.balanceOf(address(this)) >= prizeAmount,
            "Insufficient balance"
        );
        
        // Mark as claimed
        prizeClaimed[_seasonId][_nftId][_position] = true;
        seasonPrize.distributedAmount += prizeAmount;
        
        // Transfer prize
        require(usdcToken.transfer(_nftOwner, prizeAmount), "Transfer failed");
        
        emit PrizeClaimed(_seasonId, _nftId, _position, prizeAmount, _nftOwner);
        
        return true;
    }
    
    /**
     * @dev Claim prizes for top 5 NFTs (batch)
     */
    function claimPrizeBatch(
        uint256 _seasonId,
        uint256[] calldata _nftIds,
        uint256[] calldata _positions,
        address[] calldata _owners
    ) external onlyOwner nonReentrant {
        require(_nftIds.length == _positions.length, "Length mismatch");
        require(_nftIds.length == _owners.length, "Length mismatch");
        require(_nftIds.length <= 5, "Max 5 prizes");
        
        for (uint256 i = 0; i < _nftIds.length; i++) {
            claimPrize(_seasonId, _nftIds[i], _positions[i], _owners[i]);
        }
    }
    
    /**
     * @dev Check if prize is claimed
     */
    function isPrizeClaimed(
        uint256 _seasonId,
        uint256 _nftId,
        uint256 _position
    ) external view returns (bool) {
        return prizeClaimed[_seasonId][_nftId][_position];
    }
    
    /**
     * @dev Get season prize info
     */
    function getSeasonPrize(uint256 _seasonId) external view returns (SeasonPrize memory) {
        return seasonPrizes[_seasonId];
    }
    
    /**
     * @dev Get prize amount for position
     */
    function getPrizeAmount(uint256 _seasonId, uint256 _position) 
        external 
        view 
        returns (uint256) 
    {
        require(_position >= 1 && _position <= 5, "Invalid position");
        SeasonPrize memory seasonPrize = seasonPrizes[_seasonId];
        return (seasonPrize.totalPool * prizePercentages[_position - 1]) / 100;
    }
    
    /**
     * @dev Withdraw unclaimed prizes (owner only)
     */
    function withdrawUnclaimed(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= usdcToken.balanceOf(address(this)), "Insufficient balance");
        require(usdcToken.transfer(msg.sender, _amount), "Transfer failed");
    }
}
