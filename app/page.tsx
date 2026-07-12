"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import our components
import AgentModeInterface from "@/components/agent-mode-interface"
import SmartInputInterface from "@/components/smart-input-interface"
import BengaliVoiceSystem from "@/components/bengali-voice-system"
import AgentExecutor from "@/components/agent-executor"
import MCPManager from "@/components/mcp-manager"
import FileIndexer from "@/components/file-indexer"
import ModelDetector from "@/components/model-detector"
import TaskTodoManager from "@/components/task-todo-manager"

import { Bot, Settings, MessageSquare, Sparkles } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")
  const [statusMessage, setStatusMessage] = useState("🇧🇩 ZombieCoder AI Ready - বাংলা কোডিং সহায়ক")

  // Handle status updates from components
  const handleStatusUpdate = (message: string) => {
    setStatusMessage(message)
  }

  // Handle voice commands
  const handleVoiceCommand = (command: any) => {
    console.log("Voice command received:", command)
    setStatusMessage(`🎙️ Voice: ${command.bengali}`)
  }

  // Handle code generation
  const handleCodeGenerate = (code: string) => {
    console.log("Generated code:", code)
    setStatusMessage("✨ Code generated successfully!")
  }

  // Handle message submission
  const handleMessageSubmit = (message: string, context: any[], agent: string) => {
    console.log("Message submitted:", { message, context, agent })
    setStatusMessage(`💬 Processing with ${agent}...`)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-slate-950">
          {/* Sidebar */}
          <Sidebar className="border-slate-800">
            <SidebarHeader className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white">ZombieCoder AI</h1>
                  <p className="text-xs text-slate-400">Bengali Privacy Editor</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="chat" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Tools
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="mt-4 space-y-4">
                  {/* Smart Input Interface */}
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-white">
                        <Sparkles className="h-4 w-4" />
                        Smart Input
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SmartInputInterface
                        onSubmit={handleMessageSubmit}
                        onVoiceCommand={handleVoiceCommand}
                        placeholder="Write in Bengali or English..."
                      />
                    </CardContent>
                  </Card>

                  {/* Bengali Voice System */}
                  <BengaliVoiceSystem
                    onVoiceCommand={handleVoiceCommand}
                    onStatusUpdate={handleStatusUpdate}
                    onCodeGenerate={handleCodeGenerate}
                  />

                  {/* Task & Todo Manager */}
                  <TaskTodoManager onStatusUpdate={handleStatusUpdate} />
                </TabsContent>

                <TabsContent value="tools" className="mt-4 space-y-4">
                  {/* File Indexer */}
                  <FileIndexer onStatusUpdate={handleStatusUpdate} />

                  {/* Model Detector */}
                  <ModelDetector onStatusUpdate={handleStatusUpdate} />

                  {/* Agent Executor */}
                  <AgentExecutor 
                    code="" 
                    onCodeChange={() => {}} 
                    onAnalysisUpdate={handleStatusUpdate}
                    mcpActive={true}
                  />

                  {/* MCP Manager */}
                  <MCPManager />
                </TabsContent>
              </Tabs>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1">
            <div className="flex flex-col h-full">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-600 text-green-300">
                    Online
                  </Badge>
                  <span className="text-sm text-slate-300">{statusMessage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Bengali Mode
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Privacy First
                  </Badge>
                </div>
              </div>

              {/* Main Chat Interface */}
              <div className="flex-1">
                <AgentModeInterface
                  onMessage={(message) => {
                    console.log("New message:", message)
                    setStatusMessage(`💬 ${message.type === "user" ? "You" : "AI"}: Message sent`)
                  }}
                />
              </div>
            </div>
          </SidebarInset>
        </div>

        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
