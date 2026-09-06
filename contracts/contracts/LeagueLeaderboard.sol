// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title LeagueLeaderboard
 * @dev Manages the NFT racing league leaderboard and rankings
 * NFT-centric architecture: NFT ID is the primary entity
 */
contract LeagueLeaderboard is Ownable, ReentrancyGuard {
    // Constants
    uint256 constant NFT_TOTAL_COUNT = 114;
    uint256 constant SEASON_DURATION_WEEKS = 18;
    
    // NFT Contract
    IERC721 public nftContract;
    
    // Season structure
    struct Season {
        uint256 id;
        uint256 seasonNumber;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRaces;
        bool active;
    }
    
    // NFT Stats per Season
    struct NFTStats {
        uint256 nftId;
        uint256 totalPoints;
        uint256 totalRaces;
        uint256 wins;
        uint256 rank;
    }
    
    // Race Result
    struct RaceResult {
        uint256 raceId;
        uint256 nftId;
        address ownerAtTime;
        uint256 position;
        uint256 pointsEarned;
        uint256 finishTime;
        bool boosted;
        bool windAffected;
        uint256 timestamp;
    }
    
    // Storage
    mapping(uint256 => Season) public seasons;
    mapping(uint256 => mapping(uint256 => NFTStats)) public nftStats; // seasonId => nftId => stats
    mapping(uint256 => RaceResult[]) public raceResults; // raceId => results
    mapping(uint256 => uint256) public nftCurrentOwner; // nftId => owner (stored as uint for simplicity)
    
    uint256 public currentSeasonId = 1;
    uint256 public currentRaceId = 1;
    
    // Events
    event SeasonCreated(uint256 indexed seasonId, uint256 seasonNumber, uint256 startTime);
    event RaceRecorded(uint256 indexed raceId, uint256 indexed seasonId, uint256 week);
    event ResultRecorded(uint256 indexed raceId, uint256 indexed nftId, uint256 position, uint256 pointsEarned);
    event LeaderboardUpdated(uint256 indexed seasonId);
    event NFTOwnershipUpdated(uint256 indexed nftId, address newOwner);
    
    /**
     * @dev Initialize the contract with NFT contract address
     */
    constructor(address _nftContractAddress) {
        nftContract = IERC721(_nftContractAddress);
        
        // Create Season 1
        _createSeason(1);
    }
    
    /**
     * @dev Create a new season
     */
    function _createSeason(uint256 _seasonNumber) internal {
        uint256 seasonId = currentSeasonId;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (SEASON_DURATION_WEEKS * 7 days);
        
        seasons[seasonId] = Season({
            id: seasonId,
            seasonNumber: _seasonNumber,
            startTime: startTime,
            endTime: endTime,
            totalRaces: 0,
            active: true
        });
        
        // Initialize all 114 NFTs with 0 stats
        for (uint256 i = 0; i < NFT_TOTAL_COUNT; i++) {
            nftStats[seasonId][i] = NFTStats({
                nftId: i,
                totalPoints: 0,
                totalRaces: 0,
                wins: 0,
                rank: 0
            });
        }
        
        emit SeasonCreated(seasonId, _seasonNumber, startTime);
        currentSeasonId++;
    }
    
    /**
     * @dev Record race results
     * Only owner can call (will be backend server)
     */
    function recordRaceResults(
        uint256 _seasonId,
        uint256 _week,
        uint256[] calldata _nftIds,
        address[] calldata _owners,
        uint256[] calldata _positions,
        uint256[] calldata _points,
        uint256[] calldata _finishTimes,
        bool[] calldata _boosted,
        bool[] calldata _windAffected
    ) external onlyOwner nonReentrant {
        require(_nftIds.length == _owners.length, "Length mismatch");
        require(_nftIds.length == _positions.length, "Length mismatch");
        require(_nftIds.length == _points.length, "Length mismatch");
        require(_nftIds.length == 114, "Must record all 114 NFTs");
        require(seasons[_seasonId].active, "Season not active");
        
        uint256 raceId = currentRaceId;
        
        // Record each result
        for (uint256 i = 0; i < _nftIds.length; i++) {
            uint256 nftId = _nftIds[i];
            address owner = _owners[i];
            uint256 points = _points[i];
            
            // Create race result
            RaceResult memory result = RaceResult({
                raceId: raceId,
                nftId: nftId,
                ownerAtTime: owner,
                position: _positions[i],
                pointsEarned: points,
                finishTime: _finishTimes[i],
                boosted: _boosted[i],
                windAffected: _windAffected[i],
                timestamp: block.timestamp
            });
            
            raceResults[raceId].push(result);
            
            // Update NFT stats
            nftStats[_seasonId][nftId].totalPoints += points;
            nftStats[_seasonId][nftId].totalRaces++;
            if (_positions[i] == 1) {
                nftStats[_seasonId][nftId].wins++;
            }
            
            // Update current owner
            nftCurrentOwner[nftId] = uint256(uint160(owner));
            
            emit ResultRecorded(raceId, nftId, _positions[i], points);
            emit NFTOwnershipUpdated(nftId, owner);
        }
        
        // Update season
        seasons[_seasonId].totalRaces++;
        
        emit RaceRecorded(raceId, _seasonId, _week);
        currentRaceId++;
    }
    
    /**
     * @dev Update leaderboard rankings
     */
    function updateLeaderboard(uint256 _seasonId) external onlyOwner {
        require(seasons[_seasonId].active || block.timestamp > seasons[_seasonId].endTime, "Invalid season");
        
        // Create array of NFTs with their points
        NFTStats[] memory stats = new NFTStats[](NFT_TOTAL_COUNT);
        
        for (uint256 i = 0; i < NFT_TOTAL_COUNT; i++) {
            stats[i] = nftStats[_seasonId][i];
        }
        
        // Sort by points (bubble sort - gas inefficient but simple for demo)
        for (uint256 i = 0; i < NFT_TOTAL_COUNT; i++) {
            for (uint256 j = i + 1; j < NFT_TOTAL_COUNT; j++) {
                if (stats[j].totalPoints > stats[i].totalPoints) {
                    NFTStats memory temp = stats[i];
                    stats[i] = stats[j];
                    stats[j] = temp;
                }
            }
        }
        
        // Update ranks
        for (uint256 i = 0; i < NFT_TOTAL_COUNT; i++) {
            nftStats[_seasonId][stats[i].nftId].rank = i + 1;
        }
        
        emit LeaderboardUpdated(_seasonId);
    }
    
    /**
     * @dev Get NFT stats for a season
     */
    function getNFTStats(uint256 _seasonId, uint256 _nftId) 
        external 
        view 
        returns (NFTStats memory) 
    {
        return nftStats[_seasonId][_nftId];
    }
    
    /**
     * @dev Get top 5 NFTs by points
     */
    function getTopNFTs(uint256 _seasonId, uint256 _limit) 
        external 
        view 
        returns (NFTStats[] memory) 
    {
        NFTStats[] memory result = new NFTStats[](_limit);
        
        for (uint256 i = 0; i < _limit && i < NFT_TOTAL_COUNT; i++) {
            NFTStats memory topStats;
            uint256 topRank = 0;
            
            for (uint256 j = 0; j < NFT_TOTAL_COUNT; j++) {
                if (nftStats[_seasonId][j].rank == i + 1) {
                    topStats = nftStats[_seasonId][j];
                    break;
                }
            }
            
            result[i] = topStats;
        }
        
        return result;
    }
    
    /**
     * @dev Get current owner of NFT
     */
    function getNFTCurrentOwner(uint256 _nftId) external view returns (address) {
        return address(uint160(nftCurrentOwner[_nftId]));
    }
    
    /**
     * @dev Get season info
     */
    function getSeason(uint256 _seasonId) external view returns (Season memory) {
        return seasons[_seasonId];
    }
    
    /**
     * @dev Check if season is active
     */
    function isSeasonActive(uint256 _seasonId) external view returns (bool) {
        return seasons[_seasonId].active && block.timestamp < seasons[_seasonId].endTime;
    }
}
