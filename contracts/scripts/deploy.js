const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Base Racing League Contracts...");

  // Contract addresses
  const NFT_CONTRACT = process.env.NFT_CONTRACT_ADDRESS || "0xf2825fd612fce5380d99c63f18218432149ae0c6";
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b3cA6f42C08";

  // Deploy LeagueLeaderboard
  console.log("\n📊 Deploying LeagueLeaderboard...");
  const LeagueLeaderboard = await hre.ethers.getContractFactory("LeagueLeaderboard");
  const leaderboard = await LeagueLeaderboard.deploy(NFT_CONTRACT);
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  console.log(`✅ LeagueLeaderboard deployed: ${leaderboardAddress}`);

  // Deploy PrizeDistribution
  console.log("\n💰 Deploying PrizeDistribution...");
  const PrizeDistribution = await hre.ethers.getContractFactory("PrizeDistribution");
  const prizeDistribution = await PrizeDistribution.deploy(USDC_ADDRESS);
  await prizeDistribution.waitForDeployment();
  const prizeDistributionAddress = await prizeDistribution.getAddress();
  console.log(`✅ PrizeDistribution deployed: ${prizeDistributionAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      LeagueLeaderboard: leaderboardAddress,
      PrizeDistribution: prizeDistributionAddress,
      NFT: NFT_CONTRACT,
      USDC: USDC_ADDRESS,
    },
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments", `${hre.network.name}.json`);
  
  // Create deployments directory if it doesn't exist
  const dir = path.dirname(deploymentPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to ${deploymentPath}`);

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
