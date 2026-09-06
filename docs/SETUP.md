# Setup Guide

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/akndmr62-arch/base-racing-league.git
cd base-racing-league
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### PostgreSQL
```bash
# Create database
createdb racing_league

# Run migrations
cd server
npm run db:migrate
```

#### Redis
```bash
# Install Redis (macOS)
brew install redis

# Start Redis
redis-server
```

### 4. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with:
- `BASE_RPC_URL`: Get from Alchemy or Infura
- `PRIVATE_KEY`: Your wallet private key (testnet only)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### 5. Smart Contracts Setup
```bash
cd contracts
npm install
```

### 6. Start Development
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- WebSocket: ws://localhost:3000

## Testing

### Contract Tests
```bash
cd contracts
npm run test
```

### Local E2E Testing
1. Start dev servers: `npm run dev`
2. Connect wallet in UI
3. Join race
4. Watch animation
5. Check leaderboard updates

## Deployment

### Base Sepolia (Testnet)
```bash
npm run deploy:testnet
```

### Base Mainnet
```bash
npm run deploy:mainnet
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i :3000)
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify connection string in .env
echo $DATABASE_URL
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```
