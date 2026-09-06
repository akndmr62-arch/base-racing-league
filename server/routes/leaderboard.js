import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get leaderboard for current season
router.get('/current', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.rank, l.nft_id, l.current_owner, l.total_points, l.total_races, l.wins
       FROM leaderboard l
       JOIN seasons s ON l.season_id = s.id
       WHERE s.status = 'active'
       ORDER BY l.rank ASC
       LIMIT 114`
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// Get leaderboard for specific season
router.get('/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params

    const result = await db.query(
      `SELECT rank, nft_id, current_owner, total_points, total_races, wins
       FROM leaderboard
       WHERE season_id = $1
       ORDER BY rank ASC`,
      [seasonId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// Get NFT stats
router.get('/nft/:nftId', async (req, res) => {
  try {
    const { nftId } = req.params

    const result = await db.query(
      `SELECT nft_id, current_owner, total_points, rank, total_races, wins
       FROM leaderboard
       WHERE nft_id = $1 AND season_id = (SELECT id FROM seasons WHERE status = 'active' LIMIT 1)`,
      [nftId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NFT stats not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('NFT stats error:', error)
    res.status(500).json({ error: 'Failed to fetch NFT stats' })
  }
})

export default router
