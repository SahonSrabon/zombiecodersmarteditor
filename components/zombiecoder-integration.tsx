"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Server, MessageSquare, Brain, CheckCircle, XCircle, RefreshCw, Activity } from "lucide-react"

interface ZombieCoderAgent {
  id: string
  name: string
  bengaliName: string
  description: string
  bengaliDescription: string
  status: "active" | "inactive" | "busy"
  capabilities: string[]
  endpoint: string
  lastUsed: Date
}

interface ZombieCoderConnection {
  serverUrl: string
  apiKey: string
  status: "connected" | "disconnected" | "connecting" | "error"
  latency: number
  version: string
  agents: ZombieCoderAgent[]
}

interface ZombieCoderIntegrationProps {
  onConnectionChange: (connected: boolean) => void
  onAgentResponse: (response: string) => void
  onStatusUpdate: (message: string) => void
}

export function ZombieCoderIntegration({
  onConnectionChange,
  onAgentResponse,
  onStatusUpdate,
}: ZombieCoderIntegrationProps) {
  const [connection, setConnection] = useState<ZombieCoderConnection>({
    serverUrl: "http://localhost:5000",
    apiKey: "",
    status: "disconnected",
    latency: 0,
    version: "",
    agents: [],
  })

  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string
      type: "user" | "agent"
      message: string
      bengaliMessage?: string
      timestamp: Date
      agent?: string
    }>
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(true)

  // Initialize ZombieCoder agents based on your dashboard
  const initializeAgents = useCallback(() => {
    const agents: ZombieCoderAgent[] = [
      {
        id: "procoder",
        name: "Procoder",
        bengaliName: "প্রোকোডার",
        description: "Professional coding assistant",
        bengaliDescription: "পেশাদার কোডিং সহায়ক",
        status: "active",
        capabilities: ["coding", "debugging", "optimization", "bengali-support"],
        endpoint: "/api/agents/procoder",
        lastUsed: new Date(),
      },
      {
        id: "instruct",
        name: "Instruct",
        bengaliName: "নির্দেশক",
        description: "Instruction and guidance provider",
        bengaliDescription: "নির্দেশনা ও গাইডেন্স প্রদানকারী",
        status: "active",
        capabilities: ["instruction", "guidance", "tutorial", "bengali-support"],
        endpoint: "/api/agents/instruct",
        lastUsed: new Date(),
      },
      {
        id: "creative-writer",
        name: "Creative Writer",
        bengaliName: "সৃজনশীল লেখক",
        description: "Creative content and documentation writer",
        bengaliDescription: "সৃজনশীল কন্টেন্ট ও ডকুমেন্টেশন লেখক",
        status: "active",
        capabilities: ["writing", "documentation", "creativity", "bengali-support"],
        endpoint: "/api/agents/creative-writer",
        lastUsed: new Date(),
      },
      {
        id: "business-agent",
        name: "Business Agent",
        bengaliName: "ব্যবসায়িক এজেন্ট",
        description: "Business strategy and planning assistant",
        bengaliDescription: "ব্যবসায়িক কৌশল ও পরিকল্পনা সহায়ক",
        status: "active",
        capabilities: ["business", "strategy", "planning", "bengali-support"],
        endpoint: "/api/agents/business",
        lastUsed: new Date(),
      },
      {
        id: "db-analyzer",
        name: "DB Analyzer",
        bengaliName: "ডেটাবেস বিশ্লেষক",
        description: "Database analysis and optimization",
        bengaliDescription: "ডেটাবেস বিশ্লেষণ ও অপটিমাইজেশন",
        status: "active",
        capabilities: ["database", "analysis", "sql", "bengali-support"],
        endpoint: "/api/agents/db-analyzer",
        lastUsed: new Date(),
      },
      {
        id: "translation-agent",
        name: "Translation Agent",
        bengaliName: "অনুবাদ এজেন্ট",
        description: "Bengali-English translation specialist",
        bengaliDescription: "বাংলা-ইংরেজি অনুবাদ বিশেষজ্ঞ",
        status: "active",
        capabilities: ["translation", "bengali", "english", "localization"],
        endpoint: "/api/agents/translation",
        lastUsed: new Date(),
      },
    ]

    setConnection((prev) => ({ ...prev, agents }))
    if (agents.length > 0) {
      setSelectedAgent(agents[0].id)
    }
  }, [])

  // Test connection to ZombieCoder server
  const testConnection = useCallback(async () => {
    setConnection((prev) => ({ ...prev, status: "connecting" }))
    onStatusUpdate("🔍 Connecting to ZombieCoder AI...")

    try {
      const startTime = Date.now()

      // Test connection to your ZombieCoder server
      const response = await fetch(`${connection.serverUrl}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: connection.apiKey ? `Bearer ${connection.apiKey}` : "",
        },
      })

      const latency = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()

        setConnection((prev) => ({
          ...prev,
          status: "connected",
          latency,
          version: data.version || "1.0.0",
        }))

        onConnectionChange(true)
        onStatusUpdate(`✅ Connected to ZombieCoder AI (${latency}ms)`)

        // Initialize agents after successful connection
        initializeAgents()
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      setConnection((prev) => ({ ...prev, status: "error", latency: 0 }))
      onConnectionChange(false)
      onStatusUpdate(`❌ Connection failed: ${error}`)
    }
  }, [connection.serverUrl, connection.apiKey, onConnectionChange, onStatusUpdate, initializeAgents])

  // Send message to ZombieCoder agent
  const sendMessage = useCallback(async () => {
    if (!chatMessage.trim() || !selectedAgent || connection.status !== "connected") {
      return
    }

    const agent = connection.agents.find((a) => a.id === selectedAgent)
    if (!agent) return

    setIsProcessing(true)

    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      type: "user" as const,
      message: chatMessage,
      timestamp: new Date(),
    }
    setChatHistory((prev) => [...prev, userMessage])

    try {
      onStatusUpdate(`🤖 ${agent.bengaliName} processing your request...`)

      // Send request to ZombieCoder agent
      const response = await fetch(`${connection.serverUrl}${agent.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: connection.apiKey ? `Bearer ${connection.apiKey}` : "",
        },
        body: JSON.stringify({
          message: chatMessage,
          bengali: autoTranslate,
          privacy: privacyMode,
          context: {
            editor: "bengali-privacy-editor",
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Add agent response to chat
        const agentMessage = {
          id: `agent-${Date.now()}`,
          type: "agent" as const,
          message: data.response || data.message,
          bengaliMessage: data.bengaliResponse,
          timestamp: new Date(),
          agent: agent.name,
        }
        setChatHistory((prev) => [...prev, agentMessage])

        onAgentResponse(data.response || data.message)
        onStatusUpdate(`✅ Response received from ${agent.bengaliName}`)
      } else {
        throw new Error(`Agent request failed: ${response.status}`)
      }
    } catch (error) {
      onStatusUpdate(`❌ Agent request failed: ${error}`)

      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: "agent" as const,
        message: `Error: Could not process your request. ${error}`,
        bengaliMessage: `ত্রুটি: আপনার অনুরোধ প্রক্রিয়া করা যায়নি। ${error}`,
        timestamp: new Date(),
        agent: "System",
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
      setChatMessage("")
    }
  }, [chatMessage, selectedAgent, connection, autoTranslate, privacyMode, onAgentResponse, onStatusUpdate])

  // Auto-connect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      testConnection()
    }, 1000)
    return () => clearTimeout(timer)
  }, [testConnection])

  const getStatusIcon = (status: ZombieCoderConnection["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getAgentStatusColor = (status: ZombieCoderAgent["status"]) => {
    switch (status) {
      case "active":
        return "border-green-600 text-green-300"
      case "busy":
        return "border-yellow-600 text-yellow-300"
      default:
        return "border-gray-600 text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      {/* Connection Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Zap className="h-4 w-4" />
              ZombieCoder AI Integration
              {connection.status === "connected" && (
                <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                  Connected
                </Badge>
              )}
            </CardTitle>
            <Button
              size="sm"
              onClick={testConnection}
              disabled={connection.status === "connecting"}
              className="h-7 bg-blue-600 hover:bg-blue-700"
            >
              {connection.status === "connecting" ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(connection.status)}
              <div>
                <div className="text-sm font-medium text-white">
                  {connection.status === "connected" && "Connected to ZombieCoder AI"}
                  {connection.status === "connecting" && "Connecting..."}
                  {connection.status === "error" && "Connection Failed"}
                  {connection.status === "disconnected" && "Disconnected"}
                </div>
                <div className="text-xs text-gray-400">
                  {connection.status === "connected" &&
                    `Latency: ${connection.latency}ms • Version: ${connection.version}`}
                  {connection.status !== "connected" && connection.serverUrl}
                </div>
              </div>
            </div>

            {connection.status === "connected" && (
              <Badge variant="secondary" className="text-xs">
                {connection.agents.length} Agents
              </Badge>
            )}
          </div>

          {/* Connection Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Server URL:</Label>
              <Input
                value={connection.serverUrl}
                onChange={(e) => setConnection((prev) => ({ ...prev, serverUrl: e.target.value }))}
                placeholder="http://localhost:5000"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">API Key (Optional):</Label>
              <Input
                type="password"
                value={connection.apiKey}
                onChange={(e) => setConnection((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Your API key..."
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          {/* Integration Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Auto Translate:</Label>
              <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Privacy Mode:</Label>
              <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Selection & Chat */}
      {connection.status === "connected" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Brain className="h-4 w-4" />
              ZombieCoder AI Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agent Selection */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Select Agent:</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connection.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <span>{agent.bengaliName}</span>
                        <Badge variant="outline" className={`text-xs ${getAgentStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chat History */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Chat History:</Label>
              <ScrollArea className="h-64 border border-slate-600 rounded-lg p-3 bg-slate-900">
                <div className="space-y-3">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          chat.type === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-100"
                        }`}
                      >
                        <div className="text-sm">{chat.message}</div>
                        {chat.bengaliMessage && <div className="text-xs text-blue-200 mt-1">{chat.bengaliMessage}</div>}
                        <div className="text-xs opacity-70 mt-1">
                          {chat.type === "agent" && chat.agent && `${chat.agent} • `}
                          {chat.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatHistory.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <div className="text-sm text-gray-400">No messages yet</div>
                      <div className="text-xs text-gray-500 mt-1">Start chatting with ZombieCoder AI</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="আপনার প্রশ্ন বা অনুরোধ লিখুন... (Type your question or request...)"
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!chatMessage.trim() || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {selectedAgent && (
                <div className="text-xs text-gray-400">
                  Chatting with: {connection.agents.find((a) => a.id === selectedAgent)?.bengaliName}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Agents */}
      {connection.status === "connected" && connection.agents.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Server className="h-4 w-4" />
              Available Agents ({connection.agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {connection.agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAgent === agent.id
                      ? "border-blue-600 bg-blue-900/20"
                      : "border-slate-600 bg-slate-700/50 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">{agent.bengaliName}</div>
                    <Badge variant="outline" className={`text-xs ${getAgentStatusColor(agent.status)}`}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{agent.bengaliDescription}</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs border-slate-600 text-gray-400">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-gray-400">
                        +{agent.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Alert */}
      <Alert
        className={`${
          connection.status === "connected" ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
        }`}
      >
        <Activity className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {connection.status === "connected" ? (
            <>
              <strong>ZombieCoder AI Connected:</strong> {connection.agents.length} agents available
              <br />
              <strong>Features:</strong> Bengali support, privacy mode, real-time chat
              {privacyMode && (
                <>
                  <br />
                  <strong>Privacy:</strong> All data stays local, no external transmission
                </>
              )}
            </>
          ) : (
            <>
              <strong>ZombieCoder AI Disconnected:</strong> Configure connection settings above
              <br />
              <strong>Default URL:</strong> http://localhost:5000 (your ZombieCoder server)
            </>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default ZombieCoderIntegration
