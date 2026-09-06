import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

export const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/racing_league',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Blockchain
  BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS || '0xf2825fd612fce5380d99c63f18218432149ae0c6',
  USDC_ADDRESS: process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b3cA6f42C08',
  
  // Game Config
  SEASON_DURATION_WEEKS: 18,
  RACE_DURATION_MS: 180000, // 3 minutes
  NFT_TOTAL_COUNT: 114,n  WIND_AFFECTED_COUNT: 5,
  
  // Prize Distribution
  PRIZE_POOL: 1000,
  PRIZE_DISTRIBUTION: [
    { position: 1, amount: 400 },
    { position: 2, amount: 250 },
    { position: 3, amount: 150 },
    { position: 4, amount: 100 },
    { position: 5, amount: 100 },
  ],
  
  // Payout System
  POINTS_SYSTEM: {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 7,
    8: 6,
    9: 5,
    10: 4,
  },
}

export default config
