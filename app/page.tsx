"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Terminal, Code, Brain, Database, Mic, CheckSquare, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import our components
import { FileIndexer } from "@/components/file-indexer"
import { MCPManager } from "@/components/mcp-manager"
import { AgentExecutor } from "@/components/agent-executor"
import { ModelDetector } from "@/components/model-detector"
import { BengaliVoiceSystem } from "@/components/bengali-voice-system"
import { TaskTodoManager } from "@/components/task-todo-manager"
import ZombieCoderIntegration from "@/components/zombiecoder-integration"

export default function ZombieCoderBengaliExtension() {
  // Core Editor State
  const [code, setCode] = useState(`// ZombieCoder Bengali Privacy Editor
// আপনার ZombieCoder AI এর সাথে integrated
// Complete AI-powered development environment

import React from 'react';
import { useState } from 'react';

function BengaliGreeting(name) {
  // আমার সোনার বাংলা - আমি তোমায় ভালবাসি
  console.log("Hello " + name);
  return \`নমস্কার, \${name}! ZombieCoder এ স্বাগতম!\`;
}

// Voice command: "একটা ফাংশন বানাও যা দুইটা সংখ্যা যোগ করে"
function addNumbers(a, b) {
  return a + b;
}

// ZombieCoder AI integration active
// Task: Review this code for Bengali integration
// Todo: Add more Bengali voice commands

export default BengaliGreeting;`)

  // System State
  const [fileIndex, setFileIndex] = useState<any>(null)
  const [activeMCPProvider, setActiveMCPProvider] = useState<string | null>(null)
  const [detectedModels, setDetectedModels] = useState<any[]>([])
  const [voiceCommands, setVoiceCommands] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [todos, setTodos] = useState<any[]>([])
  const [zombieCoderConnected, setZombieCoderConnected] = useState(false)

  // UI State
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "🤖 ZombieCoder Bengali Extension initialized",
    "🔗 ZombieCoder AI integration ready",
    "🔍 File indexing system ready",
    "🌐 MCP providers scanning...",
    "🎙️ Bengali voice system ready",
    "📋 Task & Todo manager active",
    "🔐 Privacy-first mode: All data stays local",
    "📁 Workspace: ~/Desktop/zombiecoder/",
  ])

  // Settings State
  const [settings, setSettings] = useState({
    autoIndex: true,
    mcpFallback: true,
    agentExecution: true,
    voiceInput: true,
    voiceOutput: true,
    taskManagement: true,
    privacyMode: true,
    bengaliSupport: true,
    localModelsOnly: false,
    strictMode: false,
    zombieCoderIntegration: true,
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Utility Functions
  const addToConsole = useCallback((message: string) => {
    setConsoleOutput((prev) => [...prev.slice(-25), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Event Handlers
  const handleFileIndexComplete = useCallback(
    (index: any) => {
      setFileIndex(index)
      addToConsole(`📊 File indexed: ${index.metadata?.totalLines || 0} lines, ${index.symbols?.length || 0} symbols`)
    },
    [addToConsole],
  )

  const handleProviderChange = useCallback(
    (providerId: string | null) => {
      setActiveMCPProvider(providerId)
      if (providerId) {
        addToConsole(`🎯 MCP Provider activated: ${providerId}`)
      } else {
        addToConsole("❌ No MCP provider available")
      }
    },
    [addToConsole],
  )

  const handleModelsDetected = useCallback(
    (models: any[]) => {
      setDetectedModels(models)
      const availableCount = models.filter((m) => m.status === "available").length
      addToConsole(`📦 Models detected: ${availableCount}/${models.length} available`)
    },
    [addToConsole],
  )

  const handleVoiceCommand = useCallback(
    (command: any) => {
      setVoiceCommands((prev) => [command, ...prev.slice(0, 19)])
      addToConsole(`🎙️ Voice: ${command.bengaliText || command.bengali} (${command.confidence}%)`)
    },
    [addToConsole],
  )

  const handleCodeGenerated = useCallback(
    (generatedCode: string) => {
      setCode((prev) => prev + "\n\n" + generatedCode)
      addToConsole("💻 Code generated from voice command")
    },
    [addToConsole],
  )

  const handleTaskCreated = useCallback(
    (task: any) => {
      setTasks((prev) => [task, ...prev])
      addToConsole(`📋 Task created: ${task.title}`)
    },
    [addToConsole],
  )

  const handleTodoCreated = useCallback(
    (todo: any) => {
      setTodos((prev) => [todo, ...prev])
      addToConsole(`✅ Todo added: ${todo.text}`)
    },
    [addToConsole],
  )

  const handleZombieCoderConnection = useCallback(
    (connected: boolean) => {
      setZombieCoderConnected(connected)
      addToConsole(connected ? "🔗 ZombieCoder AI connected" : "❌ ZombieCoder AI disconnected")
    },
    [addToConsole],
  )

  const handleZombieCoderResponse = useCallback(
    (response: string) => {
      addToConsole(`🤖 ZombieCoder AI: ${response.slice(0, 50)}...`)
    },
    [addToConsole],
  )

  // Statistics
  const stats = {
    totalLines: fileIndex?.metadata?.totalLines || 0,
    bengaliLines: fileIndex?.metadata?.bengaliLines || 0,
    symbols: fileIndex?.symbols?.length || 0,
    voiceCommands: voiceCommands.length,
    tasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    todos: todos.length,
    completedTodos: todos.filter((t) => t.completed).length,
    modelsAvailable: detectedModels.filter((m) => m.status === "available").length,
    zombieCoderStatus: zombieCoderConnected ? "Connected" : "Disconnected",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ZombieCoder Bengali Privacy Editor</h1>
                <p className="text-sm text-gray-300">
                  🇧🇩 Integrated with ZombieCoder AI • Voice • Tasks • Privacy-First
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-900 text-green-100">
                <Zap className="h-3 w-3 mr-1" />
                {stats.zombieCoderStatus}
              </Badge>
              <Badge variant="secondary" className="bg-blue-900 text-blue-100">
                <Database className="h-3 w-3 mr-1" />
                {stats.modelsAvailable} Models
              </Badge>
              <Badge variant="secondary" className="bg-purple-900 text-purple-100">
                <Mic className="h-3 w-3 mr-1" />
                Voice Ready
              </Badge>
              <Badge variant="secondary" className="bg-orange-900 text-orange-100">
                <CheckSquare className="h-3 w-3 mr-1" />
                {stats.tasks} Tasks
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.totalLines}</div>
              <div className="text-xs text-gray-400">Code Lines</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-300">{stats.voiceCommands}</div>
              <div className="text-xs text-gray-400">Voice Commands</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.completedTasks}</div>
              <div className="text-xs text-gray-400">Tasks Done</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.modelsAvailable}</div>
              <div className="text-xs text-gray-400">AI Models</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${zombieCoderConnected ? "text-green-300" : "text-red-300"}`}>
                {zombieCoderConnected ? "✅" : "❌"}
              </div>
              <div className="text-xs text-gray-400">ZombieCoder AI</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="zombiecoder" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="zombiecoder" className="text-xs">
                  ZombieCoder
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs">
                  System
                </TabsTrigger>
                <TabsTrigger value="voice" className="text-xs">
                  Voice & Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="zombiecoder" className="space-y-4">
                <ZombieCoderIntegration
                  onConnectionChange={handleZombieCoderConnection}
                  onAgentResponse={handleZombieCoderResponse}
                  onStatusUpdate={addToConsole}
                />
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <FileIndexer onIndexUpdate={handleFileIndexComplete} onStatusUpdate={addToConsole} />

                <MCPManager onProviderChange={handleProviderChange} onStatusUpdate={addToConsole} />

                <ModelDetector onModelChange={handleModelsDetected} onStatusUpdate={addToConsole} />
              </TabsContent>

              <TabsContent value="voice" className="space-y-4">
                <BengaliVoiceSystem
                  onVoiceCommand={handleVoiceCommand}
                  onStatusUpdate={addToConsole}
                  onCodeGenerate={handleCodeGenerated}
                />

                <TaskTodoManager
                  onTaskCreate={handleTaskCreated}
                  onTaskUpdate={(task) => addToConsole(`📝 Task updated: ${task.title}`)}
                  onStatusUpdate={addToConsole}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Code Editor */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Code className="h-4 w-4" />
                    ZombieCoder Bengali Privacy Editor
                    {zombieCoderConnected && (
                      <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                        ZombieCoder AI Connected
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!zombieCoderConnected && (
                      <Badge variant="destructive" className="text-xs">
                        ZombieCoder AI Disconnected
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" className="h-7 bg-transparent">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Analyze
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[500px] font-mono text-sm bg-slate-900 border-slate-600 text-white"
                  placeholder={
                    zombieCoderConnected
                      ? "// ZombieCoder AI connected! Start coding...\n// Use Bengali voice commands for faster development\n// Tasks and todos are integrated\n// আপনার ZombieCoder AI এর সাথে কোড করুন"
                      : "// ZombieCoder AI disconnected\n// Configure connection in ZombieCoder tab\n// Or use local AI models"
                  }
                />
              </CardContent>
            </Card>

            {/* Agent Executor */}
            <AgentExecutor
              code={code}
              onCodeChange={setCode}
              onAnalysisUpdate={addToConsole}
              fileIndex={fileIndex}
              mcpActive={!!activeMCPProvider || zombieCoderConnected}
            />

            {/* Console & Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <Terminal className="h-4 w-4" />
                  System Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full border border-slate-600 rounded p-3 bg-slate-900">
                  {consoleOutput.map((output, index) => (
                    <div key={index} className="text-xs text-gray-300 mb-1 font-mono">
                      {output}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <Shield className="h-4 w-4" />
                  Extension Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">
                        {key === "autoIndex" && "Auto Index"}
                        {key === "mcpFallback" && "MCP Fallback"}
                        {key === "agentExecution" && "Agent Execution"}
                        {key === "voiceInput" && "Voice Input"}
                        {key === "voiceOutput" && "Voice Output"}
                        {key === "taskManagement" && "Task Management"}
                        {key === "privacyMode" && "Privacy Mode"}
                        {key === "bengaliSupport" && "Bengali Support"}
                        {key === "localModelsOnly" && "Local Only"}
                        {key === "strictMode" && "Strict Mode"}
                        {key === "zombieCoderIntegration" && "ZombieCoder AI"}
                      </label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [key]: checked }))}
                      />
                    </div>
                  ))}
                </div>

                <Alert className="mt-4 bg-slate-700 border-slate-600">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm text-gray-300">
                    🔐 Privacy-First: All data stays local. 🇧🇩 Bengali support with voice commands. 🤖 ZombieCoder AI
                    integration for enhanced coding assistance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
