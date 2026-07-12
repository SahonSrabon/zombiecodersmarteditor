"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SmartInputInterface from "./smart-input-interface"
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  agent?: string
  context?: any[]
  metadata?: {
    tokens?: number
    confidence?: number
    language?: string
  }
  feedback?: "positive" | "negative"
}

interface AIChatInterfaceProps {
  onMessageSend?: (message: string, type: string) => void
  onVoiceInput?: () => void
  isVoiceActive?: boolean
  isProcessing?: boolean
}

export function AIChatInterface({
  onMessageSend,
  onVoiceInput,
  isVoiceActive = false,
  isProcessing = false,
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentProcessing, setCurrentProcessing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Handle message submission
  const handleSubmit = useCallback(
    async (content: string, context: any[], agent: string) => {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        type: "user",
        content,
        timestamp: new Date(),
        agent,
        context,
        metadata: {
          tokens: content.split(" ").length,
          language: /[\u0980-\u09FF]/.test(content) ? "bengali" : "english",
        },
      }

      setMessages((prev) => [...prev, userMessage])
      setCurrentProcessing(true)
      onMessageSend?.(content, "chat")

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          `আমি ${agent} এজেন্ট হিসেবে আপনার প্রশ্নের উত্তর দিচ্ছি। আপনি যে context যোগ করেছেন তা খুবই সহায়ক। আমি আপনাকে নিম্নলিখিত সমাধান দিতে পারি:

1. **কোড অপ্টিমাইজেশন**: আপনার কোডে কিছু উন্নতি করা যেতে পারে
2. **বাংলা কমেন্ট**: কোডে বাংলা কমেন্ট যোগ করতে পারি
3. **পারফরম্যান্স**: আরো ভালো পারফরম্যান্স পেতে কিছু পরিবর্তন করা যেতে পারে

আপনার আরো কোনো প্রশ্ন থাকলে জানান!`,

          `Hello! As ${agent}, I can help you with your coding needs. Based on your message: "${content}"

I can provide assistance with:
- Code generation and optimization
- Bengali language support
- Voice command integration
- Task management

Would you like me to elaborate on any specific aspect?`,

          `আপনার প্রশ্নটি খুবই গুরুত্বপূর্ণ। ${agent} হিসেবে আমি আপনাকে সাহায্য করতে পারি।

\`\`\`javascript
// আপনার জন্য একটি উদাহরণ কোড
function bengaliGreeting(name) {
  // বাংলা অভিবাদন ফাংশন
  return \`নমস্কার, \${name}! আপনাকে স্বাগতম।\`;
}

// ব্যবহারের উদাহরণ
const message = bengaliGreeting("ডেভেলপার");
console.log(message);
\`\`\`

এই কোডটি আপনার কাজে লাগতে পারে। আরো সাহায্য প্রয়োজন হলে জানান!`,
        ]

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-response`,
          type: "assistant",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          agent,
          metadata: {
            tokens: Math.floor(Math.random() * 200) + 100,
            confidence: Math.floor(Math.random() * 20) + 80,
            language: "mixed",
          },
        }

        setMessages((prev) => [...prev, assistantMessage])
        setCurrentProcessing(false)
      }, 2000)
    },
    [onMessageSend],
  )

  // Handle voice command
  const handleVoiceCommand = useCallback(
    (command: string) => {
      onVoiceInput?.()
    },
    [onVoiceInput],
  )

  // Copy message to clipboard
  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }, [])

  // Provide feedback on message
  const provideFeedback = useCallback((messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
  }, [])

  // Regenerate response
  const regenerateResponse = useCallback(
    (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) return

      const userMessage = messages[messageIndex - 1]
      if (!userMessage || userMessage.type !== "user") return

      // Remove the old response and regenerate
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      setTimeout(() => {
        handleSubmit(userMessage.content, userMessage.context || [], userMessage.agent || "zombiecoder")
      }, 500)
    },
    [messages, handleSubmit],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              // Empty State
              <div className="flex items-center justify-center h-64">
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
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {message.type === "assistant" ? (
                        <Bot className="h-4 w-4 text-blue-400" />
                      ) : (
                        <User className="h-4 w-4 text-blue-300" />
                      )}
                      <span className="text-xs font-medium">
                        {message.type === "assistant" ? `${message.agent} Agent` : "You"}
                      </span>
                      {message.metadata?.language && (
                        <Badge variant="outline" className="text-xs">
                          {message.metadata.language === "bengali"
                            ? "🇧🇩"
                            : message.metadata.language === "mixed"
                              ? "🇧🇩🇺🇸"
                              : "🇺🇸"}
                        </Badge>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>

                    {/* Context Items */}
                    {message.context && message.context.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.context.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Message Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-600/50">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.metadata?.tokens && <span>• {message.metadata.tokens} tokens</span>}
                        {message.metadata?.confidence && <span>• {message.metadata.confidence}% confidence</span>}
                      </div>

                      {/* Message Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        {message.type === "assistant" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => provideFeedback(message.id, "positive")}
                              className={`h-6 w-6 p-0 opacity-70 hover:opacity-100 ${
                                message.feedback === "positive" ? "text-green-400" : ""
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => provideFeedback(message.id, "negative")}
                              className={`h-6 w-6 p-0 opacity-70 hover:opacity-100 ${
                                message.feedback === "negative" ? "text-red-400" : ""
                              }`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => regenerateResponse(message.id)}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Processing Indicator */}
            {currentProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-[85%]">
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
      </div>

      {/* Input Interface */}
      <div className="border-t border-slate-700 p-4">
        <SmartInputInterface
          onSubmit={handleSubmit}
          onVoiceCommand={handleVoiceCommand}
          isProcessing={currentProcessing || isProcessing}
          isVoiceActive={isVoiceActive}
          placeholder="Add context (#), extensions (@), commands (/), or ask anything in Bengali..."
        />
      </div>
    </div>
  )
}

export default AIChatInterface
