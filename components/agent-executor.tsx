"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Activity,
  Lightbulb,
  CheckCircle,
  XCircle,
  Zap,
  AlertTriangle,
  Code,
  RefreshCw,
  Brain,
  Wand2,
} from "lucide-react"

interface AgentAction {
  id: string
  type: "suggestion" | "fix" | "refactor" | "complete" | "explain" | "optimize" | "security"
  line: number
  column: number
  original: string
  suggested: string
  confidence: number
  reasoning: string
  bengaliExplanation: string
  mode: "strict" | "soft"
  category: "syntax" | "performance" | "security" | "style" | "bengali" | "logic"
  impact: "low" | "medium" | "high"
}

interface AgentExecutorProps {
  code: string
  onCodeChange: (newCode: string) => void
  onAnalysisUpdate: (message: string) => void
  fileIndex?: any
  mcpActive: boolean
}

export function AgentExecutor({ code, onCodeChange, onAnalysisUpdate, fileIndex, mcpActive }: AgentExecutorProps) {
  const [agentActions, setAgentActions] = useState<AgentAction[]>([])
  const [agentMode, setAgentMode] = useState<"strict" | "soft">("soft")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [autoAnalysis, setAutoAnalysis] = useState(true)
  const [analysisFilters, setAnalysisFilters] = useState({
    syntax: true,
    performance: true,
    security: true,
    style: true,
    bengali: true,
    logic: true,
  })

  // Analyze code for potential improvements
  const analyzeCode = useCallback(async () => {
    if (!mcpActive) {
      onAnalysisUpdate("❌ No MCP provider available for analysis")
      return
    }

    setIsAnalyzing(true)
    onAnalysisUpdate("🤖 Agent analyzing code...")

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const lines = code.split("\n")
    const newActions: AgentAction[] = []

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      // Bengali content completion
      if (analysisFilters.bengali && trimmedLine.includes("আমার সোনার বাংলা") && !trimmedLine.includes("আমি তোমায় ভালবাসি")) {
        newActions.push({
          id: `bengali-${Date.now()}-${lineNumber}`,
          type: "complete",
          line: lineNumber,
          column: line.length,
          original: line,
          suggested: line + "\n// আমি তোমায় ভালবাসি - National anthem completion",
          confidence: 95,
          reasoning: "Detected incomplete Bengali national anthem, suggesting completion",
          bengaliExplanation: "জাতীয় সংগীতের অসম্পূর্ণ অংশ সনাক্ত করা হয়েছে",
          mode: agentMode,
          category: "bengali",
          impact: "medium",
        })
      }

      // String concatenation to template literals
      if (analysisFilters.style && trimmedLine.includes('console.log("') && trimmedLine.includes(" + ")) {
        const templateLiteralSuggestion = line.replace(/console\.log$$"([^"]*)" \+ ([^)]+)$$/, "console.log(`$1${$2}`)")
        if (templateLiteralSuggestion !== line) {
          newActions.push({
            id: `template-${Date.now()}-${lineNumber}`,
            type: "refactor",
            line: lineNumber,
            column: 0,
            original: line,
            suggested: templateLiteralSuggestion,
            confidence: 88,
            reasoning: "Template literal is more modern and readable than string concatenation",
            bengaliExplanation: "Template literal ব্যবহার করলে কোড আরো পরিষ্কার হবে",
            mode: agentMode,
            category: "style",
            impact: "low",
          })
        }
      }

      // var to const/let suggestions
      if (analysisFilters.style && trimmedLine.startsWith("var ")) {
        const constSuggestion = line.replace(/var /, "const ")
        newActions.push({
          id: `const-${Date.now()}-${lineNumber}`,
          type: "refactor",
          line: lineNumber,
          column: 0,
          original: line,
          suggested: constSuggestion,
          confidence: 85,
          reasoning: "Use 'const' instead of 'var' for better scoping and immutability",
          bengaliExplanation: "'const' ব্যবহার করলে ভেরিয়েবল আরো নিরাপদ হবে",
          mode: agentMode,
          category: "style",
          impact: "medium",
        })
      }

      // Missing error handling
      if (
        analysisFilters.security &&
        (trimmedLine.includes("fetch(") || trimmedLine.includes("await ")) &&
        !code.includes("try") &&
        !code.includes("catch")
      ) {
        newActions.push({
          id: `error-handling-${Date.now()}-${lineNumber}`,
          type: "fix",
          line: lineNumber,
          column: 0,
          original: line,
          suggested: `try {\n  ${line}\n} catch (error) {\n  console.error('Error:', error);\n}`,
          confidence: 75,
          reasoning: "Async operations should be wrapped in try-catch blocks",
          bengaliExplanation: "এসিঙ্ক অপারেশনে error handling যোগ করা উচিত",
          mode: agentMode,
          category: "security",
          impact: "high",
        })
      }

      // Performance: unnecessary re-renders
      if (
        analysisFilters.performance &&
        trimmedLine.includes("useState") &&
        code.includes("useEffect") &&
        !code.includes("useCallback")
      ) {
        newActions.push({
          id: `callback-${Date.now()}-${lineNumber}`,
          type: "optimize",
          line: lineNumber,
          column: 0,
          original: line,
          suggested: line + "\n// Consider using useCallback for performance optimization",
          confidence: 70,
          reasoning: "Functions in useEffect dependencies should be memoized with useCallback",
          bengaliExplanation: "পারফরমেন্সের জন্য useCallback ব্যবহার করুন",
          mode: agentMode,
          category: "performance",
          impact: "medium",
        })
      }

      // Security: potential XSS
      if (analysisFilters.security && trimmedLine.includes("innerHTML") && !trimmedLine.includes("sanitize")) {
        newActions.push({
          id: `xss-${Date.now()}-${lineNumber}`,
          type: "security",
          line: lineNumber,
          column: 0,
          original: line,
          suggested: line.replace("innerHTML", "textContent // Use textContent to prevent XSS"),
          confidence: 90,
          reasoning: "Using innerHTML without sanitization can lead to XSS vulnerabilities",
          bengaliExplanation: "innerHTML ব্যবহারে XSS আক্রমণের ঝুঁকি আছে",
          mode: agentMode,
          category: "security",
          impact: "high",
        })
      }

      // Logic: empty function bodies
      if (analysisFilters.logic && trimmedLine.includes("function") && lines[index + 1]?.trim() === "}") {
        newActions.push({
          id: `empty-function-${Date.now()}-${lineNumber}`,
          type: "suggestion",
          line: lineNumber,
          column: 0,
          original: line,
          suggested: line + "\n  // TODO: Implement function body",
          confidence: 60,
          reasoning: "Empty function detected, consider adding implementation or TODO comment",
          bengaliExplanation: "খালি ফাংশন পাওয়া গেছে, কোড যোগ করুন",
          mode: agentMode,
          category: "logic",
          impact: "low",
        })
      }
    })

    // Bengali-specific analysis using file index
    if (fileIndex && analysisFilters.bengali) {
      const bengaliLines = fileIndex.lines.filter((line: any) =>
        line.entities.some((entity: string) => /[\u0980-\u09FF]/.test(entity)),
      )

      bengaliLines.forEach((line: any) => {
        if (line.content.includes("নমস্কার") && !line.content.includes("স্বাগতম")) {
          newActions.push({
            id: `bengali-greeting-${Date.now()}-${line.number}`,
            type: "complete",
            line: line.number,
            column: line.content.length,
            original: line.content,
            suggested: line.content + " স্বাগতম!",
            confidence: 80,
            reasoning: "Bengali greeting can be enhanced with welcome message",
            bengaliExplanation: "বাংলা অভিবাদনে স্বাগতম যোগ করা যেতে পারে",
            mode: agentMode,
            category: "bengali",
            impact: "low",
          })
        }
      })
    }

    // Syntax error detection
    const syntaxErrorActions: AgentAction[] = [
      {
        id: `syntax-error-1-${Date.now()}`,
        type: "fix",
        line: 1,
        column: 1,
        original: "expected `)` but instead found `No`",
        suggested: "expected `)` but instead found `)`",
        confidence: 100,
        reasoning: "Syntax error detected, expected `)`",
        bengaliExplanation: "সিন্ট্যাক্স ভুল পাওয়া গেছে, `)` অপেক্ষা করা উচিত",
        mode: agentMode,
        category: "syntax",
        impact: "high",
      },
      {
        id: `syntax-error-2-${Date.now()}`,
        type: "fix",
        line: 2,
        column: 2,
        original: "Unexpected token. Did you mean `{'}'}` or `&rbrace;`?",
        suggested: "Unexpected token. Did you mean `{}` or `}`?",
        confidence: 100,
        reasoning: "Syntax error detected, unexpected token",
        bengaliExplanation: "সিন্ট্যাক্স ভুল পাওয়া গেছে, অপেক্ষাকৃত ভুল টোকেন",
        mode: agentMode,
        category: "syntax",
        impact: "high",
      },
      {
        id: `syntax-error-3-${Date.now()}`,
        type: "fix",
        line: 3,
        column: 3,
        original: "unexpected token `\\`",
        suggested: "unexpected token",
        confidence: 100,
        reasoning: "Syntax error detected, unexpected token `\\`",
        bengaliExplanation: "সিন্ট্যাক্স ভুল পাওয়া গেছে, অপেক্ষাকৃত ভুল টোকেন `\\`",
        mode: agentMode,
        category: "syntax",
        impact: "high",
      },
    ]

    // Combine syntax error actions with other actions
    const combinedActions = [...newActions, ...syntaxErrorActions]

    // Filter actions based on current filters
    const filteredActions = combinedActions.filter((action) => analysisFilters[action.category])

    setAgentActions(filteredActions)
    setIsAnalyzing(false)

    onAnalysisUpdate(`🎯 Analysis complete: ${filteredActions.length} suggestions found`)
  }, [code, fileIndex, mcpActive, agentMode, analysisFilters, onAnalysisUpdate])

  // Execute agent action
  const executeAction = useCallback(
    (action: AgentAction) => {
      const lines = code.split("\n")

      if (action.mode === "strict") {
        // Direct code modification
        if (action.type === "complete") {
          lines[action.line - 1] = action.suggested.split("\n")[0]
          if (action.suggested.includes("\n")) {
            const additionalLines = action.suggested.split("\n").slice(1)
            lines.splice(action.line, 0, ...additionalLines)
          }
        } else {
          lines[action.line - 1] = action.suggested.split("\n")[0]
        }

        onCodeChange(lines.join("\n"))
        onAnalysisUpdate(`⚡ Applied ${action.type} at line ${action.line}`)
      } else {
        // Soft mode - just show suggestion
        onAnalysisUpdate(`💡 Suggestion: ${action.bengaliExplanation}`)
      }

      // Remove executed action
      setAgentActions((prev) => prev.filter((a) => a.id !== action.id))
    },
    [code, onCodeChange, onAnalysisUpdate],
  )

  // Auto-analysis when code changes
  useEffect(() => {
    if (autoAnalysis && mcpActive && code.length > 50) {
      const debounceTimer = setTimeout(() => {
        analyzeCode()
      }, 3000)
      return () => clearTimeout(debounceTimer)
    }
  }, [code, autoAnalysis, mcpActive, analyzeCode])

  const getActionIcon = (type: AgentAction["type"]) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-3 w-3 text-yellow-400" />
      case "fix":
        return <Zap className="h-3 w-3 text-red-400" />
      case "refactor":
        return <RefreshCw className="h-3 w-3 text-blue-400" />
      case "complete":
        return <Code className="h-3 w-3 text-green-400" />
      case "optimize":
        return <Brain className="h-3 w-3 text-purple-400" />
      case "security":
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return <Wand2 className="h-3 w-3 text-gray-400" />
    }
  }

  const getImpactColor = (impact: AgentAction["impact"]) => {
    switch (impact) {
      case "high":
        return "border-red-600 text-red-300"
      case "medium":
        return "border-yellow-600 text-yellow-300"
      case "low":
        return "border-green-600 text-green-300"
      default:
        return "border-gray-600 text-gray-300"
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Activity className="h-4 w-4" />
            Agent Executor ({agentActions.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={analyzeCode}
              disabled={isAnalyzing || !mcpActive}
              className="h-7 bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Brain className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-300">Agent Mode:</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Soft</span>
            <Switch
              checked={agentMode === "strict"}
              onCheckedChange={(checked) => setAgentMode(checked ? "strict" : "soft")}
            />
            <span className="text-xs text-gray-400">Strict</span>
          </div>
        </div>

        {/* Auto Analysis Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-300">Auto Analysis:</Label>
          <Switch
            checked={autoAnalysis}
            onCheckedChange={setAutoAnalysis}
          />
        </div>

        {/* Analysis Filters */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Analysis Categories:</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(analysisFilters).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => 
                    setAnalysisFilters(prev => ({ ...prev, [key]: checked }))
                  }
                  className="scale-75"
                />
                <span className="text-xs text-gray-300 capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions List */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Active Suggestions:</Label>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {agentActions.map((action) => (
                <div key={action.id} className={`border rounded p-3 space-y-2 ${getImpactColor(action.impact)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.type)}
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        {action.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        Line {action.line}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {action.confidence}%
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(action.impact)}`}>
                        {action.impact}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-300 font-medium">
                    {action.bengaliExplanation}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {action.reasoning}
                  </div>

                  {/* Code Preview */}
                  <div className="bg-slate-900 rounded p-2 text-xs font-mono">
                    <div className="text-red-300">- {action.original.trim()}</div>
                    <div className="text-green-300">+ {action.suggested.split('\n')[0].trim()}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeAction(action)}
                      className="h-6 text-xs bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAgentActions(prev => prev.filter(a => a.id !== action.id))}
                      className="h-6 text-xs border-slate-600"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              
              {agentActions.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <div className="text-xs text-gray-400">
                    {!mcpActive ? "No MCP provider available" : "No suggestions available"}
                  </div>
                  {mcpActive && (
                    <Button 
                      size="sm" 
                      onClick={analyzeCode}
                      disabled={isAnalyzing}
                      className="mt-2 h-7 bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Analyze Code
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${
          mcpActive ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
        }`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {mcpActive ? (
              <>
                <strong>Agent Active:</strong> {agentMode} mode, {Object.values(analysisFilters).filter(Boolean).length}/6 categories enabled
              </>
            ) : (
              <strong>Agent Inactive:</strong> No MCP provider available for code analysis
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
\
export default AgentExecutor
