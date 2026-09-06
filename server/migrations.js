import db from './db.js'

export const initDatabase = async () => {
  try {
    // Check if migrations have run
    const result = await db.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'seasons')"
    )
    
    if (!result.rows[0].exists) {
      console.log('Running database migrations...')
      await runMigrations()
    } else {
      console.log('Database already initialized')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

const runMigrations = async () => {
  const client = await db.getClient()
  
  try {
    await client.query('BEGIN')

    // Seasons Table
    await client.query(`
      CREATE TABLE seasons (
        id SERIAL PRIMARY KEY,
        season_number INT UNIQUE NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        total_races INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // NFTs Table (PRIMARY)
    await client.query(`
      CREATE TABLE nfts (
        id SERIAL PRIMARY KEY,
        nft_id INT UNIQUE NOT NULL,
        current_owner VARCHAR(42),
        last_owner_update TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // NFT Season Stats
    await client.query(`
      CREATE TABLE nft_season_stats (
        id SERIAL PRIMARY KEY,
        nft_id INT NOT NULL REFERENCES nfts(nft_id) ON DELETE CASCADE,
        season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        total_points INT DEFAULT 0,
        rank INT,
        total_races INT DEFAULT 0,
        wins INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(nft_id, season_id)
      )
    `)

    // Races Table
    await client.query(`
      CREATE TABLE races (
        id SERIAL PRIMARY KEY,
        season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        week_number INT NOT NULL,
        race_date TIMESTAMP NOT NULL,
        boost_time_1 INT,
        boost_time_2 INT,
        wind_time INT,
        wind_affected_nfts INT[] DEFAULT ARRAY[]::INT[],
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(season_id, week_number)
      )
    `)

    // Race Results (NFT + Owner snapshot)
    await client.query(`
      CREATE TABLE race_results (
        id SERIAL PRIMARY KEY,
        race_id INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
        nft_id INT NOT NULL REFERENCES nfts(nft_id),
        wallet_address VARCHAR(42) NOT NULL,
        position INT NOT NULL,
        points_earned INT NOT NULL,
        finish_time INT,
        boost_pressed_count INT DEFAULT 0,
        was_wind_affected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Leaderboard Cache
    await client.query(`
      CREATE TABLE leaderboard (
        id SERIAL PRIMARY KEY,
        season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        nft_id INT NOT NULL REFERENCES nfts(nft_id),
        current_owner VARCHAR(42),
        total_points INT DEFAULT 0,
        total_races INT DEFAULT 0,
        wins INT DEFAULT 0,
        rank INT,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(season_id, nft_id)
      )
    `)

    // Prize Claims
    await client.query(`
      CREATE TABLE prize_claims (
        id SERIAL PRIMARY KEY,
        season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        nft_id INT NOT NULL REFERENCES nfts(nft_id),
        position INT NOT NULL,
        winner_wallet VARCHAR(42) NOT NULL,
        prize_amount INT NOT NULL,
        tx_hash VARCHAR(256),
        claimed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(season_id, nft_id)
      )
    `)

    // Player Sessions
    await client.query(`
      CREATE TABLE player_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address VARCHAR(42) NOT NULL,
        nft_id INT NOT NULL REFERENCES nfts(nft_id),
        session_token VARCHAR(256) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_address, nft_id)
      )
    `)

    // Race Actions
    await client.query(`
      CREATE TABLE race_actions (
        id SERIAL PRIMARY KEY,
        race_id INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
        nft_id INT NOT NULL REFERENCES nfts(nft_id),
        action_type VARCHAR(50),
        timestamp_ms INT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Indexes
    await client.query(`CREATE INDEX idx_nft_season_stats_season ON nft_season_stats(season_id)`)
    await client.query(`CREATE INDEX idx_nft_season_stats_nft ON nft_season_stats(nft_id)`)
    await client.query(`CREATE INDEX idx_races_season ON races(season_id)`)
    await client.query(`CREATE INDEX idx_race_results_race ON race_results(race_id)`)
    await client.query(`CREATE INDEX idx_race_results_nft ON race_results(nft_id)`)
    await client.query(`CREATE INDEX idx_leaderboard_season ON leaderboard(season_id)`)
    await client.query(`CREATE INDEX idx_leaderboard_rank ON leaderboard(rank)`)
    await client.query(`CREATE INDEX idx_prize_claims_season ON prize_claims(season_id)`)
    await client.query(`CREATE INDEX idx_player_sessions_wallet ON player_sessions(wallet_address)`)
    await client.query(`CREATE INDEX idx_race_actions_race ON race_actions(race_id)`)

    await client.query('COMMIT')
    console.log('✅ Database migrations completed')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration error:', error)
    throw error
  } finally {
    client.release()
  }
}

export default initDatabase
