import { useState, useEffect } from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { baseMainnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { MainPage } from './pages/MainPage'

const { chains, publicClient } = configureChains(
  [baseMainnet],
  [publicProvider()],
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})

function App() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <MainPage />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App
