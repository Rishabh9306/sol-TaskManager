"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface WalletConnectProps {
  isConnected: boolean
  account: string | null
  connectWallet: () => Promise<void>
}

export function WalletConnect({ isConnected, account, connectWallet }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="flex items-center">
      {isConnected && account ? (
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="font-medium">{formatAddress(account)}</span>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
    </div>
  )
}

