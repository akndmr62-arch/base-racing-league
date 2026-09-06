-- Seasons Table
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    season_number INT UNIQUE NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_races INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Season Participants
CREATE TABLE season_participants (
    id SERIAL PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    nft_id INT NOT NULL,
    points INT DEFAULT 0,
    rank INT DEFAULT 0,
    total_races INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(season_id, nft_id)
);

-- Races Table
CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    race_date TIMESTAMP NOT NULL,
    boost_time_1 INT,
    boost_time_2 INT,
    wind_time INT,
    wind_affected_count INT DEFAULT 5,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(season_id, week_number)
);

-- Race Results
CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    nft_id INT NOT NULL,
    position INT NOT NULL,
    points_earned INT NOT NULL,
    finish_time INT,
    boost_pressed_count INT DEFAULT 0,
    was_wind_affected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard (Cache)
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    nft_id INT NOT NULL,
    total_points INT DEFAULT 0,
    total_races INT DEFAULT 0,
    wins INT DEFAULT 0,
    rank INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(season_id, wallet_address)
);

-- Player Sessions
CREATE TABLE player_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) NOT NULL,
    nft_id INT NOT NULL,
    session_token VARCHAR(256) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(wallet_address)
);

-- Race Actions
CREATE TABLE race_actions (
    id SERIAL PRIMARY KEY,
    race_id INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    action_type VARCHAR(50),
    timestamp_ms INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Prize Claims
CREATE TABLE prize_claims (
    id SERIAL PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    position INT NOT NULL,
    prize_amount INT NOT NULL,
    tx_hash VARCHAR(256),
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(season_id, wallet_address)
);

-- Indexes for performance
CREATE INDEX idx_season_participants_season ON season_participants(season_id);
CREATE INDEX idx_season_participants_wallet ON season_participants(wallet_address);
CREATE INDEX idx_races_season ON races(season_id);
CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_wallet ON race_results(wallet_address);
CREATE INDEX idx_leaderboard_season ON leaderboard(season_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_prize_claims_season ON prize_claims(season_id);
CREATE INDEX idx_player_sessions_wallet ON player_sessions(wallet_address);
