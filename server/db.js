import pkg from 'pg'
const { Pool } = pkg
import { config } from './config.js'

const pool = new Pool({
  connectionString: config.DATABASE_URL,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()

export default pool
