"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mic,
  Volume2,
  VolumeX,
  Square,
  Languages,
  AudioWaveformIcon as Waveform,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react"

interface VoiceCommand {
  id: string
  bengali: string
  english: string
  action: string
  confidence: number
  timestamp: Date
  executed: boolean
  response?: string
}

interface VoiceSettings {
  language: "bn-BD" | "en-US"
  volume: number
  speed: number
  pitch: number
  noiseReduction: boolean
  autoExecute: boolean
  confidenceThreshold: number
}

interface BengaliVoiceSystemProps {
  onVoiceCommand: (command: VoiceCommand) => void
  onStatusUpdate: (message: string) => void
  onCodeGenerate: (code: string) => void
}

export function BengaliVoiceSystem({ onVoiceCommand, onStatusUpdate, onCodeGenerate }: BengaliVoiceSystemProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "bn-BD",
    volume: 80,
    speed: 1.0,
    pitch: 1.0,
    noiseReduction: true,
    autoExecute: false,
    confidenceThreshold: 70,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Bengali voice command templates
  const commandTemplates = [
    { bengali: "কোড লিখো", english: "write code", action: "generate_code" },
    { bengali: "ফাংশন বানাও", english: "create function", action: "create_function" },
    { bengali: "ভেরিয়েবল ডিক্লেয়ার করো", english: "declare variable", action: "declare_variable" },
    { bengali: "কমেন্ট যোগ করো", english: "add comment", action: "add_comment" },
    { bengali: "ইমপোর্ট করো", english: "import module", action: "import_module" },
    { bengali: "এক্সপোর্ট করো", english: "export function", action: "export_function" },
    { bengali: "লুপ বানাও", english: "create loop", action: "create_loop" },
    { bengali: "কন্ডিশন চেক করো", english: "add condition", action: "add_condition" },
    { bengali: "ক্লাস বানাও", english: "create class", action: "create_class" },
    { bengali: "অবজেক্ট বানাও", english: "create object", action: "create_object" },
    { bengali: "সেভ করো", english: "save file", action: "save_file" },
    { bengali: "রান করো", english: "run code", action: "run_code" },
    { bengali: "ডিবাগ করো", english: "debug code", action: "debug_code" },
    { bengali: "ফরম্যাট করো", english: "format code", action: "format_code" },
    { bengali: "ট্রান্সলেট করো", english: "translate text", action: "translate" },
  ]

  // Initialize audio context and media recorder
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: voiceSettings.noiseReduction,
          autoGainControl: true,
        },
      })

      // Create audio context for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Process audio data for speech recognition
          processAudioData(event.data)
        }
      }

      onStatusUpdate("🎙️ Voice system initialized")
      return true
    } catch (error) {
      onStatusUpdate("❌ Failed to initialize voice system: " + error)
      return false
    }
  }, [voiceSettings.noiseReduction, onStatusUpdate])

  // Process audio data for speech recognition
  const processAudioData = useCallback(
    async (audioBlob: Blob) => {
      try {
        // Simulate speech recognition processing
        onStatusUpdate("🔍 Processing voice input...")

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate Bengali speech recognition results
        const mockRecognitionResults = [
          { text: "কোড লিখো একটা ফাংশন", confidence: 85 },
          { text: "ভেরিয়েবল ডিক্লেয়ার করো নাম দিয়ে", confidence: 78 },
          { text: "লুপ বানাও দশ বার চালানোর জন্য", confidence: 92 },
          { text: "কমেন্ট যোগ করো এই লাইনে", confidence: 88 },
          { text: "ইমপোর্ট করো রিয়েক্ট লাইব্রেরি", confidence: 95 },
        ]

        const randomResult = mockRecognitionResults[Math.floor(Math.random() * mockRecognitionResults.length)]

        // Find matching command template
        const matchedTemplate = commandTemplates.find((template) => randomResult.text.includes(template.bengali))

        if (matchedTemplate && randomResult.confidence >= voiceSettings.confidenceThreshold) {
          const command: VoiceCommand = {
            id: `cmd-${Date.now()}`,
            bengali: randomResult.text,
            english: matchedTemplate.english,
            action: matchedTemplate.action,
            confidence: randomResult.confidence,
            timestamp: new Date(),
            executed: false,
          }

          setVoiceCommands((prev) => [command, ...prev.slice(0, 19)]) // Keep last 20 commands
          onVoiceCommand(command)

          // Auto-execute if enabled and confidence is high
          if (voiceSettings.autoExecute && randomResult.confidence >= 85) {
            executeVoiceCommand(command)
          }

          onStatusUpdate(`✅ Voice command recognized: ${command.bengali} (${command.confidence}%)`)
        } else {
          onStatusUpdate(`❌ Voice command not recognized or low confidence (${randomResult.confidence}%)`)
        }
      } catch (error) {
        onStatusUpdate("❌ Error processing voice input: " + error)
      }
    },
    [commandTemplates, voiceSettings.confidenceThreshold, voiceSettings.autoExecute, onVoiceCommand, onStatusUpdate],
  )

  // Execute voice command
  const executeVoiceCommand = useCallback(
    (command: VoiceCommand) => {
      let generatedCode = ""
      let response = ""

      switch (command.action) {
        case "generate_code":
          generatedCode = `// Generated from voice command: ${command.bengali}
function generatedFunction() {
  console.log("Hello from voice command!");
  return "Generated code";
}`
          response = "কোড জেনারেট করা হয়েছে"
          break

        case "create_function":
          generatedCode = `// Function created from voice: ${command.bengali}
function myFunction() {
  // TODO: Implement function logic
  return true;
}`
          response = "ফাংশন তৈরি করা হয়েছে"
          break

        case "declare_variable":
          generatedCode = `// Variable declared from voice: ${command.bengali}
const myVariable = "Hello World";
let counter = 0;`
          response = "ভেরিয়েবল ডিক্লেয়ার করা হয়েছে"
          break

        case "add_comment":
          generatedCode = `// Comment added from voice: ${command.bengali}
// এই কোডটি ভয়েস কমান্ড থেকে তৈরি
// This code was generated from voice command`
          response = "কমেন্ট যোগ করা হয়েছে"
          break

        case "create_loop":
          generatedCode = `// Loop created from voice: ${command.bengali}
for (let i = 0; i < 10; i++) {
  console.log("Iteration: " + i);
}`
          response = "লুপ তৈরি করা হয়েছে"
          break

        case "add_condition":
          generatedCode = `// Condition added from voice: ${command.bengali}
if (condition) {
  // True case
  console.log("Condition is true");
} else {
  // False case
  console.log("Condition is false");
}`
          response = "কন্ডিশন যোগ করা হয়েছে"
          break

        default:
          response = "কমান্ড এক্সিকিউট করা হয়েছে"
          break
      }

      // Update command as executed
      setVoiceCommands((prev) =>
        prev.map((cmd) => (cmd.id === command.id ? { ...cmd, executed: true, response } : cmd)),
      )

      // Generate code if applicable
      if (generatedCode) {
        onCodeGenerate(generatedCode)
      }

      // Speak response in Bengali
      speakText(response, "bn-BD")

      onStatusUpdate(`⚡ Executed: ${command.bengali}`)
    },
    [onCodeGenerate, onStatusUpdate],
  )

  // Text-to-speech function
  const speakText = useCallback(
    (text: string, language: string = voiceSettings.language) => {
      if ("speechSynthesis" in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        utterance.volume = voiceSettings.volume / 100
        utterance.rate = voiceSettings.speed
        utterance.pitch = voiceSettings.pitch

        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => {
          setIsPlaying(false)
          onStatusUpdate("❌ Text-to-speech error")
        }

        speechSynthesisRef.current = utterance
        speechSynthesis.speak(utterance)
      }
    },
    [voiceSettings, onStatusUpdate],
  )

  // Start recording
  const startRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      const initialized = await initializeAudio()
      if (!initialized) return
    }

    try {
      setIsRecording(true)
      setIsListening(true)
      mediaRecorderRef.current?.start(1000) // Record in 1-second chunks

      // Start audio level monitoring
      const monitorAudio = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(average)
          requestAnimationFrame(monitorAudio)
        }
      }
      monitorAudio()

      onStatusUpdate("🎙️ Recording started - speak in Bengali")
    } catch (error) {
      setIsRecording(false)
      setIsListening(false)
      onStatusUpdate("❌ Failed to start recording: " + error)
    }
  }, [initializeAudio, isRecording, onStatusUpdate])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsListening(false)
      setAudioLevel(0)
      onStatusUpdate("⏹️ Recording stopped")
    }
  }, [isRecording, onStatusUpdate])

  // Stop text-to-speech
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      onStatusUpdate("🔇 Speech stopped")
    }
  }, [onStatusUpdate])

  // Quick command buttons
  const quickCommands = [
    { bengali: "কোড লিখো", english: "Write code" },
    { bengali: "ফাংশন বানাও", english: "Create function" },
    { bengali: "সেভ করো", english: "Save file" },
    { bengali: "রান করো", english: "Run code" },
  ]

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Mic className="h-4 w-4" />
          Bengali Voice System
          {isListening && (
            <Badge variant="outline" className="text-xs border-green-600 text-green-300 animate-pulse">
              Listening
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-12 w-12 rounded-full ${
              isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            size="lg"
            onClick={isPlaying ? stopSpeaking : () => speakText("আমি আপনার বাংলা ভয়েস সহায়ক")}
            disabled={!("speechSynthesis" in window)}
            className={`h-12 w-12 rounded-full ${
              isPlaying ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPlaying ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        </div>

        {/* Audio Level Indicator */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Audio Level:</Label>
              <span className="text-xs text-gray-400">{Math.round(audioLevel)}</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}

        {/* Voice Settings */}
        <div className="space-y-3">
          <Label className="text-sm text-gray-300">Voice Settings:</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Language:</Label>
              <Select
                value={voiceSettings.language}
                onValueChange={(value: "bn-BD" | "en-US") => setVoiceSettings((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="h-8 bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bn-BD">🇧🇩 Bengali</SelectItem>
                  <SelectItem value="en-US">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Volume: {voiceSettings.volume}%</Label>
              <Slider
                value={[voiceSettings.volume]}
                onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, volume: value }))}
                max={100}
                step={10}
                className="h-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Speed: {voiceSettings.speed}x</Label>
              <Slider
                value={[voiceSettings.speed]}
                onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, speed: value }))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Confidence: {voiceSettings.confidenceThreshold}%</Label>
              <Slider
                value={[voiceSettings.confidenceThreshold]}
                onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, confidenceThreshold: value }))}
                min={50}
                max={95}
                step={5}
                className="h-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Auto Execute:</Label>
            <Switch
              checked={voiceSettings.autoExecute}
              onCheckedChange={(checked) => setVoiceSettings((prev) => ({ ...prev, autoExecute: checked }))}
            />
          </div>
        </div>

        {/* Quick Commands */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Quick Commands:</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => speakText(cmd.bengali)}
                className="h-8 text-xs border-slate-600 bg-slate-700/50"
              >
                <Languages className="h-3 w-3 mr-1" />
                {cmd.bengali}
              </Button>
            ))}
          </div>
        </div>

        {/* Command History */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Recent Commands ({voiceCommands.length}):</Label>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {voiceCommands.map((command) => (
                <div key={command.id} className="border border-slate-600 rounded p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {command.executed ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-400" />
                      )}
                      <span className="text-xs text-blue-300">{command.bengali}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {command.confidence}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">{command.english}</div>
                  {command.response && <div className="text-xs text-green-300">Response: {command.response}</div>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{command.timestamp.toLocaleTimeString()}</span>
                    {!command.executed && (
                      <Button
                        size="sm"
                        onClick={() => executeVoiceCommand(command)}
                        className="h-5 text-xs bg-green-600 hover:bg-green-700"
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {voiceCommands.length === 0 && (
                <div className="text-center py-4">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <div className="text-xs text-gray-400">No voice commands yet</div>
                  <div className="text-xs text-gray-500 mt-1">Click the microphone to start recording</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${isListening ? "bg-green-900/20 border-green-700" : "bg-slate-900/20 border-slate-700"}`}>
          <Waveform className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {isListening ? (
              <>
                <strong>Listening:</strong> Speak Bengali voice commands
                <br />
                <strong>Language:</strong> {voiceSettings.language === "bn-BD" ? "Bengali" : "English"}
                <br />
                <strong>Confidence Threshold:</strong> {voiceSettings.confidenceThreshold}%
              </>
            ) : (
              <>
                <strong>Voice System Ready:</strong> Click microphone to start voice commands
                <br />
                <strong>Supported:</strong> Bengali speech recognition and text-to-speech
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default BengaliVoiceSystem
