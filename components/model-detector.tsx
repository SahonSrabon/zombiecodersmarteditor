"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Brain, Server, Globe, RefreshCw, CheckCircle, XCircle, AlertTriangle, Zap, Database, Cpu } from "lucide-react"

interface AIModel {
  id: string
  name: string
  provider: string
  type: "local" | "cloud" | "hybrid"
  status: "available" | "unavailable" | "loading" | "error"
  size: string
  capabilities: string[]
  endpoint?: string
  modelPath?: string
  description: string
  bengaliSupport: boolean
  performance: {
    speed: number
    accuracy: number
    memory: string
  }
}

interface ModelDetectorProps {
  onModelChange?: (models: AIModel[]) => void
  onStatusUpdate?: (message: string) => void
}

export function ModelDetector({ onModelChange, onStatusUpdate }: ModelDetectorProps) {
  const [models, setModels] = useState<AIModel[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [autoDetect, setAutoDetect] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  // Initialize models
  useEffect(() => {
    const initialModels: AIModel[] = [
      {
        id: "zombiecoder-bengali",
        name: "ZombieCoder Bengali",
        provider: "ZombieCoder",
        type: "local",
        status: "unavailable",
        size: "7B",
        capabilities: ["code-generation", "bengali-chat", "voice-commands", "translation"],
        modelPath: "localhost:5000/zombiecoder-bengali",
        description: "Specialized Bengali coding assistant",
        bengaliSupport: true,
        performance: {
          speed: 85,
          accuracy: 92,
          memory: "8GB",
        },
      },
      {
        id: "ollama-codellama",
        name: "CodeLlama",
        provider: "Ollama",
        type: "local",
        status: "unavailable",
        size: "13B",
        capabilities: ["code-generation", "code-completion", "debugging"],
        modelPath: "localhost:11434/codellama",
        description: "Meta's code generation model",
        bengaliSupport: false,
        performance: {
          speed: 78,
          accuracy: 88,
          memory: "16GB",
        },
      },
      {
        id: "ollama-llama2",
        name: "Llama 2",
        provider: "Ollama",
        type: "local",
        status: "unavailable",
        size: "7B",
        capabilities: ["chat", "text-generation", "translation"],
        modelPath: "localhost:11434/llama2",
        description: "Meta's general purpose language model",
        bengaliSupport: true,
        performance: {
          speed: 82,
          accuracy: 85,
          memory: "8GB",
        },
      },
      {
        id: "lmstudio-mistral",
        name: "Mistral 7B",
        provider: "LM Studio",
        type: "local",
        status: "unavailable",
        size: "7B",
        capabilities: ["code-generation", "chat", "completion"],
        modelPath: "localhost:1234/mistral-7b",
        description: "Mistral AI's efficient language model",
        bengaliSupport: false,
        performance: {
          speed: 90,
          accuracy: 87,
          memory: "8GB",
        },
      },
      {
        id: "openai-gpt4",
        name: "GPT-4",
        provider: "OpenAI",
        type: "cloud",
        status: "unavailable",
        size: "Unknown",
        capabilities: ["code-generation", "chat", "translation", "analysis"],
        endpoint: "https://api.openai.com/v1",
        description: "OpenAI's most capable model",
        bengaliSupport: true,
        performance: {
          speed: 70,
          accuracy: 95,
          memory: "Cloud",
        },
      },
      {
        id: "anthropic-claude",
        name: "Claude 3",
        provider: "Anthropic",
        type: "cloud",
        status: "unavailable",
        size: "Unknown",
        capabilities: ["code-generation", "chat", "analysis", "reasoning"],
        endpoint: "https://api.anthropic.com/v1",
        description: "Anthropic's advanced AI assistant",
        bengaliSupport: true,
        performance: {
          speed: 75,
          accuracy: 93,
          memory: "Cloud",
        },
      },
    ]

    setModels(initialModels)
    if (autoDetect) {
      detectModels(initialModels)
    }
  }, [autoDetect])

  // Detect available models
  const detectModels = useCallback(
    async (modelList?: AIModel[]) => {
      const modelsToScan = modelList || models
      setIsScanning(true)
      setScanProgress(0)
      onStatusUpdate?.("🔍 Scanning for AI models...")

      const totalModels = modelsToScan.length
      let scannedCount = 0

      for (const model of modelsToScan) {
        setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: "loading" } : m)))

        // Simulate model detection
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate availability (higher chance for local models)
        const isAvailable =
          model.type === "local"
            ? Math.random() > 0.4 // 60% chance for local
            : Math.random() > 0.7 // 30% chance for cloud

        const newStatus = isAvailable ? "available" : "unavailable"

        setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: newStatus } : m)))

        scannedCount++
        setScanProgress((scannedCount / totalModels) * 100)

        if (isAvailable && !selectedModel) {
          setSelectedModel(model.id)
          onStatusUpdate?.(`✅ Found ${model.name} (${model.provider})`)
        }
      }

      setIsScanning(false)
      setScanProgress(100)

      const availableModels = modelsToScan.filter(
        (m) => models.find((model) => model.id === m.id)?.status === "available",
      )

      onModelChange?.(availableModels)
      onStatusUpdate?.(`🔍 Scan complete: ${availableModels.length}/${totalModels} models available`)
    },
    [models, selectedModel, onModelChange, onStatusUpdate],
  )

  // Load a specific model
  const loadModel = useCallback(
    async (modelId: string) => {
      const model = models.find((m) => m.id === modelId)
      if (!model) return

      setModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, status: "loading" } : m)))

      onStatusUpdate?.(`🔄 Loading ${model.name}...`)

      // Simulate model loading
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const success = Math.random() > 0.2 // 80% success rate
      const newStatus = success ? "available" : "error"

      setModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, status: newStatus } : m)))

      if (success) {
        setSelectedModel(modelId)
        onStatusUpdate?.(`✅ ${model.name} loaded successfully`)
      } else {
        onStatusUpdate?.(`❌ Failed to load ${model.name}`)
      }
    },
    [models, onStatusUpdate],
  )

  const getStatusIcon = (status: AIModel["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "loading":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "zombiecoder":
        return <Brain className="h-4 w-4 text-purple-400" />
      case "ollama":
        return <Server className="h-4 w-4 text-blue-400" />
      case "lm studio":
        return <Cpu className="h-4 w-4 text-green-400" />
      case "openai":
      case "anthropic":
        return <Globe className="h-4 w-4 text-orange-400" />
      default:
        return <Database className="h-4 w-4 text-gray-400" />
    }
  }

  const availableModels = models.filter((m) => m.status === "available")
  const bengaliModels = availableModels.filter((m) => m.bengaliSupport)
  const selectedModelData = models.find((m) => m.id === selectedModel)

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Brain className="h-4 w-4" />
            Model Detector ({availableModels.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => detectModels()}
            disabled={isScanning}
            className="h-7 bg-green-600 hover:bg-green-700"
          >
            {isScanning ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Detect Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-300">Auto Detect:</Label>
          <Switch
            checked={autoDetect}
            onCheckedChange={setAutoDetect}
          />
        </div>

        {/* Scanning Progress */}
        {isScanning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Scanning Models</span>
              <span className="text-gray-400">{Math.round(scanProgress)}%</span>
            </div>
            <Progress value={scanProgress} className="h-2" />
          </div>
        )}

        {/* Selected Model */}
        {selectedModelData && (
          <Alert className="bg-blue-900/20 border-blue-700">
            <Zap className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Active:</strong> {selectedModelData.name} 
              {selectedModelData.bengaliSupport && " 🇧🇩"}
            </AlertDescription>
          </Alert>
        )}

        {/* Model Statistics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-700 rounded p-2 text-center">
            <div className="text-lg font-bold text-green-300">{availableModels.length}</div>
            <div className="text-gray-400">Available</div>
          </div>
          <div className="bg-slate-700 rounded p-2 text-center">
            <div className="text-lg font-bold text-blue-300">{bengaliModels.length}</div>
            <div className="text-gray-400">Bengali</div>
          </div>
          <div className="bg-slate-700 rounded p-2 text-center">
            <div className="text-lg font-bold text-purple-300">{models.filter(m => m.type === "local").length}</div>
            <div className="text-gray-400">Local</div>
          </div>
        </div>

        {/* Models List */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Detected Models:</Label>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`border rounded p-3 space-y-2 ${
                    selectedModel === model.id
                      ? "border-blue-600 bg-blue-900/10"
                      : "border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(model.provider)}
                      <span className="text-sm font-medium text-white">
                        {model.name}
                      </span>
                      {model.bengaliSupport && (
                        <Badge variant="outline" className="text-xs border-orange-600 text-orange-300">
                          🇧🇩 Bengali
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(model.status)}
                      <Badge variant="secondary" className="text-xs">
                        {model.size}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {model.description}
                  </div>

                  <div className="text-xs text-gray-400">
                    {model.provider} • {model.type} • {model.performance.memory}
                  </div>

                  {/* Performance Bars */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Speed</span>
                      <span className="text-gray-300">{model.performance.speed}%</span>
                    </div>
                    <Progress value={model.performance.speed} className="h-1" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-gray-300">{model.performance.accuracy}%</span>
                    </div>
                    <Progress value={model.performance.accuracy} className="h-1" />
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((capability) => (
                      <Badge
                        key={capability}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {model.status === "available" ? (
                      selectedModel !== model.id && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedModel(model.id)}
                          className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => loadModel(model.id)}
                        disabled={model.status === "loading"}
                        className="h-6 text-xs bg-green-600 hover:bg-green-700"
                      >
                        {model.status === "loading" ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Brain className="h-3 w-3 mr-1" />
                        )}
                        Load
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${
          availableModels.length > 0 
            ? "bg-green-900/20 border-green-700" 
            : "bg-red-900/20 border-red-700"
        }`}>
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {availableModels.length > 0 ? (
              <>
                <strong>Models Ready:</strong> {availableModels.length} available
                {bengaliModels.length > 0 && ` • ${bengaliModels.length} with Bengali support`}
              </>
            ) : (
              <strong>No Models:</strong> Click scan to detect available AI models
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
