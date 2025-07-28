"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Server, AlertTriangle, RefreshCw } from "lucide-react"

export function ApiStatusIndicator() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline" | "mock" | "error">("checking")
  const [useMockApi, setUseMockApi] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    checkApiStatus()
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkApiStatus = async () => {
    const mockEnabled = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
    setUseMockApi(mockEnabled)
    setLastChecked(new Date())

    if (mockEnabled) {
      setApiStatus("mock")
      return
    }

    try {
      // Test with a simple request to detect Cloudflare errors
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response contains Cloudflare error
      const responseText = await response.text()

      if (
        responseText.includes("Cloudflare Tunnel error") ||
        responseText.includes("Error 1033") ||
        response.status === 530
      ) {
        console.log("🔴 API is down (Cloudflare Tunnel error), mock API will be used as fallback")
        setApiStatus("error")
      } else if (response.status >= 200 && response.status < 600) {
        // Any HTTP response (even errors) means API is reachable
        setApiStatus("online")
      } else {
        setApiStatus("offline")
      }
    } catch (error: any) {
      console.log("🔴 API connection failed:", error.message)
      if (error.name === "AbortError") {
        setApiStatus("offline")
      } else {
        setApiStatus("error")
      }
    }
  }

  const getStatusConfig = () => {
    switch (apiStatus) {
      case "online":
        return {
          icon: <Wifi size={12} />,
          text: "API Online",
          variant: "secondary" as const,
          color: "text-green-400 bg-green-500/10 border-green-500/20",
        }
      case "offline":
        return {
          icon: <WifiOff size={12} />,
          text: "API Offline (Mock Active)",
          variant: "secondary" as const,
          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        }
      case "error":
        return {
          icon: <AlertTriangle size={12} />,
          text: "API Error (Mock Active)",
          variant: "secondary" as const,
          color: "text-red-400 bg-red-500/10 border-red-500/20",
        }
      case "mock":
        return {
          icon: <Server size={12} />,
          text: "Mock API Active",
          variant: "secondary" as const,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        }
      default:
        return {
          icon: <RefreshCw size={12} className="animate-spin" />,
          text: "Checking...",
          variant: "secondary" as const,
          color: "text-gray-400 bg-gray-500/10 border-gray-500/20",
        }
    }
  }

  const config = getStatusConfig()

  const handleClick = () => {
    setApiStatus("checking")
    checkApiStatus()
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        variant={config.variant}
        className={`${config.color} backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={handleClick}
        title={`Click to refresh • Last checked: ${lastChecked?.toLocaleTimeString() || "Never"}`}
      >
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="text-xs">{config.text}</span>
        </div>
      </Badge>

      {/* Additional info for errors */}
      {apiStatus === "error" && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-black/90 backdrop-blur-sm rounded-lg border border-red-500/20 text-xs text-red-300 w-64">
          <p className="font-medium mb-1">🔴 Cloudflare Tunnel Error</p>
          <p className="text-red-400/80">
            The external API (techtest.youapp.ai) is currently experiencing issues. The app is now using mock API for
            full functionality.
          </p>
        </div>
      )}
    </div>
  )
}
