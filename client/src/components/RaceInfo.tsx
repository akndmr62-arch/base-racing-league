interface RaceInfoProps {
  season: number
  week: number
}

export function RaceInfo({ season, week }: RaceInfoProps) {
  const weeksRemaining = 18 - week
  
  return (
    <div className="bg-slate-700/50 rounded-lg p-6 mb-6 border border-slate-600">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">Season</p>
          <p className="text-2xl font-bold text-blue-400">{season}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Week</p>
          <p className="text-2xl font-bold text-purple-400">{week}/18</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Prize Pool</p>
          <p className="text-2xl font-bold text-yellow-400">1,000 USDC</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-200">
          🏆 <strong>{weeksRemaining} weeks</strong> remaining in season
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm text-slate-300">
          <strong>Prize Distribution:</strong>
        </p>
        <ul className="text-xs text-slate-400 space-y-1 ml-4">
          <li>🥇 1st: 400 USDC</li>
          <li>🥈 2nd: 250 USDC</li>
          <li>🥉 3rd: 150 USDC</li>
          <li>4️⃣ 4th: 100 USDC</li>
          <li>5️⃣ 5th: 100 USDC</li>
        </ul>
      </div>
    </div>
  )
}
