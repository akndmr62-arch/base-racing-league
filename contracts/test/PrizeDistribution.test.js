const { expect } = require("chai");

describe("PrizeDistribution", function () {
  let prizeDistribution;
  let usdcMock;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    usdcMock = await MockUSDC.deploy("USDC", "USDC", ethers.parseUnits("10000", 6));
    await usdcMock.waitForDeployment();

    // Deploy PrizeDistribution
    const PrizeDistribution = await ethers.getContractFactory("PrizeDistribution");
    prizeDistribution = await PrizeDistribution.deploy(await usdcMock.getAddress());
    await prizeDistribution.waitForDeployment();
  });

  describe("Prize Pool", function () {
    it("Should deposit to prize pool", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await usdcMock.approve(await prizeDistribution.getAddress(), amount);
      await prizeDistribution.depositPrizePool(amount);

      const pool = await prizeDistribution.totalPrizePool();
      expect(pool).to.equal(amount);
    });

    it("Should allocate prize for season", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await usdcMock.approve(await prizeDistribution.getAddress(), amount);
      await prizeDistribution.depositPrizePool(amount);

      const allocateAmount = ethers.parseUnits("500", 6);
      await prizeDistribution.allocatePrizeForSeason(1, allocateAmount);

      const seasonPrize = await prizeDistribution.getSeasonPrize(1);
      expect(seasonPrize.totalPool).to.equal(allocateAmount);
    });
  });

  describe("Prize Claiming", function () {
    it("Should claim prize for winner", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await usdcMock.approve(await prizeDistribution.getAddress(), amount);
      await prizeDistribution.depositPrizePool(amount);

      await prizeDistribution.allocatePrizeForSeason(1, amount);

      // Claim 1st place prize
      const prizeAmount = await prizeDistribution.getPrizeAmount(1, 1);
      await prizeDistribution.claimPrize(1, 0, 1, addr1.address);

      const balance = await usdcMock.balanceOf(addr1.address);
      expect(balance).to.equal(prizeAmount);
    });
  });
});

// Mock ERC20 for testing
contracts = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol) 
    {
        _mint(msg.sender, initialSupply);
    }
}
`;
