const { expect } = require("chai");

describe("LeagueLeaderboard", function () {
  let leaderboard;
  let nftMock;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock NFT
    const MockNFT = await ethers.getContractFactory("MockERC721");
    nftMock = await MockNFT.deploy();
    await nftMock.waitForDeployment();

    // Deploy LeagueLeaderboard
    const LeagueLeaderboard = await ethers.getContractFactory("LeagueLeaderboard");
    leaderboard = await LeagueLeaderboard.deploy(await nftMock.getAddress());
    await leaderboard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should create Season 1 on deployment", async function () {
      const season = await leaderboard.getSeason(1);
      expect(season.seasonNumber).to.equal(1);
      expect(season.active).to.be.true;
    });
  });

  describe("Race Recording", function () {
    it("Should record race results for all 114 NFTs", async function () {
      const nftIds = Array.from({ length: 114 }, (_, i) => i);
      const owners = Array(114).fill(addr1.address);
      const positions = Array.from({ length: 114 }, (_, i) => i + 1);
      const points = Array(114).fill(10);
      const finishTimes = Array.from({ length: 114 }, (_, i) => (i + 1) * 1000);
      const boosted = Array(114).fill(false);
      const windAffected = Array(114).fill(false);

      await leaderboard.recordRaceResults(
        1,
        1,
        nftIds,
        owners,
        positions,
        points,
        finishTimes,
        boosted,
        windAffected
      );

      const stats = await leaderboard.getNFTStats(1, 0);
      expect(stats.totalPoints).to.equal(10);
      expect(stats.totalRaces).to.equal(1);
    });
  });

  describe("Leaderboard Update", function () {
    it("Should update leaderboard rankings", async function () {
      // Record a race
      const nftIds = Array.from({ length: 114 }, (_, i) => i);
      const owners = Array(114).fill(addr1.address);
      const positions = Array.from({ length: 114 }, (_, i) => i + 1);
      const points = positions.map((p) => 115 - p); // Descending points
      const finishTimes = Array.from({ length: 114 }, (_, i) => (i + 1) * 1000);
      const boosted = Array(114).fill(false);
      const windAffected = Array(114).fill(false);

      await leaderboard.recordRaceResults(
        1,
        1,
        nftIds,
        owners,
        positions,
        points,
        finishTimes,
        boosted,
        windAffected
      );

      // Update leaderboard
      await leaderboard.updateLeaderboard(1);

      const topStats = await leaderboard.getTopNFTs(1, 5);
      expect(topStats[0].rank).to.equal(1);
    });
  });
});

// Mock ERC721 for testing
contracts = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract MockERC721 is ERC721 {
    constructor() ERC721("MockNFT", "MNFT") {}
    
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}
`;
