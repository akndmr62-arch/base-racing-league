import { useEffect, useState } from 'react'
import axios from 'axios'

interface LeaderboardEntry {
  rank: number
  wallet: string
  nftId: number
  points: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard/current')
        setEntries(response.data.slice(0, 10))
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5000) // Refresh every 5s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 text-white">📊 Live Leaderboard</h3>
      
      {loading ? (
        <div className="text-center py-8 text-slate-400">
          <div className="animate-spin inline-block">⏳</div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.wallet}
              className="flex justify-between items-center p-3 bg-slate-700/30 hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-lg font-bold text-blue-400 w-6 text-center">
                  #{entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-300 truncate">
                    NFT #{entry.nftId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{entry.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
