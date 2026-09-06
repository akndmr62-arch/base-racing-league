import db from './db.js'
import { config } from './config.js'

export const seedDatabase = async () => {
  try {
    console.log('Seeding database...')

    // Create Season 1
    const seasonResult = await db.query(
      `INSERT INTO seasons (season_number, start_date, end_date, status) 
       VALUES ($1, NOW(), NOW() + INTERVAL '18 weeks', 'active')
       RETURNING id`,
      [1]
    )
    const seasonId = seasonResult.rows[0].id
    console.log(`✅ Season 1 created: ${seasonId}`)

    // Initialize all 114 NFTs
    for (let i = 0; i < config.NFT_TOTAL_COUNT; i++) {
      await db.query(
        `INSERT INTO nfts (nft_id, current_owner) 
         VALUES ($1, NULL)
         ON CONFLICT (nft_id) DO NOTHING`,
        [i]
      )
    }
    console.log(`✅ All 114 NFTs initialized`)

    // Create NFT Season Stats for all NFTs
    for (let i = 0; i < config.NFT_TOTAL_COUNT; i++) {
      await db.query(
        `INSERT INTO nft_season_stats (nft_id, season_id, total_points, total_races, wins) 
         VALUES ($1, $2, 0, 0, 0)
         ON CONFLICT (nft_id, season_id) DO NOTHING`,
        [i, seasonId]
      )
    }
    console.log(`✅ NFT season stats initialized`)

    console.log('✅ Database seeding completed')
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}

export default seedDatabase
