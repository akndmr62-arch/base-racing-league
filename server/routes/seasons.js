import express from 'express'
import db from '../db.js'
import { config } from '../config.js'

const router = express.Router()

// Get current season info
router.get('/current', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, season_number, start_date, end_date, status 
       FROM seasons WHERE status = 'active' LIMIT 1`
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active season' })
    }

    const season = result.rows[0]
    
    // Get current week
    const weeksElapsed = Math.floor(
      (new Date() - new Date(season.start_date)) / (1000 * 60 * 60 * 24 * 7)
    )
    const currentWeek = Math.min(weeksElapsed + 1, config.SEASON_DURATION_WEEKS)

    res.json({
      ...season,
      currentWeek,
      weeksRemaining: config.SEASON_DURATION_WEEKS - currentWeek + 1,
    })
  } catch (error) {
    console.error('Season error:', error)
    res.status(500).json({ error: 'Failed to fetch season' })
  }
})

// Get season stats
router.get('/:seasonId/stats', async (req, res) => {
  try {
    const { seasonId } = req.params

    const result = await db.query(
      `SELECT season_number, start_date, end_date, total_races, status 
       FROM seasons WHERE id = $1`,
      [seasonId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Season stats error:', error)
    res.status(500).json({ error: 'Failed to fetch season stats' })
  }
})

export default router
