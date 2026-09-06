import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { RaceScene } from '../components/RaceScene'
import { Leaderboard } from '../components/Leaderboard'
import { RaceInfo } from '../components/RaceInfo'
import { useGameStore } from '../store/gameStore'

export function MainPage() {
  const { address, isConnected } = useAccount()
  const [nftId, setNftId] = useState('')
  const [showRace, setShowRace] = useState(false)
  const { currentSeason, currentWeek, isLoading } = useGameStore()

  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet connected:', address)
    }
  }, [isConnected, address])

  const handleJoinRace = () => {
    if (!nftId || isNaN(Number(nftId))) {
      alert('Please enter a valid NFT ID (0-113)')
      return
    }
    const id = Number(nftId)
    if (id < 0 || id > 113) {
      alert('NFT ID must be between 0 and 113')
      return
    }
    setShowRace(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              🏁 Base Racing League
            </h1>
            <p className="text-slate-400 text-sm mt-1">18-Week NFT Racing Championship</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      {showRace && isConnected ? (
        // Race View
        <div className="min-h-screen">
          <RaceScene nftId={nftId} walletAddress={address!} />
        </div>
      ) : (
        // Main View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Join Race */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Join This Week's Race</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin">
                      <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-400 rounded-full mx-auto"></div>
                    </div>
                    <p className="text-slate-400 mt-4">Loading season data...</p>
                  </div>
                ) : (
                  <>
                    <RaceInfo season={currentSeason} week={currentWeek} />
                    
                    {isConnected ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Your NFT ID (0-113)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="113"
                            value={nftId}
                            onChange={(e) => setNftId(e.target.value)}
                            placeholder="Enter your NFT ID"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleJoinRace}
                          disabled={!nftId}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 text-white"
                        >
                          🎯 Join Race Now
                        </button>
                      </div>
                    ) : (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                        <p className="text-blue-300">Connect your wallet to join the race</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
