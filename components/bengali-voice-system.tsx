"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Mic, Volume2, VolumeX, Play, Pause, Square, RefreshCw, MessageSquare, Code, CheckSquare } from "lucide-react"

interface VoiceCommand {
  id: string
  timestamp: Date
  bengaliText: string
  englishTranslation: string
  codeGenerated?: string
  confidence: number
  type: "code-generation" | "code-modification" | "question" | "instruction" | "todo" | "task"
  processed: boolean
}

interface BengaliVoiceSystemProps {
  onVoiceCommand?: (command: VoiceCommand) => void
  onStatusUpdate?: (message: string) => void
  onCodeGenerate?: (code: string) => void
}

export function BengaliVoiceSystem({ onVoiceCommand, onStatusUpdate, onCodeGenerate }: BengaliVoiceSystemProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [recordingLevel, setRecordingLevel] = useState(0)
  const [currentPlayback, setCurrentPlayback] = useState<string | null>(null)

  const recordingRef = useRef<number | null>(null)

  // Bengali voice commands examples
  const sampleCommands = [
    {
      bengali: "একটা ফাংশন বানাও যা দুইটা সংখ্যা যোগ করে",
      english: "Create a function that adds two numbers",
      type: "code-generation" as const,
    },
    {
      bengali: "এই কোডটি ব্যাখ্যা করো",
      english: "Explain this code",
      type: "question" as const,
    },
    {
      bengali: "একটা টাস্ক যোগ করো: কোড রিভিউ করতে হবে",
      english: "Add a task: Need to review code",
      type: "task" as const,
    },
    {
      bengali: "বাংলা কমেন্ট যোগ করো",
      english: "Add Bengali comments",
      type: "code-modification" as const,
    },
  ]

  // Start voice recording
  const startRecording = useCallback(() => {
    if (!voiceEnabled) return

    setIsRecording(true)
    setRecordingLevel(0)
    onStatusUpdate?.("🎙️ Recording started... Speak in Bengali")

    // Simulate recording level animation
    recordingRef.current = window.setInterval(() => {
      setRecordingLevel(Math.random() * 100)
    }, 100)

    // Auto-stop after 10 seconds
    setTimeout(() => {
      if (recordingRef.current) {
        stopRecording()
      }
    }, 10000)
  }, [voiceEnabled, onStatusUpdate])

  // Stop voice recording
  const stopRecording = useCallback(async () => {
    if (!isRecording) return

    setIsRecording(false)
    setRecordingLevel(0)
    setIsProcessing(true)

    if (recordingRef.current) {
      clearInterval(recordingRef.current)
      recordingRef.current = null
    }

    onStatusUpdate?.("🔄 Processing Bengali voice command...")

    // Simulate voice processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a random sample command
    const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)]

    const newCommand: VoiceCommand = {
      id: `voice-${Date.now()}`,
      timestamp: new Date(),
      bengaliText: randomCommand.bengali,
      englishTranslation: randomCommand.english,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      type: randomCommand.type,
      processed: false,
    }

    // Generate code if it's a code generation command
    if (newCommand.type === "code-generation") {
      const generatedCode = `// ${newCommand.bengaliText}
function addNumbers(a, b) {
  // দুইটি সংখ্যা যোগ করার ফাংশন
  return a + b;
}

// ব্যবহারের উদাহরণ
const result = addNumbers(5, 3);
console.log("ফলাফল:", result); // ফলাফল: 8`

      newCommand.codeGenerated = generatedCode
      onCodeGenerate?.(generatedCode)
    }

    setVoiceCommands((prev) => [newCommand, ...prev.slice(0, 9)]) // Keep last 10
    setIsProcessing(false)

    onVoiceCommand?.(newCommand)
    onStatusUpdate?.(`✅ Voice command processed: ${newCommand.bengaliText}`)

    // Text-to-speech if enabled
    if (speechEnabled) {
      speakText(`আপনার কমান্ড প্রসেস করা হয়েছে: ${newCommand.englishTranslation}`)
    }
  }, [isRecording, onVoiceCommand, onStatusUpdate, onCodeGenerate, speechEnabled])

  // Text-to-speech
  const speakText = useCallback(
    (text: string) => {
      if (!speechEnabled) return

      // Simulate text-to-speech
      onStatusUpdate?.(`🔊 Speaking: ${text.slice(0, 30)}...`)

      // In a real implementation, you would use Web Speech API or a Bengali TTS service
      setTimeout(() => {
        onStatusUpdate?.("🔊 Speech completed")
      }, 2000)
    },
    [speechEnabled, onStatusUpdate],
  )

  // Play voice command
  const playCommand = useCallback(
    (commandId: string) => {
      const command = voiceCommands.find((c) => c.id === commandId)
      if (!command) return

      setCurrentPlayback(commandId)
      speakText(command.bengaliText)

      setTimeout(() => {
        setCurrentPlayback(null)
      }, 3000)
    },
    [voiceCommands, speakText],
  )

  // Process command (execute the action)
  const processCommand = useCallback(
    (commandId: string) => {
      setVoiceCommands((prev) => prev.map((cmd) => (cmd.id === commandId ? { ...cmd, processed: true } : cmd)))

      const command = voiceCommands.find((c) => c.id === commandId)
      if (command) {
        onStatusUpdate?.(`⚡ Executed: ${command.englishTranslation}`)
      }
    },
    [voiceCommands, onStatusUpdate],
  )

  const getCommandIcon = (type: VoiceCommand["type"]) => {
    switch (type) {
      case "code-generation":
      case "code-modification":
        return <Code className="h-4 w-4 text-blue-400" />
      case "question":
        return <MessageSquare className="h-4 w-4 text-green-400" />
      case "task":
      case "todo":
        return <CheckSquare className="h-4 w-4 text-purple-400" />
      default:
        return <Mic className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Mic className="h-4 w-4" />
          Bengali Voice System ({voiceCommands.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Voice Input:</Label>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Speech Output:</Label>
            <Switch
              checked={speechEnabled}
              onCheckedChange={setSpeechEnabled}
            />
          </div>
        </div>

        {/* Recording Interface */}
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!voiceEnabled || isProcessing}
              className={`w-20 h-20 rounded-full ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isProcessing ? (
                <RefreshCw className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          {/* Recording Level */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Recording Level</span>
                <span className="text-gray-400">{Math.round(recordingLevel)}%</span>
              </div>
              <Progress value={recordingLevel} className="h-2" />
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            <Badge variant="outline" className={`${
              isRecording 
                ? "border-red-600 text-red-300" 
                : isProcessing 
                  ? "border-yellow-600 text-yellow-300"
                  : "border-green-600 text-green-300"
            }`}>
              {isRecording 
                ? "🎙️ Recording..." 
                : isProcessing 
                  ? "🔄 Processing..."
                  : "✅ Ready"
              }
            </Badge>
          </div>
        </div>

        {/* Voice Commands History */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Recent Commands:</Label>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {voiceCommands.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <div className="text-xs text-gray-400">
                    No voice commands yet
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click the microphone to start
                  </div>
                </div>
              ) : (
                voiceCommands.map((command) => (
                  <div
                    key={command.id}
                    className={`border rounded p-3 space-y-2 ${
                      command.processed 
                        ? "border-green-600 bg-green-900/10" 
                        : "border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCommandIcon(command.type)}
                        <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                          {command.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {command.confidence}%
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {command.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-blue-300 font-medium bengali-text">
                        🇧🇩 {command.bengaliText}
                      </div>
                      <div className="text-xs text-gray-400">
                        🇺🇸 {command.englishTranslation}
                      </div>
                    </div>

                    {command.codeGenerated && (
                      <div className="bg-slate-900 rounded p-2 text-xs font-mono">
                        <div className="text-green-300">
                          {command.codeGenerated.split('\n').slice(0, 3).join('\n')}
                          {command.codeGenerated.split('\n').length > 3 && '...'}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => playCommand(command.id)}
                        disabled={currentPlayback === command.id}
                        className="h-6 text-xs bg-purple-600 hover:bg-purple-700"
                      >
                        {currentPlayback === command.id ? (
                          <Pause className="h-3 w-3 mr-1" />
                        ) : (
                          <Play className="h-3 w-3 mr-1" />
                        )}
                        Play
                      </Button>
                      
                      {!command.processed && (
                        <Button
                          size="sm"
                          onClick={() => processCommand(command.id)}
                          className="h-6 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${
          voiceEnabled ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
        }`}>
          {voiceEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          <AlertDescription className="text-sm">
            {voiceEnabled ? (
              <>
                <strong>Voice Active:</strong> Bengali speech recognition enabled
                {speechEnabled && " • Text-to-speech enabled"}
              </>
            ) : (
              <strong>Voice Disabled:</strong> Enable voice input to use Bengali commands
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
