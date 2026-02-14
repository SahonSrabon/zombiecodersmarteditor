"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Server, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Globe, Zap, Database } from "lucide-react"

interface MCPProvider {
  id: string
  name: string
  type: "local" | "cloud" | "hybrid"
  status: "connected" | "disconnected" | "error" | "connecting"
  latency: number
  capabilities: string[]
  modelPath?: string
  apiEndpoint?: string
  description: string
}

interface MCPManagerProps {
  onProviderChange?: (providerId: string | null) => void
  onStatusUpdate?: (message: string) => void
}

export function MCPManager({ onProviderChange, onStatusUpdate }: MCPManagerProps) {
  const [providers, setProviders] = useState<MCPProvider[]>([])
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [autoFallback, setAutoFallback] = useState(true)

  // Initialize providers
  useEffect(() => {
    const initialProviders: MCPProvider[] = [
      {
        id: "zombiecoder-local",
        name: "ZombieCoder Local",
        type: "local",
        status: "disconnected",
        latency: 0,
        capabilities: ["code-generation", "bengali-support", "voice-commands"],
        modelPath: "localhost:5000",
        description: "Local ZombieCoder AI server",
      },
      {
        id: "ollama",
        name: "Ollama",
        type: "local",
        status: "disconnected",
        latency: 0,
        capabilities: ["code-generation", "chat", "completion"],
        modelPath: "localhost:11434",
        description: "Local Ollama server",
      },
      {
        id: "lm-studio",
        name: "LM Studio",
        type: "local",
        status: "disconnected",
        latency: 0,
        capabilities: ["code-generation", "chat"],
        modelPath: "localhost:1234",
        description: "LM Studio local server",
      },
      {
        id: "openai-fallback",
        name: "OpenAI Fallback",
        type: "cloud",
        status: "disconnected",
        latency: 0,
        capabilities: ["code-generation", "chat", "completion"],
        apiEndpoint: "https://api.openai.com/v1",
        description: "Cloud fallback option",
      },
    ]

    setProviders(initialProviders)
    scanProviders(initialProviders)
  }, [])

  // Scan for available providers
  const scanProviders = useCallback(
    async (providerList?: MCPProvider[]) => {
      const providersToScan = providerList || providers
      setIsScanning(true)
      onStatusUpdate?.("🔍 Scanning for MCP providers...")

      // Simulate provider scanning
      for (const provider of providersToScan) {
        setProviders((prev) => prev.map((p) => (p.id === provider.id ? { ...p, status: "connecting" as const } : p)))

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate connection results
        const isConnected = Math.random() > 0.6 // 40% success rate for demo
        const latency = isConnected ? Math.floor(Math.random() * 200) + 50 : 0

        setProviders((prev) =>
          prev.map((p) =>
            p.id === provider.id
              ? {
                  ...p,
                  status: isConnected ? "connected" : "disconnected",
                  latency,
                }
              : p,
          ),
        )

        if (isConnected && !activeProvider) {
          setActiveProvider(provider.id)
          onProviderChange?.(provider.id)
          onStatusUpdate?.(`✅ Connected to ${provider.name}`)
        }
      }

      setIsScanning(false)

      const connectedCount = providersToScan.filter(
        (p) => providers.find((pr) => pr.id === p.id)?.status === "connected",
      ).length

      onStatusUpdate?.(`🔍 Scan complete: ${connectedCount}/${providersToScan.length} providers available`)
    },
    [providers, activeProvider, onProviderChange, onStatusUpdate],
  )

  // Connect to a specific provider
  const connectToProvider = useCallback(
    async (providerId: string) => {
      const provider = providers.find((p) => p.id === providerId)
      if (!provider) return

      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "connecting" } : p)))

      onStatusUpdate?.(`🔗 Connecting to ${provider.name}...`)

      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = Math.random() > 0.3 // 70% success rate
      const newStatus = success ? "connected" : "error"
      const latency = success ? Math.floor(Math.random() * 200) + 50 : 0

      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: newStatus, latency } : p)))

      if (success) {
        setActiveProvider(providerId)
        onProviderChange?.(providerId)
        onStatusUpdate?.(`✅ Connected to ${provider.name} (${latency}ms)`)
      } else {
        onStatusUpdate?.(`❌ Failed to connect to ${provider.name}`)

        // Auto fallback if enabled
        if (autoFallback) {
          const fallbackProvider = providers.find((p) => p.id !== providerId && p.status === "connected")
          if (fallbackProvider) {
            setActiveProvider(fallbackProvider.id)
            onProviderChange?.(fallbackProvider.id)
            onStatusUpdate?.(`🔄 Switched to fallback: ${fallbackProvider.name}`)
          }
        }
      }
    },
    [providers, autoFallback, onProviderChange, onStatusUpdate],
  )

  // Disconnect from provider
  const disconnectProvider = useCallback(
    (providerId: string) => {
      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "disconnected", latency: 0 } : p)))

      if (activeProvider === providerId) {
        setActiveProvider(null)
        onProviderChange?.(null)
        onStatusUpdate?.("❌ Disconnected from MCP provider")
      }
    },
    [activeProvider, onProviderChange, onStatusUpdate],
  )

  const getStatusIcon = (status: MCPProvider["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: MCPProvider["type"]) => {
    switch (type) {
      case "local":
        return <Server className="h-4 w-4 text-blue-400" />
      case "cloud":
        return <Globe className="h-4 w-4 text-purple-400" />
      case "hybrid":
        return <Database className="h-4 w-4 text-green-400" />
      default:
        return <Server className="h-4 w-4 text-gray-400" />
    }
  }

  const connectedProviders = providers.filter((p) => p.status === "connected")
  const activeProviderData = providers.find((p) => p.id === activeProvider)

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Wifi className="h-4 w-4" />
            MCP Manager ({connectedProviders.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => scanProviders()}
            disabled={isScanning}
            className="h-7 bg-blue-600 hover:bg-blue-700"
          >
            {isScanning ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Fallback Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-300">Auto Fallback:</Label>
          <Switch
            checked={autoFallback}
            onCheckedChange={setAutoFallback}
          />
        </div>

        {/* Active Provider */}
        {activeProviderData && (
          <Alert className="bg-green-900/20 border-green-700">
            <Zap className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Active:</strong> {activeProviderData.name} ({activeProviderData.latency}ms)
            </AlertDescription>
          </Alert>
        )}

        {/* Providers List */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Available Providers:</Label>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`border rounded p-3 space-y-2 ${
                    activeProvider === provider.id
                      ? "border-green-600 bg-green-900/10"
                      : "border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(provider.type)}
                      <span className="text-sm font-medium text-white">
                        {provider.name}
                      </span>
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        {provider.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      {provider.status === "connected" && (
                        <Badge variant="secondary" className="text-xs">
                          {provider.latency}ms
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {provider.description}
                  </div>

                  <div className="text-xs text-gray-400">
                    {provider.modelPath || provider.apiEndpoint}
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {provider.capabilities.map((capability) => (
                      <Badge
                        key={capability}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {provider.status === "connected" ? (
                      <>
                        {activeProvider !== provider.id && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveProvider(provider.id)
                              onProviderChange?.(provider.id)
                            }}
                            className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disconnectProvider(provider.id)}
                          className="h-6 text-xs border-slate-600"
                        >
                          <WifiOff className="h-3 w-3 mr-1" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => connectToProvider(provider.id)}
                        disabled={provider.status === "connecting"}
                        className="h-6 text-xs bg-green-600 hover:bg-green-700"
                      >
                        {provider.status === "connecting" ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Wifi className="h-3 w-3 mr-1" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${
          connectedProviders.length > 0 
            ? "bg-green-900/20 border-green-700" 
            : "bg-red-900/20 border-red-700"
        }`}>
          <Server className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {connectedProviders.length > 0 ? (
              <>
                <strong>MCP Active:</strong> {connectedProviders.length} provider(s) connected
                {autoFallback && " • Auto-fallback enabled"}
              </>
            ) : (\
              <strong>No MCP Providers:</strong> Click scan to find available providers
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
  </Card>
  )
}

export default MCPManager
