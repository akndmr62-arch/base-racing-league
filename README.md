# Base Racing League 🏎️⚡

18-week NFT racing league on Base network with smart contracts, real-time gameplay, and 1000 USDC prize pool.

## 🎮 Game Overview

- **114 NFT Holders** compete weekly
- **18-week season** with points accumulation
- **Boost Mechanics**: 2 random timing windows per race
- **Wind Events**: Random advantage for 5 NFT holders
- **Premier League Format**: Final rankings determine prize distribution
- **Prize Pool**: 1000 USDC split among top 5

## 🏆 Prize Distribution (Season End)

- 1st Place: 400 USDC
- 2nd Place: 250 USDC
- 3rd Place: 150 USDC
- 4th Place: 100 USDC
- 5th Place: 100 USDC

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Three.js for 3D animation
- Socket.io for real-time updates
- Wagmi + RainbowKit for wallet connection
- TailwindCSS for styling

### Backend
- Node.js + Express
- PostgreSQL for persistent storage
- Redis for session management
- Socket.io for WebSocket communication
- Ethers.js for blockchain interaction

### Smart Contracts
- Solidity (ERC721 integration)
- Hardhat for development
- Base Mainnet deployment

## 📁 Project Structure

```
base-racing-league/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # TailwindCSS
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   ├── index.js
│   └── package.json
│
├── contracts/             # Smart contracts
│   ├── contracts/
│   │   ├── LeagueRacer.sol
│   │   ├── LeagueLeaderboard.sol
│   │   └── PrizeDistribution.sol
│   ├── test/
│   ├── scripts/
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/                  # Documentation
├── package.json           # Root workspace
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/akndmr62-arch/base-racing-league.git
cd base-racing-league

# Install dependencies (all workspaces)
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Setup database
cd server && npm run db:migrate

# Start development servers
npm run dev
```

### Development

```bash
# Start frontend only
npm run dev:client

# Start backend only
npm run dev:server

# Run contract tests
npm run test:contracts

# Deploy to Base Sepolia (testnet)
npm run deploy:testnet

# Deploy to Base Mainnet
npm run deploy:mainnet
```

## 📊 Database Schema

See `/docs/database-schema.sql` for complete schema.

Key tables:
- `seasons` - League seasons
- `races` - Weekly races
- `race_results` - Individual race results
- `leaderboard` - Live rankings
- `prize_claims` - Prize withdrawals

## 🔐 Security

- Off-chain NFT ownership verification
- Server-side boost timing randomness
- Session token authentication
- Rate limiting on API
- Contract verification on Basescan

## 📝 Documentation

- [Database Schema](./docs/database-schema.sql)
- [API Documentation](./docs/API.md)
- [Smart Contract Guide](./docs/CONTRACTS.md)
- [How to Play](./docs/HOW_TO_PLAY.md)

## 📈 Roadmap

- [x] Project setup
- [ ] Week 1: Backend foundation
- [ ] Week 2: Frontend + 3D animation
- [ ] Week 3: Real-time integration
- [ ] Week 4-5: Smart contracts
- [ ] Week 6-7: Contract integration
- [ ] Week 8: Launch prep

## 🤝 Contributing

This is a private project. For issues or questions, contact the team.

## 📄 License

MIT
