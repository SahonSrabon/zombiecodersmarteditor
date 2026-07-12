"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Hash,
  AtSign,
  Slash,
  Sparkles,
  Bot,
  Code,
  FileText,
  Settings,
  Brain,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react"

interface SmartInputProps {
  onSubmit: (message: string, context: ContextItem[], agent: string) => void
  onVoiceCommand: (command: string) => void
  isProcessing?: boolean
  placeholder?: string
}

interface ContextItem {
  id: string
  type: "file" | "extension" | "command" | "context"
  name: string
  description?: string
  icon?: React.ReactNode
}

interface Suggestion {
  id: string
  text: string
  type: "context" | "command" | "extension"
  description: string
  shortcut?: string
}

export function SmartInputInterface({
  onSubmit,
  onVoiceCommand,
  isProcessing = false,
  placeholder = "Write, @ for context, / for commands, # for files...",
}: SmartInputProps) {
  const [input, setInput] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("zombiecoder")
  const [contextItems, setContextItems] = useState<ContextItem[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isAgentMode, setIsAgentMode] = useState(true)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)

  // Available agents
  const agents = [
    { id: "zombiecoder", name: "ZombieCoder AI", icon: <Bot className="h-4 w-4" />, description: "বাংলা কোডিং সহায়ক" },
    { id: "procoder", name: "Procoder", icon: <Code className="h-4 w-4" />, description: "কোডিং, প্রোগ্রামিং" },
    { id: "creative", name: "Creative Writer", icon: <FileText className="h-4 w-4" />, description: "গল্প, কবিতা" },
    {
      id: "translator",
      name: "Translation Agent",
      icon: <MessageSquare className="h-4 w-4" />,
      description: "ভাষা অনুবাদ",
    },
    { id: "analyzer", name: "DB Analyzer", icon: <Brain className="h-4 w-4" />, description: "ডাটাবেস বিশ্লেষণ" },
  ]

  // Context suggestions based on input
  const contextSuggestions: Suggestion[] = [
    { id: "1", text: "current-file", type: "context", description: "বর্তমান ফাইল যোগ করুন", shortcut: "#" },
    { id: "2", text: "workspace", type: "context", description: "সম্পূর্ণ workspace", shortcut: "#" },
    { id: "3", text: "selection", type: "context", description: "নির্বাচিত কোড", shortcut: "#" },
    { id: "4", text: "git-changes", type: "context", description: "Git পরিবর্তনসমূহ", shortcut: "#" },
    { id: "5", text: "errors", type: "context", description: "Error লগ", shortcut: "#" },
  ]

  const commandSuggestions: Suggestion[] = [
    { id: "1", text: "explain", type: "command", description: "কোড ব্যাখ্যা করুন", shortcut: "/" },
    { id: "2", text: "fix", type: "command", description: "সমস্যা সমাধান করুন", shortcut: "/" },
    { id: "3", text: "optimize", type: "command", description: "কোড অপ্টিমাইজ করুন", shortcut: "/" },
    { id: "4", text: "translate", type: "command", description: "বাংলায় অনুবাদ করুন", shortcut: "/" },
    { id: "5", text: "generate", type: "command", description: "নতুন কোড তৈরি করুন", shortcut: "/" },
  ]

  const extensionSuggestions: Suggestion[] = [
    { id: "1", text: "prettier", type: "extension", description: "কোড ফরম্যাটিং", shortcut: "@" },
    { id: "2", text: "eslint", type: "extension", description: "কোড লিন্টিং", shortcut: "@" },
    { id: "3", text: "typescript", type: "extension", description: "TypeScript সাপোর্ট", shortcut: "@" },
    { id: "4", text: "react", type: "extension", description: "React ডেভেলপমেন্ট", shortcut: "@" },
    { id: "5", text: "git", type: "extension", description: "Git ইন্টিগ্রেশন", shortcut: "@" },
  ]

  // Handle input change and suggestions
  const handleInputChange = useCallback((value: string) => {
    setInput(value)

    const lastChar = value[value.length - 1]
    const words = value.split(" ")
    const currentWord = words[words.length - 1]

    // Show suggestions based on trigger characters
    if (currentWord.startsWith("#")) {
      setSuggestions(contextSuggestions)
      setShowSuggestions(true)
    } else if (currentWord.startsWith("/")) {
      setSuggestions(commandSuggestions)
      setShowSuggestions(true)
    } else if (currentWord.startsWith("@")) {
      setSuggestions(extensionSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }

    // Update progress based on input length
    const progressValue = Math.min((value.length / 100) * 100, 100)
    setProgress(progressValue)
  }, [])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: Suggestion) => {
      const words = input.split(" ")
      const lastWordIndex = words.length - 1
      const currentWord = words[lastWordIndex]

      // Replace the current word with the suggestion
      words[lastWordIndex] = suggestion.shortcut + suggestion.text
      const newInput = words.join(" ") + " "

      setInput(newInput)
      setShowSuggestions(false)

      // Add to context items
      const contextItem: ContextItem = {
        id: suggestion.id,
        type: suggestion.type as any,
        name: suggestion.text,
        description: suggestion.description,
        icon: getIconForType(suggestion.type),
      }

      setContextItems((prev) => [...prev, contextItem])

      // Focus back to input
      inputRef.current?.focus()
    },
    [input],
  )

  // Get icon for context type
  const getIconForType = (type: string) => {
    switch (type) {
      case "context":
        return <Hash className="h-3 w-3" />
      case "command":
        return <Slash className="h-3 w-3" />
      case "extension":
        return <AtSign className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  // Remove context item
  const removeContextItem = useCallback((id: string) => {
    setContextItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim(), contextItems, selectedAgent)
      setInput("")
      setContextItems([])
      setProgress(0)
    }
  }, [input, contextItems, selectedAgent, isProcessing, onSubmit])

  // Handle voice recording
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording
      onVoiceCommand("start_recording")
    } else {
      // Stop recording
      onVoiceCommand("stop_recording")
    }
  }, [isRecording, onVoiceCommand])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleSubmit])

  return (
    <TooltipProvider>
      <Card className="bg-slate-900 border-slate-700 shadow-xl">
        <CardContent className="p-0">
          {/* Header with Agent Mode */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                {isAgentMode ? "Build with agent mode." : "Standard Mode"}
              </span>
              {isAgentMode && (
                <Badge variant="outline" className="text-xs border-blue-600 text-blue-300">
                  AI responses may be inaccurate.
                </Badge>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsAgentMode(!isAgentMode)} className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          {/* Context Items */}
          {contextItems.length > 0 && (
            <div className="p-3 border-b border-slate-700">
              <div className="flex flex-wrap gap-2">
                {contextItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-slate-700 text-slate-200 hover:bg-slate-600"
                  >
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeContextItem(item.id)}
                      className="h-3 w-3 p-0 ml-1 hover:bg-slate-500"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div className="relative">
            <div className="flex items-start gap-2 p-3">
              {/* Agent Selector */}
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-40 h-8 bg-slate-800 border-slate-600 text-xs">
                  <div className="flex items-center gap-2">
                    {agents.find((a) => a.id === selectedAgent)?.icon}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        {agent.icon}
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-slate-400">{agent.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Input Field */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full min-h-[80px] max-h-[200px] bg-transparent text-white placeholder-slate-400 border-none outline-none resize-none text-sm leading-relaxed"
                  style={{ scrollbarWidth: "thin" }}
                />

                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={progress} className="h-1" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleRecording}
                      className={`h-8 w-8 p-0 ${isRecording ? "text-red-400 bg-red-900/20" : "text-slate-400"}`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRecording ? "Stop Recording" : "Start Voice Input"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach Files</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isProcessing}
                  className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute bottom-full left-3 right-3 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-48 overflow-hidden"
              >
                <ScrollArea className="max-h-48">
                  <div className="p-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="ghost"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full justify-start h-auto p-2 text-left hover:bg-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-slate-700 rounded">
                            {getIconForType(suggestion.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {suggestion.shortcut}
                                {suggestion.text}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">{suggestion.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-t border-slate-700">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                files
              </span>
              <span className="flex items-center gap-1">
                <AtSign className="h-3 w-3" />
                extensions
              </span>
              <span className="flex items-center gap-1">
                <Slash className="h-3 w-3" />
                commands
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Enter</kbd>
              <span>to send</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default SmartInputInterface
