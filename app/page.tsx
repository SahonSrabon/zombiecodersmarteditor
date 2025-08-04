"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Folder,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Terminal,
  Code,
  Brain,
  Lock,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PermissionRequest {
  id: string
  type: "scan" | "analyze" | "suggest" | "edit"
  message: string
  details: string
}

export default function BengaliPrivacyEditor() {
  const [code, setCode] = useState(`// আপনার কোড এখানে লিখুন
function greetUser(name) {
  console.log("Hello, " + name);
}

greetUser("বন্ধু");`)

  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>(["🤖 বাংলা কোডিং সহায়ক প্রস্তুত। আপনার অনুমতি ছাড়া কিছুই করবো না।"])
  const [currentPermission, setCurrentPermission] = useState<PermissionRequest | null>(null)
  const [privacySettings, setPrivacySettings] = useState({
    autoScan: false,
    voiceInput: true,
    voiceOutput: true,
    aiSuggestions: true,
    memoryStorage: false,
    internetAccess: false,
  })
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const addToConsole = (message: string) => {
    setConsoleOutput((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const requestPermission = (type: PermissionRequest["type"], message: string, details: string) => {
    setCurrentPermission({
      id: Date.now().toString(),
      type,
      message,
      details,
    })
  }

  const handlePermissionResponse = (granted: boolean) => {
    if (!currentPermission) return

    if (granted) {
      addToConsole(`✅ অনুমতি দেওয়া হয়েছে: ${currentPermission.message}`)

      // Simulate AI processing based on permission type
      setTimeout(() => {
        switch (currentPermission.type) {
          case "analyze":
            setAnalysisResult(
              "আপনার কোডে একটি সম্ভাব্য উন্নতি আছে। ৫ নম্বর লাইনে 'greetUser' ফাংশনে template literal ব্যবহার করতে পারেন।",
            )
            addToConsole("🔍 কোড বিশ্লেষণ সম্পন্ন")
            break
          case "suggest":
            addToConsole("💡 সাজেশন: console.log এর পরিবর্তে `console.log(`Hello, ${name}`)` ব্যবহার করুন")
            break
          case "scan":
            addToConsole("📁 ফোল্ডার স্ক্যান সম্পন্ন। ৩টি JavaScript ফাইল পাওয়া গেছে।")
            break
          case "edit":
            setCode(code.replace('console.log("Hello, " + name);', "console.log(`Hello, ${name}`);"))
            addToConsole("✏️ কোড আপডেট করা হয়েছে")
            break
        }
      }, 1500)
    } else {
      addToConsole(`❌ অনুমতি প্রত্যাখ্যান: ${currentPermission.message}`)
    }

    setCurrentPermission(null)
  }

  const handleVoiceInput = () => {
    if (!privacySettings.voiceInput) {
      addToConsole("❌ ভয়েস ইনপুট বন্ধ আছে। সেটিংস থেকে চালু করুন।")
      return
    }

    setIsRecording(!isRecording)

    if (!isRecording) {
      addToConsole("🎙️ ভয়েস রেকর্ডিং শুরু...")
      // Simulate voice recognition
      setTimeout(() => {
        setIsRecording(false)
        const voiceCommands = ["আমার কোডটা চেক করে দেখো", "এই ফাইলে কোনো সমস্যা আছে কি", "কোড উন্নত করার উপায় বলো"]
        const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)]
        addToConsole(`🗣️ শুনেছি: "${randomCommand}"`)

        // Request permission based on voice command
        if (randomCommand.includes("চেক") || randomCommand.includes("সমস্যা")) {
          requestPermission("analyze", "কোড বিশ্লেষণ", "আপনার বর্তমান কোড স্ক্যান করে সমস্যা খুঁজে বের করতে চাই")
        }
      }, 3000)
    } else {
      addToConsole("🛑 রেকর্ডিং বন্ধ")
    }
  }

  const handleVoiceOutput = (text: string) => {
    if (!privacySettings.voiceOutput) {
      addToConsole("❌ ভয়েস আউটপুট বন্ধ আছে")
      return
    }

    setIsSpeaking(true)
    addToConsole(`🔈 বলছি: "${text}"`)

    // Simulate TTS
    setTimeout(() => {
      setIsSpeaking(false)
      addToConsole("🔇 ভয়েস আউটপুট সম্পন্ন")
    }, 2000)
  }

  const simulateAIAnalysis = () => {
    if (!privacySettings.aiSuggestions) {
      addToConsole("❌ AI সাজেশন বন্ধ আছে")
      return
    }

    requestPermission("analyze", "কোড বিশ্লেষণ করতে চাই", "আপনার বর্তমান কোড পড়ে সমস্যা ও উন্নতির সুযোগ খুঁজে বের করবো")
  }

  const files = [
    { name: "main.js", type: "file", icon: FileText },
    { name: "utils.js", type: "file", icon: FileText },
    { name: "components", type: "folder", icon: Folder },
    { name: "styles.css", type: "file", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">বাংলা প্রাইভেসি কোড এডিটর</h1>
                <p className="text-sm text-gray-600">সম্পূর্ণ লোকাল • গোপনীয়তা প্রথম • ইউজার নিয়ন্ত্রিত</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Lock className="h-3 w-3 mr-1" />
                সুরক্ষিত
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                অফলাইন
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files">ফাইল</TabsTrigger>
                <TabsTrigger value="settings">সেটিংস</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">প্রজেক্ট ফাইল</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedFile === file.name ? "bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          if (file.type === "folder") {
                            requestPermission("scan", "ফোল্ডার স্ক্যান", `"${file.name}" ফোল্ডারের ভিতরের ফাইলগুলো দেখতে চাই`)
                          } else {
                            setSelectedFile(file.name)
                          }
                        }}
                      >
                        <file.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">নোটস</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="আপনার নোটস এখানে লিখুন..." className="min-h-[100px] text-sm" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      গোপনীয়তা নিয়ন্ত্রণ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(privacySettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {key === "autoScan" && "অটো স্ক্যান"}
                          {key === "voiceInput" && "ভয়েস ইনপুট"}
                          {key === "voiceOutput" && "ভয়েস আউটপুট"}
                          {key === "aiSuggestions" && "AI সাজেশন"}
                          {key === "memoryStorage" && "মেমোরি সংরক্ষণ"}
                          {key === "internetAccess" && "ইন্টারনেট অ্যাক্সেস"}
                        </label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    সব ডাটা আপনার কম্পিউটারেই থাকে। কোনো তথ্য বাইরে পাঠানো হয় না।
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Code Editor */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">কোড এডিটর</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={simulateAIAnalysis} className="text-xs bg-transparent">
                      <Brain className="h-3 w-3 mr-1" />
                      কোড বিশ্লেষণ
                    </Button>
                    {selectedFile && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedFile}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="// আপনার কোড এখানে লিখুন..."
                />

                {analysisResult && (
                  <Alert className="mt-4">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI বিশ্লেষণ:</strong> {analysisResult}
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            requestPermission("edit", "কোড সম্পাদনা", "সাজেস্ট করা পরিবর্তন প্রয়োগ করতে চাই")
                          }}
                        >
                          ঠিক করুন
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAnalysisResult(null)}>
                          বাতিল
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Bottom Console */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    ভয়েস সহায়ক ও কমান্ড বার
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isRecording ? "destructive" : "default"}
                      onClick={handleVoiceInput}
                      disabled={!privacySettings.voiceInput}
                    >
                      {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      {isRecording ? "বন্ধ করুন" : "কথা বলুন"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoiceOutput("আপনার কোড দেখতে ভালো লাগছে!")}
                      disabled={!privacySettings.voiceOutput || isSpeaking}
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {isSpeaking ? "বলছি..." : "শুনুন"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full border rounded p-3 bg-gray-50">
                  {consoleOutput.map((output, index) => (
                    <div key={index} className="text-xs text-gray-700 mb-1">
                      {output}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Permission Dialog */}
      <Dialog open={!!currentPermission} onOpenChange={() => setCurrentPermission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              অনুমতি প্রয়োজন
            </DialogTitle>
            <DialogDescription>{currentPermission?.message}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>বিস্তারিত:</strong> {currentPermission?.details}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePermissionResponse(false)}>
              <XCircle className="h-4 w-4 mr-2" />
              না, অনুমতি নেই
            </Button>
            <Button onClick={() => handlePermissionResponse(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              হ্যাঁ, অনুমতি দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
