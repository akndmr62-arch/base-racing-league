import express from 'express'
import { verifyNFTOwnership, getCurrentNFTOwner } from '../blockchain.js'
import db from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Login: Generate session token
router.post('/login', async (req, res) => {
  try {
    const { wallet, nftId, signature } = req.body

    if (!wallet || nftId === undefined) {
      return res.status(400).json({ error: 'Missing wallet or nftId' })
    }

    // Verify NFT ownership
    const isOwner = await verifyNFTOwnership(wallet, nftId)
    if (!isOwner) {
      return res.status(403).json({ error: 'NFT not owned by this wallet' })
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store session
    await db.query(
      `INSERT INTO player_sessions (wallet_address, nft_id, session_token, expires_at) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_address, nft_id) 
       DO UPDATE SET session_token = $3, expires_at = $4`,
      [wallet, nftId, sessionToken, expiresAt]
    )

    res.json({
      sessionToken,
      expiresAt,
      wallet,
      nftId,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Verify session token
router.post('/verify', async (req, res) => {
  try {
    const { sessionToken } = req.body

    if (!sessionToken) {
      return res.status(400).json({ error: 'Missing sessionToken' })
    }

    const result = await db.query(
      `SELECT wallet_address, nft_id, expires_at FROM player_sessions 
       WHERE session_token = $1 AND expires_at > NOW()`,
      [sessionToken]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired session' })
    }

    const session = result.rows[0]
    res.json({
      valid: true,
      wallet: session.wallet_address,
      nftId: session.nft_id,
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body

    await db.query(
      `DELETE FROM player_sessions WHERE session_token = $1`,
      [sessionToken]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

export default router
