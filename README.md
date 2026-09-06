# Base Racing League

🏁 An 18-week NFT racing championship on Base network

## Overview

Base Racing League is a blockchain-based racing game where 114 unique NFTs compete in weekly races. NFTs are ranked on an on-chain leaderboard, with top performers earning USDC rewards.

### Key Features

- **114 NFT Participants**: CryptoBullkt collection
- **18-Week Season**: Weekly races with cumulative scoring
- **Real-time Leaderboard**: NFT-centric rankings updated after each race
- **Prize Pool**: 1000 USDC distributed to top 5 NFTs
- **On-Chain Results**: All race data stored on Base blockchain
- **3D Racing UI**: Interactive Three.js visualization
- **Ownership-Independent**: NFTs race regardless of current owner

## Architecture

### Frontend
- React 18 + TypeScript
- Three.js for 3D racing visualization
- Wagmi + RainbowKit for wallet connection
- Socket.io for real-time updates
- TailwindCSS for styling

### Backend
- Node.js + Express
- PostgreSQL for race history
- Redis for session caching
- Socket.io for WebSocket orchestration
- Ethers.js for blockchain integration

### Smart Contracts
- LeagueLeaderboard.sol: Manages rankings and race results
- PrizeDistribution.sol: Handles USDC prize claims
- Built with OpenZeppelin contracts
- Deployed on Base mainnet

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Base RPC endpoint (Alchemy)

### Installation

```bash
# Clone repository
git clone https://github.com/akndmr62-arch/base-racing-league.git
cd base-racing-league

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Database setup
npm run db:migrate
npm run db:seed
```

### Running

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

## Smart Contract Deployment

```bash
cd contracts

# Compile
npm run compile

# Test
npm run test

# Deploy to Base Sepolia
npm run deploy:sepolia

# Deploy to Base Mainnet
npm run deploy:mainnet
```

## Game Rules

### Race Duration
- 3 minutes (180 seconds) per race
- All 114 NFTs participate automatically

### Scoring
- 1st Place: 25 points
- 2nd Place: 18 points
- 3rd Place: 15 points
- ...
- 10th+ Place: 4 points

### Mechanics
- **Boost Events**: Random timing, temporary speed increase
- **Wind Events**: Affects 5 random NFTs, provides speed bonus
- **Season Ranking**: Cumulative points across 18 weeks

### Prizes
- 1st: 400 USDC (40%)
- 2nd: 250 USDC (25%)
- 3rd: 150 USDC (15%)
- 4th: 100 USDC (10%)
- 5th: 100 USDC (10%)

## Database Schema

### Core Tables
- `seasons`: Season metadata
- `nfts`: NFT entities (primary)
- `nft_season_stats`: Per-season NFT statistics
- `races`: Weekly race information
- `race_results`: Individual race outcomes
- `leaderboard`: Cached rankings
- `prize_claims`: Prize distribution tracking

## API Endpoints

### Authentication
- `POST /api/auth/login`: Generate session token
- `POST /api/auth/verify`: Verify session
- `POST /api/auth/logout`: End session

### Game Data
- `GET /api/seasons/current`: Active season info
- `GET /api/leaderboard/current`: Live leaderboard
- `GET /api/races/current`: Current race details

## WebSocket Events

- `race:join`: Player joins race
- `race:start`: Race begins
- `race:boost-available`: Boost ready
- `race:boost-pressed`: Player uses boost
- `race:wind-event`: Wind effect activated
- `race:finish`: Race completed
- `race:result`: Final rankings

## Security

- NFT ownership verification via blockchain
- Session tokens with 24-hour expiry
- ReentrancyGuard on prize distribution
- Rate limiting on API endpoints
- Private key management via environment variables

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
