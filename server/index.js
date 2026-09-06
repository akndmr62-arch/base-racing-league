import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import bodyParser from 'body-parser'
import initDatabase from './migrations.js'
import seedDatabase from './seed.js'
import { config } from './config.js'
import db from './db.js'
import { getCurrentNFTOwner } from './blockchain.js'

// Routes
import authRoutes from './routes/auth.js'
import seasonRoutes from './routes/seasons.js'
import leaderboardRoutes from './routes/leaderboard.js'
import raceRoutes from './routes/races.js'

const app = express()
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/seasons', seasonRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/races', raceRoutes)

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.id}`)

  socket.on('race:join', async (data) => {
    const { wallet, nftId } = data
    console.log(`📍 NFT #${nftId} (Owner: ${wallet}) joined race`)
    
    socket.emit('race:joined', { raceId: socket.id, nftId })
  })

  socket.on('race:boost-pressed', (data) => {
    const { boostNum, pressedAt } = data
    console.log(`⚡ Boost #${boostNum} pressed at ${pressedAt}ms`)
    
    socket.broadcast.emit('race:boost-event', { nftId: socket.id, boostNum, pressedAt })
  })

  socket.on('race:finish', (data) => {
    const { finalTime } = data
    console.log(`🏁 Race finished: ${finalTime}ms`)
    
    socket.emit('race:result', { timestamp: Date.now() })
  })

  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`)
  })
})

// Initialize and start
const startServer = async () => {
  try {
    console.log('🚀 Starting Base Racing League Server...')
    
    // Initialize database
    await initDatabase()
    
    // Seed initial data
    await seedDatabase()
    
    // Start HTTP server
    httpServer.listen(config.PORT, () => {
      console.log(`✅ Server running on port ${config.PORT}`)
      console.log(`📊 Database: ${config.DATABASE_URL}`)
      console.log(`🔗 Blockchain: ${config.BASE_RPC_URL}`)
      console.log(`🎮 WebSocket ready for connections`)
    })
  } catch (error) {
    console.error('❌ Server startup failed:', error)
    process.exit(1)
  }
}

startServer()

export { app, io, httpServer }
