"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import SmartInputInterface from "./smart-input-interface"
import { Sparkles, Bot, Settings, RefreshCw, Download, Share } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  agent?: string
  context?: any[]
}

interface AgentModeInterfaceProps {
  onMessage?: (message: Message) => void
}

export function AgentModeInterface({ onMessage }: AgentModeInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle message submission
  const handleSubmit = async (content: string, context: any[], agent: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
      agent,
      context,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        type: "assistant",
        content: `আমি ${agent} এজেন্ট হিসেবে আপনার প্রশ্নের উত্তর দিচ্ছি: "${content}"\n\nআপনার কোড বিশ্লেষণ করে আমি দেখতে পাচ্ছি যে এটি একটি দুর্দান্ত প্রশ্ন। আমি আপনাকে সাহায্য করতে পারি।`,
        timestamp: new Date(),
        agent,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsProcessing(false)
      onMessage?.(assistantMessage)
    }, 2000)

    onMessage?.(userMessage)
  }

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    console.log("Voice command:", command)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">ZombieCoder AI Chat</h2>
          </div>
          <Badge variant="outline" className="border-green-600 text-green-300">
            Agent Mode Active
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-slate-400">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400">
            <Share className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4 mx-auto">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Build with agent mode.</h3>
              <p className="text-slate-400 mb-4">AI responses may be inaccurate.</p>
              <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                Generate instructions to onboard AI onto your codebase.
              </Button>
            </div>
          </div>
        ) : (
          // Messages List
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-slate-400 font-medium">{message.agent} Agent</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-slate-400">AI is thinking...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Interface */}
        <div className="p-4 border-t border-slate-700">
          <SmartInputInterface
            onSubmit={handleSubmit}
            onVoiceCommand={handleVoiceCommand}
            isProcessing={isProcessing}
            placeholder="Add context (#), extensions (@), commands (/), or ask anything in Bengali..."
          />
        </div>
      </div>
    </div>
  )
}

export default AgentModeInterface
