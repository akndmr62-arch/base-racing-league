import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { io } from 'socket.io-client'

interface RaceSceneProps {
  nftId: string
  walletAddress: string
}

export function RaceScene({ nftId, walletAddress }: RaceSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)
  const [raceTime, setRaceTime] = useState(0)
  const [isBoostAvailable, setIsBoostAvailable] = useState(false)
  const [boostNum, setBoostNum] = useState(0)
  const [windActive, setWindActive] = useState(false)
  const [raceFinished, setRaceFinished] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Socket.io
    socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')

    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      socketRef.current.emit('race:join', { wallet: walletAddress, nftId })
    })

    socketRef.current.on('race:start', () => {
      setRaceTime(0)
      console.log('Race started')
    })

    socketRef.current.on('race:boost-available', (data: any) => {
      setIsBoostAvailable(true)
      setBoostNum(data.boostNum)
    })

    socketRef.current.on('race:wind-event', (data: any) => {
      setWindActive(data.affectedPlayers.includes(walletAddress))
    })

    socketRef.current.on('race:result', (data: any) => {
      setRaceFinished(true)
      setWinner(data.winner)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [walletAddress, nftId])

  // Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.Fog(0x0f172a, 100, 500)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 5, 20)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Track (curved path)
    const trackGeometry = new THREE.BoxGeometry(10, 0.5, 200)
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      metalness: 0.3,
    })
    const track = new THREE.Mesh(trackGeometry, trackMaterial)
    track.castShadow = true
    track.receiveShadow = true
    scene.add(track)

    // NFT Placeholders (boxes for now, will be upgraded)
    const nftBoxes: THREE.Mesh[] = []
    const spacing = 0.8
    const nftsPerRow = 12

    for (let i = 0; i < 114; i++) {
      const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6)
      const color = i === parseInt(nftId) ? 0x3b82f6 : 0x8b5cf6
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.6,
      })
      const box = new THREE.Mesh(geometry, material)

      const row = Math.floor(i / nftsPerRow)
      const col = i % nftsPerRow
      box.position.set(
        (col - nftsPerRow / 2) * spacing,
        row * 1.5,
        -50
      )
      box.castShadow = true
      box.receiveShadow = true

      scene.add(box)
      nftBoxes.push(box)
    }

    // Animation loop
    let animationId: number
    let startTime = Date.now()

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const elapsed = (Date.now() - startTime) / 1000
      setRaceTime(Math.min(elapsed * 1000, 180000))

      // Move NFTs forward
      nftBoxes.forEach((box, idx) => {
        let speed = 0.15
        if (idx === parseInt(nftId)) {
          speed = isBoostAvailable ? 0.25 : 0.15
          if (windActive) speed += 0.1
        }
        box.position.z += speed
      })

      // Rotate NFTs
      nftBoxes.forEach((box) => {
        box.rotation.x += 0.01
        box.rotation.y += 0.01
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [nftId, isBoostAvailable, windActive])

  const handleBoostPress = () => {
    if (socketRef.current && isBoostAvailable) {
      socketRef.current.emit('race:boost-pressed', {
        boostNum,
        pressedAt: raceTime,
      })
      setIsBoostAvailable(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen">
      {/* Race HUD */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-2xl font-bold">🏁 RACE IN PROGRESS</h2>
            <p className="text-slate-300">NFT #{nftId}</p>
          </div>
          <div className="text-right text-white">
            <p className="text-3xl font-mono font-bold">
              {Math.floor(raceTime / 1000)}.{String(Math.floor((raceTime % 1000) / 100)).padStart(1, '0')}s
            </p>
            <p className="text-slate-300">/ 3:00</p>
          </div>
        </div>
      </div>

      {/* Boost Button */}
      {isBoostAvailable && !raceFinished && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleBoostPress}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-2xl rounded-lg shadow-2xl animate-pulse transform hover:scale-110 transition-all duration-100"
          >
            ⚡ BOOST #{boostNum}
          </button>
        </div>
      )}

      {/* Wind Indicator */}
      {windActive && !raceFinished && (
        <div className="absolute top-32 right-6 text-white text-center">
          <div className="text-4xl animate-bounce">💨</div>
          <p className="text-sm font-semibold mt-2">WIND BOOST ACTIVE!</p>
        </div>
      )}

      {/* Race Finished Modal */}
      {raceFinished && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-8 text-center max-w-md">
            <h3 className="text-3xl font-bold text-white mb-4">🏆 Race Finished!</h3>
            {winner === walletAddress ? (
              <>
                <p className="text-2xl text-yellow-400 font-bold mb-4">🎉 YOU WON!</p>
                <p className="text-slate-300">+25 Points</p>
              </>
            ) : (
              <>
                <p className="text-xl text-slate-300 mb-4">Better luck next week!</p>
                <p className="text-slate-300">+15 Points</p>
              </>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
            >
              Back to Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
