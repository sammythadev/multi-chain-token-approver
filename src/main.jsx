import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { chains } from './chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'your_walletconnect_project_id', // get from WalletConnect Cloud
        showQrModal: true,
      },
    }),
  ],
  transports: chains.reduce((acc, chain) => {
    acc[chain.id] = http()
    return acc
  }, {}),
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
)

