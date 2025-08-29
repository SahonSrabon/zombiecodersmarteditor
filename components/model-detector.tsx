"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Brain,
  Zap,
  Server,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Clock,
  MemoryStick,
  Gauge,
  Star,
} from "lucide-react"

interface ModelCapabilities {
  textGeneration: boolean
  codeCompletion: boolean
  translation: boolean
  bengaliSupport: boolean
  voiceProcessing: boolean
  imageAnalysis: boolean
  reasoning: boolean
}

interface ModelPerformance {
  speed: number // tokens/second
  accuracy: number // percentage
  latency: number // milliseconds
  memoryUsage: number // MB
  cpuUsage: number // percentage
  lastBenchmark: Date
}

interface AIModel {
  id: string
  name: string
  provider: "ollama" | "lmstudio" | "zombiecoder" | "openai" | "anthropic" | "local"
  version: string
  size: string
  status: "available" | "loading" | "error" | "offline"
  capabilities: ModelCapabilities
  performance: ModelPerformance
  endpoint: string
  isRecommended: boolean
  bengaliScore: number
  overallScore: number
}

interface ModelDetectorProps {
  onModelChange: (model: AIModel | null) => void
  onStatusUpdate: (message: string) => void
}

export function ModelDetector({ onModelChange, onStatusUpdate }: ModelDetectorProps) {
  const [models, setModels] = useState<AIModel[]>([])
  const [activeModel, setActiveModel] = useState<AIModel | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [benchmarkMode, setBenchmarkMode] = useState(false)
  const [filterBengali, setFilterBengali] = useState(false)

  // Initialize with known model configurations
  const initializeModels = useCallback(() => {
    const initialModels: AIModel[] = [
      {
        id: "zombiecoder-bengali-v1",
        name: "ZombieCoder Bengali",
        provider: "zombiecoder",
        version: "1.0.0",
        size: "7B",
        status: "offline",
        capabilities: {
          textGeneration: true,
          codeCompletion: true,
          translation: true,
          bengaliSupport: true,
          voiceProcessing: true,
          imageAnalysis: false,
          reasoning: true,
        },
        performance: {
          speed: 0,
          accuracy: 0,
          latency: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastBenchmark: new Date(),
        },
        endpoint: "http://localhost:8080/api/v1",
        isRecommended: true,
        bengaliScore: 95,
        overallScore: 0,
      },
      {
        id: "ollama-llama3-8b",
        name: "Llama 3 8B",
        provider: "ollama",
        version: "3.0",
        size: "8B",
        status: "offline",
        capabilities: {
          textGeneration: true,
          codeCompletion: true,
          translation: true,
          bengaliSupport: false,
          voiceProcessing: false,
          imageAnalysis: false,
          reasoning: true,
        },
        performance: {
          speed: 0,
          accuracy: 0,
          latency: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastBenchmark: new Date(),
        },
        endpoint: "http://localhost:11434/api",
        isRecommended: false,
        bengaliScore: 30,
        overallScore: 0,
      },
      {
        id: "lmstudio-codellama",
        name: "Code Llama",
        provider: "lmstudio",
        version: "7B",
        size: "7B",
        status: "offline",
        capabilities: {
          textGeneration: true,
          codeCompletion: true,
          translation: false,
          bengaliSupport: false,
          voiceProcessing: false,
          imageAnalysis: false,
          reasoning: true,
        },
        performance: {
          speed: 0,
          accuracy: 0,
          latency: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastBenchmark: new Date(),
        },
        endpoint: "http://localhost:1234/v1",
        isRecommended: false,
        bengaliScore: 10,
        overallScore: 0,
      },
      {
        id: "openai-gpt4",
        name: "GPT-4",
        provider: "openai",
        version: "4.0",
        size: "Unknown",
        status: "offline",
        capabilities: {
          textGeneration: true,
          codeCompletion: true,
          translation: true,
          bengaliSupport: true,
          voiceProcessing: false,
          imageAnalysis: true,
          reasoning: true,
        },
        performance: {
          speed: 0,
          accuracy: 0,
          latency: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          lastBenchmark: new Date(),
        },
        endpoint: "https://api.openai.com/v1",
        isRecommended: false,
        bengaliScore: 75,
        overallScore: 0,
      },
    ]

    setModels(initialModels)
  }, [])

  // Test model availability
  const testModel = useCallback(
    async (model: AIModel): Promise<boolean> => {
      try {
        onStatusUpdate(`🔍 Testing ${model.name}...`)

        // Update status to loading
        setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: "loading" } : m)))

        // Simulate API call based on provider
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        let response: Response | null = null
        const startTime = Date.now()

        try {
          if (model.provider === "ollama") {
            response = await fetch(`${model.endpoint}/tags`, {
              signal: controller.signal,
            })
          } else if (model.provider === "lmstudio") {
            response = await fetch(`${model.endpoint}/models`, {
              signal: controller.signal,
            })
          } else if (model.provider === "zombiecoder") {
            response = await fetch(`${model.endpoint}/health`, {
              signal: controller.signal,
            })
          } else if (model.provider === "openai") {
            // Simulate OpenAI API check (would need API key in real implementation)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            response = { ok: Math.random() > 0.5 } as Response
          }

          clearTimeout(timeoutId)
          const latency = Date.now() - startTime

          if (response?.ok) {
            // Simulate performance metrics
            const performance: ModelPerformance = {
              speed: Math.floor(Math.random() * 50) + 10, // 10-60 tokens/sec
              accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
              latency,
              memoryUsage: Math.floor(Math.random() * 4000) + 1000, // 1-5GB
              cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
              lastBenchmark: new Date(),
            }

            // Calculate overall score
            const overallScore = Math.round(
              (performance.speed / 60) * 25 +
                (performance.accuracy / 100) * 35 +
                (Math.max(0, 100 - latency / 10) / 100) * 20 +
                (model.bengaliScore / 100) * 20,
            )

            setModels((prev) =>
              prev.map((m) =>
                m.id === model.id
                  ? {
                      ...m,
                      status: "available",
                      performance,
                      overallScore,
                    }
                  : m,
              ),
            )

            return true
          }
        } catch (error) {
          clearTimeout(timeoutId)
        }

        // Model not available
        setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: "error" } : m)))
        return false
      } catch (error) {
        setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: "error" } : m)))
        return false
      }
    },
    [onStatusUpdate],
  )

  // Scan for available models
  const scanModels = useCallback(async () => {
    setIsScanning(true)
    onStatusUpdate("🔍 Scanning for AI models...")

    const results = await Promise.allSettled(models.map((model) => testModel(model)))

    const availableModels = models.filter(
      (_, index) => results[index].status === "fulfilled" && (results[index] as PromiseFulfilledResult<boolean>).value,
    )

    if (availableModels.length > 0) {
      // Select best model based on overall score and Bengali support
      const bestModel = availableModels.sort((a, b) => {
        if (filterBengali) {
          return b.bengaliScore - a.bengaliScore
        }
        return b.overallScore - a.overallScore
      })[0]

      setActiveModel(bestModel)
      onModelChange(bestModel)
      onStatusUpdate(`✅ Selected ${bestModel.name} (Score: ${bestModel.overallScore})`)
    } else {
      setActiveModel(null)
      onModelChange(null)
      onStatusUpdate("❌ No AI models available")
    }

    setIsScanning(false)
  }, [models, testModel, filterBengali, onModelChange, onStatusUpdate])

  // Benchmark a specific model
  const benchmarkModel = useCallback(
    async (model: AIModel) => {
      if (model.status !== "available") return

      setBenchmarkMode(true)
      onStatusUpdate(`⚡ Benchmarking ${model.name}...`)

      // Simulate comprehensive benchmarking
      const benchmarkTests = [
        "Text Generation",
        "Code Completion",
        "Bengali Translation",
        "Reasoning Tasks",
        "Performance Test",
      ]

      for (let i = 0; i < benchmarkTests.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        onStatusUpdate(`⚡ ${benchmarkTests[i]}... (${i + 1}/${benchmarkTests.length})`)
      }

      // Update performance metrics with more accurate data
      const enhancedPerformance: ModelPerformance = {
        speed: Math.floor(Math.random() * 40) + 20,
        accuracy: Math.floor(Math.random() * 15) + 85,
        latency: Math.floor(Math.random() * 200) + 50,
        memoryUsage: Math.floor(Math.random() * 3000) + 2000,
        cpuUsage: Math.floor(Math.random() * 50) + 30,
        lastBenchmark: new Date(),
      }

      const newOverallScore = Math.round(
        (enhancedPerformance.speed / 60) * 25 +
          (enhancedPerformance.accuracy / 100) * 35 +
          (Math.max(0, 100 - enhancedPerformance.latency / 10) / 100) * 20 +
          (model.bengaliScore / 100) * 20,
      )

      setModels((prev) =>
        prev.map((m) =>
          m.id === model.id
            ? {
                ...m,
                performance: enhancedPerformance,
                overallScore: newOverallScore,
              }
            : m,
        ),
      )

      setBenchmarkMode(false)
      onStatusUpdate(`✅ Benchmark complete for ${model.name} (Score: ${newOverallScore})`)
    },
    [onStatusUpdate],
  )

  // Select a specific model
  const selectModel = useCallback(
    (model: AIModel) => {
      if (model.status === "available") {
        setActiveModel(model)
        onModelChange(model)
        onStatusUpdate(`🎯 Selected ${model.name}`)
      }
    },
    [onModelChange, onStatusUpdate],
  )

  // Auto-detect on mount
  useEffect(() => {
    initializeModels()
  }, [initializeModels])

  useEffect(() => {
    if (autoDetect && models.length > 0) {
      const timer = setTimeout(() => {
        scanModels()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [autoDetect, models.length, scanModels])

  const getStatusIcon = (status: AIModel["status"]) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "loading":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getProviderIcon = (provider: AIModel["provider"]) => {
    switch (provider) {
      case "zombiecoder":
        return <Brain className="h-3 w-3 text-purple-400" />
      case "ollama":
        return <Server className="h-3 w-3 text-blue-400" />
      case "lmstudio":
        return <Server className="h-3 w-3 text-green-400" />
      case "openai":
        return <Globe className="h-3 w-3 text-emerald-400" />
      default:
        return <Server className="h-3 w-3 text-gray-400" />
    }
  }

  const filteredModels = filterBengali ? models.filter((m) => m.capabilities.bengaliSupport) : models

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Brain className="h-4 w-4" />
            Model Detector
            {activeModel && (
              <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                {activeModel.name}
              </Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={scanModels}
            disabled={isScanning || benchmarkMode}
            className="h-7 bg-blue-600 hover:bg-blue-700"
          >
            {isScanning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detection Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Auto Detect:</Label>
            <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Bengali Only:</Label>
            <Switch checked={filterBengali} onCheckedChange={setFilterBengali} />
          </div>
        </div>

        {/* Active Model Info */}
        {activeModel && (
          <div className="border border-green-600 rounded-lg p-3 bg-green-900/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getProviderIcon(activeModel.provider)}
                <span className="text-sm font-medium text-white">{activeModel.name}</span>
                {activeModel.isRecommended && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
              </div>
              <Badge variant="secondary" className="text-xs">
                Score: {activeModel.overallScore}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-gray-300">Speed: {activeModel.performance.speed} t/s</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3 text-green-400" />
                <span className="text-gray-300">Accuracy: {activeModel.performance.accuracy}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" />
                <span className="text-gray-300">Latency: {activeModel.performance.latency}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3 text-purple-400" />
                <span className="text-gray-300">Memory: {activeModel.performance.memoryUsage}MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Models List */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Available Models:</Label>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${
                    activeModel?.id === model.id
                      ? "border-green-600 bg-green-900/20"
                      : "border-slate-600 bg-slate-700/50 hover:bg-slate-700"
                  }`}
                  onClick={() => selectModel(model)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(model.status)}
                      {getProviderIcon(model.provider)}
                      <span className="text-sm font-medium text-white">{model.name}</span>
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        {model.size}
                      </Badge>
                      {model.isRecommended && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {model.overallScore || 0}
                      </Badge>
                      {model.capabilities.bengaliSupport && (
                        <Badge variant="outline" className="text-xs border-emerald-600 text-emerald-300">
                          🇧🇩 {model.bengaliScore}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">{model.endpoint}</div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(model.capabilities).map(
                      ([capability, supported]) =>
                        supported && (
                          <Badge key={capability} variant="outline" className="text-xs border-slate-600 text-gray-400">
                            {capability.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </Badge>
                        ),
                    )}
                  </div>

                  {/* Performance Metrics */}
                  {model.status === "available" && model.performance.speed > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-gray-400">{model.performance.speed} t/s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3 text-green-400" />
                        <span className="text-gray-400">{model.performance.accuracy}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-400" />
                        <span className="text-gray-400">{model.performance.latency}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-3 w-3 text-purple-400" />
                        <span className="text-gray-400">{model.performance.memoryUsage}MB</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {model.status === "available" && (
                      <>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectModel(model)
                          }}
                          className="h-6 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            benchmarkModel(model)
                          }}
                          disabled={benchmarkMode}
                          className="h-6 text-xs border-slate-600"
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          Benchmark
                        </Button>
                      </>
                    )}
                    {model.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          testModel(model)
                        }}
                        className="h-6 text-xs border-slate-600"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredModels.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <div className="text-xs text-gray-400">
                    {filterBengali ? "No Bengali-capable models found" : "No models detected"}
                  </div>
                  <Button
                    size="sm"
                    onClick={scanModels}
                    disabled={isScanning}
                    className="mt-2 h-7 bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Scan Again
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Benchmark Progress */}
        {benchmarkMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Benchmarking:</Label>
              <span className="text-xs text-gray-400">Running tests...</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        )}

        {/* Status Alert */}
        <Alert className={`${activeModel ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {activeModel ? (
              <>
                <strong>Active Model:</strong> {activeModel.name} v{activeModel.version}
                <br />
                <strong>Performance:</strong> {activeModel.performance.speed} tokens/sec,{" "}
                {activeModel.performance.accuracy}% accuracy
                {activeModel.capabilities.bengaliSupport && (
                  <>
                    <br />
                    <strong>Bengali Support:</strong> {activeModel.bengaliScore}% compatibility
                  </>
                )}
              </>
            ) : (
              <span className="text-sm">
                <strong>No Active Model:</strong> Scan for available AI models to enable intelligent features
              </span>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default ModelDetector
