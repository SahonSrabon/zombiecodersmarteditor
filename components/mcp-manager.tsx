"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Server, Wifi, WifiOff, CheckCircle, XCircle, RefreshCw, Globe, Clock, Activity } from "lucide-react"

interface MCPProvider {
  id: string
  name: string
  type: "local" | "remote" | "cloud"
  endpoint: string
  status: "connected" | "disconnected" | "connecting" | "error"
  capabilities: string[]
  latency: number
  lastPing: Date
  version: string
  priority: number
  fallbackOrder: number
}

interface MCPManagerProps {
  onProviderChange: (provider: MCPProvider | null) => void
  onStatusUpdate: (message: string) => void
}

export function MCPManager({ onProviderChange, onStatusUpdate }: MCPManagerProps) {
  const [providers, setProviders] = useState<MCPProvider[]>([
    {
      id: "zombiecoder-local",
      name: "ZombieCoder Local",
      type: "local",
      endpoint: "http://localhost:8080/mcp",
      status: "disconnected",
      capabilities: ["code-analysis", "bengali-processing", "voice-commands", "file-indexing"],
      latency: 0,
      lastPing: new Date(),
      version: "1.0.0",
      priority: 1,
      fallbackOrder: 1,
    },
    {
      id: "ollama-local",
      name: "Ollama Local",
      type: "local",
      endpoint: "http://localhost:11434/api",
      status: "disconnected",
      capabilities: ["text-generation", "code-completion", "translation"],
      latency: 0,
      lastPing: new Date(),
      version: "0.1.0",
      priority: 2,
      fallbackOrder: 2,
    },
    {
      id: "lmstudio-local",
      name: "LM Studio",
      type: "local",
      endpoint: "http://localhost:1234/v1",
      status: "disconnected",
      capabilities: ["text-generation", "code-completion"],
      latency: 0,
      lastPing: new Date(),
      version: "0.2.0",
      priority: 3,
      fallbackOrder: 3,
    },
    {
      id: "openai-cloud",
      name: "OpenAI GPT",
      type: "cloud",
      endpoint: "https://api.openai.com/v1",
      status: "disconnected",
      capabilities: ["text-generation", "code-completion", "translation", "analysis"],
      latency: 0,
      lastPing: new Date(),
      version: "4.0",
      priority: 4,
      fallbackOrder: 4,
    },
  ])

  const [activeProvider, setActiveProvider] = useState<MCPProvider | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [autoFallback, setAutoFallback] = useState(true)
  const [connectionTimeout, setConnectionTimeout] = useState(5000)
  const [retryAttempts, setRetryAttempts] = useState(3)

  // Test connection to a provider
  const testConnection = useCallback(
    async (provider: MCPProvider): Promise<boolean> => {
      const startTime = Date.now()

      try {
        onStatusUpdate(`🔍 Testing connection to ${provider.name}...`)

        // Simulate connection test based on provider type
        if (provider.type === "local") {
          // For local providers, try to fetch from endpoint
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), connectionTimeout)

          try {
            const response = await fetch(provider.endpoint + "/health", {
              method: "GET",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
              },
            })
            clearTimeout(timeoutId)

            if (response.ok) {
              const latency = Date.now() - startTime
              setProviders((prev) =>
                prev.map((p) =>
                  p.id === provider.id ? { ...p, status: "connected", latency, lastPing: new Date() } : p,
                ),
              )
              return true
            }
          } catch (error) {
            clearTimeout(timeoutId)
            // Connection failed
          }
        } else if (provider.type === "cloud") {
          // For cloud providers, simulate API key validation
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Simulate success/failure based on random chance for demo
          const success = Math.random() > 0.3
          if (success) {
            const latency = Date.now() - startTime
            setProviders((prev) =>
              prev.map((p) =>
                p.id === provider.id ? { ...p, status: "connected", latency, lastPing: new Date() } : p,
              ),
            )
            return true
          }
        }

        // Connection failed
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, status: "error", lastPing: new Date() } : p)),
        )
        return false
      } catch (error) {
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, status: "error", lastPing: new Date() } : p)),
        )
        return false
      }
    },
    [connectionTimeout, onStatusUpdate],
  )

  // Scan for available providers
  const scanProviders = useCallback(async () => {
    setIsScanning(true)
    onStatusUpdate("🔍 Scanning for MCP providers...")

    // Reset all provider statuses
    setProviders((prev) => prev.map((p) => ({ ...p, status: "connecting" as const })))

    // Test each provider
    const results = await Promise.allSettled(providers.map((provider) => testConnection(provider)))

    // Find the first successful connection based on priority
    const connectedProviders = providers
      .filter(
        (_, index) =>
          results[index].status === "fulfilled" && (results[index] as PromiseFulfilledResult<boolean>).value,
      )
      .sort((a, b) => a.priority - b.priority)

    if (connectedProviders.length > 0) {
      const bestProvider = connectedProviders[0]
      setActiveProvider(bestProvider)
      onProviderChange(bestProvider)
      onStatusUpdate(`✅ Connected to ${bestProvider.name} (${bestProvider.latency}ms)`)
    } else {
      setActiveProvider(null)
      onProviderChange(null)
      onStatusUpdate("❌ No MCP providers available")
    }

    setIsScanning(false)
  }, [providers, testConnection, onProviderChange, onStatusUpdate])

  // Connect to specific provider
  const connectToProvider = useCallback(
    async (provider: MCPProvider) => {
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? { ...p, status: "connecting" } : p)))

      const success = await testConnection(provider)

      if (success) {
        setActiveProvider(provider)
        onProviderChange(provider)
        onStatusUpdate(`✅ Connected to ${provider.name}`)
      } else {
        onStatusUpdate(`❌ Failed to connect to ${provider.name}`)

        // Try fallback if enabled
        if (autoFallback) {
          const fallbackProviders = providers
            .filter((p) => p.id !== provider.id && p.status === "connected")
            .sort((a, b) => a.fallbackOrder - b.fallbackOrder)

          if (fallbackProviders.length > 0) {
            const fallback = fallbackProviders[0]
            setActiveProvider(fallback)
            onProviderChange(fallback)
            onStatusUpdate(`🔄 Switched to fallback: ${fallback.name}`)
          }
        }
      }
    },
    [testConnection, providers, autoFallback, onProviderChange, onStatusUpdate],
  )

  // Disconnect from provider
  const disconnectProvider = useCallback(
    (providerId: string) => {
      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "disconnected" } : p)))

      if (activeProvider?.id === providerId) {
        setActiveProvider(null)
        onProviderChange(null)
        onStatusUpdate("🔌 Disconnected from MCP provider")
      }
    },
    [activeProvider, onProviderChange, onStatusUpdate],
  )

  // Auto-scan on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scanProviders()
    }, 1000)

    return () => clearTimeout(timer)
  }, [scanProviders])

  // Periodic health checks
  useEffect(() => {
    if (activeProvider) {
      const interval = setInterval(() => {
        testConnection(activeProvider)
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [activeProvider, testConnection])

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
        return <Server className="h-3 w-3 text-blue-400" />
      case "cloud":
        return <Globe className="h-3 w-3 text-purple-400" />
      default:
        return <Wifi className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Server className="h-4 w-4" />
            MCP Manager
            {activeProvider && (
              <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                {activeProvider.name}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={scanProviders} disabled={isScanning} className="h-7 bg-blue-600 hover:bg-blue-700">
            {isScanning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Connection Timeout:</Label>
            <Select
              value={connectionTimeout.toString()}
              onValueChange={(value) => setConnectionTimeout(Number.parseInt(value))}
            >
              <SelectTrigger className="h-8 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3000">3 seconds</SelectItem>
                <SelectItem value="5000">5 seconds</SelectItem>
                <SelectItem value="10000">10 seconds</SelectItem>
                <SelectItem value="15000">15 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Auto Fallback:</Label>
            <div className="flex items-center gap-2">
              <Switch checked={autoFallback} onCheckedChange={setAutoFallback} />
              <span className="text-xs text-gray-400">{autoFallback ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Available Providers:</Label>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`border rounded-lg p-3 space-y-2 ${
                    activeProvider?.id === provider.id
                      ? "border-green-600 bg-green-900/20"
                      : "border-slate-600 bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      {getTypeIcon(provider.type)}
                      <span className="text-sm font-medium text-white">{provider.name}</span>
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        v{provider.version}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {provider.status === "connected" && (
                        <Badge variant="secondary" className="text-xs">
                          {provider.latency}ms
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          provider.priority === 1
                            ? "border-yellow-500 text-yellow-300"
                            : "border-slate-500 text-gray-300"
                        }`}
                      >
                        P{provider.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">{provider.endpoint}</div>

                  <div className="flex flex-wrap gap-1">
                    {provider.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs border-slate-600 text-gray-400">
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Last ping: {provider.lastPing.toLocaleTimeString()}
                    </div>

                    <div className="flex gap-2">
                      {provider.status === "connected" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disconnectProvider(provider.id)}
                          className="h-6 text-xs border-slate-600"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => connectToProvider(provider)}
                          disabled={provider.status === "connecting"}
                          className="h-6 text-xs bg-green-600 hover:bg-green-700"
                        >
                          {provider.status === "connecting" ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${activeProvider ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {activeProvider ? (
              <>
                <strong>Active Provider:</strong> {activeProvider.name} ({activeProvider.latency}ms latency)
                <br />
                <strong>Capabilities:</strong> {activeProvider.capabilities.join(", ")}
              </>
            ) : (
              <span>
                <strong>No Active Provider:</strong> Connect to an MCP provider to enable AI features
              </span>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default MCPManager
