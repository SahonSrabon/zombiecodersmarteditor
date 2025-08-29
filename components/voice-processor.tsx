"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AudioWaveformIcon as Waveform,
  Languages,
  Code,
  MessageSquare,
} from "lucide-react"

interface VoiceCommand {
  id: string
  timestamp: Date
  bengaliText: string
  englishTranslation: string
  codeGenerated: string
  confidence: number
  type: "code-generation" | "code-modification" | "question" | "instruction"
}

interface VoiceProcessorProps {
  onCodeGenerated: (code: string) => void
  onVoiceCommand: (command: VoiceCommand) => void
  isEnabled: boolean
}

export function VoiceProcessor({ onCodeGenerated, onVoiceCommand, isEnabled }: VoiceProcessorProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState("")
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])
  const [audioLevel, setAudioLevel] = useState(0)

  const recordingTimerRef = useRef<NodeJS.Timeout>()
  const audioLevelRef = useRef<NodeJS.Timeout>()

  // Bengali to English code translation patterns
  const translationPatterns = {
    // Function creation
    "ফাংশন বানাও": "create function",
    "ফাংশন লিখো": "write function",
    "একটা ফাংশন": "a function",

    // Variables
    ভেরিয়েবল: "variable",
    চলক: "variable",

    // Loops
    লুপ: "loop",
    পুনরাবৃত্তি: "iteration",
    চক্র: "cycle",

    // Conditions
    শর্ত: "condition",
    যদি: "if",
    নাহলে: "else",

    // Operations
    যোগ: "add",
    বিয়োগ: "subtract",
    গুণ: "multiply",
    ভাগ: "divide",

    // Data types
    সংখ্যা: "number",
    টেক্সট: "string",
    তালিকা: "array",
    অবজেক্ট: "object",

    // Actions
    "প্রিন্ট করো": "print",
    দেখাও: "show",
    "লগ করো": "log",
    "রিটার্ন করো": "return",
  }

  const codeTemplates = {
    function: (name: string, params: string[] = []) =>
      `function ${name}(${params.join(", ")}) {\n  // Function body\n  return;\n}`,

    "for-loop": (variable: string, limit: string) =>
      `for (let ${variable} = 0; ${variable} < ${limit}; ${variable}++) {\n  console.log(${variable});\n}`,

    "if-condition": (condition: string) => `if (${condition}) {\n  // Code here\n} else {\n  // Alternative code\n}`,

    variable: (name: string, value: string) => `const ${name} = ${value};`,

    array: (name: string, items: string[] = []) => `const ${name} = [${items.map((item) => `"${item}"`).join(", ")}];`,
  }

  const startRecording = useCallback(() => {
    if (!isEnabled) return

    setIsRecording(true)
    setRecordingProgress(0)
    setAudioLevel(0)

    // Simulate audio level detection
    audioLevelRef.current = setInterval(() => {
      setAudioLevel(Math.random() * 100)
    }, 100)

    // Recording progress
    recordingTimerRef.current = setInterval(() => {
      setRecordingProgress((prev) => {
        if (prev >= 100) {
          stopRecording()
          return 100
        }
        return prev + 2
      })
    }, 100)
  }, [isEnabled])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    setRecordingProgress(0)
    setAudioLevel(0)

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current)
    }

    processVoiceInput()
  }, [])

  const processVoiceInput = useCallback(() => {
    setIsProcessing(true)
    setProcessingStage("🎙️ অডিও প্রসেসিং...")

    setTimeout(() => {
      setProcessingStage("🔤 বাংলা টেক্সট রূপান্তর...")
    }, 500)

    setTimeout(() => {
      setProcessingStage("🌐 ইংরেজি অনুবাদ...")
    }, 1000)

    setTimeout(() => {
      setProcessingStage("💻 কোড জেনারেশন...")
    }, 1500)

    setTimeout(() => {
      // Simulate voice recognition results
      const bengaliCommands = [
        {
          bengali: "একটা ফাংশন বানাও যা দুইটা সংখ্যা যোগ করে",
          english: "create a function that adds two numbers",
          code: codeTemplates.function("addNumbers", ["a", "b"]).replace("// Function body", "return a + b;"),
          type: "code-generation" as const,
        },
        {
          bengali: "একটা লুপ লিখো যা ১ থেকে ১০ পর্যন্ত প্রিন্ট করে",
          english: "write a loop that prints from 1 to 10",
          code: codeTemplates["for-loop"]("i", "11").replace("console.log(i)", "console.log(i + 1)"),
          type: "code-generation" as const,
        },
        {
          bengali: "একটা অ্যারে বানাও ফলের নাম দিয়ে",
          english: "create an array with fruit names",
          code: codeTemplates.array("fruits", ["আম", "কলা", "আপেল", "কমলা"]),
          type: "code-generation" as const,
        },
        {
          bengali: "এই কোডে কমেন্ট যোগ করো",
          english: "add comments to this code",
          code: "// Added comments for better code readability\n// TODO: Implement proper error handling",
          type: "code-modification" as const,
        },
        {
          bengali: "এই ফাংশনটা কিভাবে কাজ করে?",
          english: "how does this function work?",
          code: "// This function explanation will be provided",
          type: "question" as const,
        },
      ]

      const randomCommand = bengaliCommands[Math.floor(Math.random() * bengaliCommands.length)]

      const voiceCommand: VoiceCommand = {
        id: Date.now().toString(),
        timestamp: new Date(),
        bengaliText: randomCommand.bengali,
        englishTranslation: randomCommand.english,
        codeGenerated: randomCommand.code,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        type: randomCommand.type,
      }

      setRecentCommands((prev) => [voiceCommand, ...prev.slice(0, 4)])
      onVoiceCommand(voiceCommand)

      if (voiceCommand.type === "code-generation" || voiceCommand.type === "code-modification") {
        onCodeGenerated(voiceCommand.codeGenerated)
      }

      setIsProcessing(false)
      setProcessingStage("")
    }, 2000)
  }, [onCodeGenerated, onVoiceCommand])

  const speakText = useCallback((text: string) => {
    setIsSpeaking(true)

    // Simulate TTS processing
    setTimeout(() => {
      setIsSpeaking(false)
    }, 2000)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Voice Control Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waveform className="h-4 w-4" />
            ভয়েস কন্ট্রোল
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              disabled={!isEnabled || isProcessing}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  রেকর্ডিং বন্ধ করুন
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  বাংলায় বলুন
                </>
              )}
            </Button>

            <Button size="lg" variant="outline" onClick={() => speakText("আপনার কোড প্রস্তুত!")} disabled={isSpeaking}>
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Recording Progress */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Recording...</span>
                <span>{Math.round(recordingProgress)}%</span>
              </div>
              <Progress value={recordingProgress} className="h-2" />

              {/* Audio Level Visualization */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className={`h-6 w-1 rounded ${audioLevel > (i * 5) ? "bg-green-500" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="text-sm font-medium">{processingStage}</div>
              <Progress value={66} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              সাম্প্রতিক ভয়েস কমান্ড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {recentCommands.map((command) => (
                  <div key={command.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {command.type === "code-generation" && <Code className="h-3 w-3 mr-1" />}
                        {command.type === "code-modification" && <Languages className="h-3 w-3 mr-1" />}
                        {command.type === "question" && <MessageSquare className="h-3 w-3 mr-1" />}
                        {command.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {command.confidence}%
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-blue-600">🗣️ {command.bengaliText}</div>
                      <div className="text-xs text-gray-600">🌐 {command.englishTranslation}</div>
                    </div>

                    {command.codeGenerated && (
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        <div className="text-gray-500 mb-1">Generated Code:</div>
                        <div className="text-gray-800">
                          {command.codeGenerated.split("\n")[0]}
                          {command.codeGenerated.split("\n").length > 1 && "..."}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">{command.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
