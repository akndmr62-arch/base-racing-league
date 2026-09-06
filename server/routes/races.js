import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get current race
router.get('/current', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.season_id, r.week_number, r.race_date, r.status,
              s.season_number
       FROM races r
       JOIN seasons s ON r.season_id = s.id
       WHERE s.status = 'active' AND r.week_number = (
         SELECT CEIL(EXTRACT(DAY FROM (NOW() - s.start_date)) / 7.0)
         FROM seasons WHERE id = s.id
       )
       LIMIT 1`
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No current race' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Current race error:', error)
    res.status(500).json({ error: 'Failed to fetch current race' })
  }
})

// Get race by ID
router.get('/:raceId', async (req, res) => {
  try {
    const { raceId } = req.params

    const result = await db.query(
      `SELECT id, season_id, week_number, race_date, boost_time_1, boost_time_2, 
              wind_time, wind_affected_nfts, status
       FROM races
       WHERE id = $1`,
      [raceId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Race not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Race error:', error)
    res.status(500).json({ error: 'Failed to fetch race' })
  }
})

// Get race results
router.get('/:raceId/results', async (req, res) => {
  try {
    const { raceId } = req.params

    const result = await db.query(
      `SELECT nft_id, wallet_address, position, points_earned, finish_time, 
              boost_pressed_count, was_wind_affected
       FROM race_results
       WHERE race_id = $1
       ORDER BY position ASC`,
      [raceId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Race results error:', error)
    res.status(500).json({ error: 'Failed to fetch race results' })
  }
})

export default router
