import redis from 'redis'
import { config } from './config.js'

const client = redis.createClient({
  url: config.REDIS_URL,
})

client.on('error', (err) => console.error('Redis Client Error', err))

await client.connect()

export const redisGet = (key) => client.get(key)
export const redisSet = (key, value, options) => client.set(key, value, options)
export const redisDel = (key) => client.del(key)
export const redisExpire = (key, seconds) => client.expire(key, seconds)

export default client
