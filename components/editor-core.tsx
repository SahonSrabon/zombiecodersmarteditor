"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Lightbulb, CheckCircle, XCircle, Zap, Code2, FileCode, GitBranch } from "lucide-react"

interface InlineSuggestion {
  id: string
  line: number
  column: number
  type: "completion" | "refactor" | "optimization" | "error-fix"
  original: string
  suggested: string
  confidence: number
  explanation: string
  bengaliExplanation: string
}

interface EditorCoreProps {
  code: string
  onCodeChange: (code: string) => void
  language: string
  onSuggestionApplied: (suggestion: InlineSuggestion) => void
}

export function EditorCore({ code, onCodeChange, language, onSuggestionApplied }: EditorCoreProps) {
  const [activeSuggestions, setActiveSuggestions] = useState<InlineSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 })

  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Simulate advanced code analysis
  const analyzeCode = useCallback((codeContent: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 20
      })
    }, 200)

    setTimeout(() => {
      const suggestions: InlineSuggestion[] = []

      // Analyze for common patterns and improvements
      const lines = codeContent.split("\n")

      lines.forEach((line, index) => {
        // Check for console.log usage
        if (line.includes("console.log") && !line.includes("//")) {
          suggestions.push({
            id: `console-${index}`,
            line: index,
            column: line.indexOf("console.log"),
            type: "refactor",
            original: line.trim(),
            suggested: line.replace("console.log", "logger.info"),
            confidence: 85,
            explanation: "Consider using a proper logging library instead of console.log",
            bengaliExplanation: "console.log এর পরিবর্তে proper logging library ব্যবহার করুন",
          })
        }

        // Check for missing error handling
        if (line.includes("fetch(") || (line.includes("await ") && !lines[index + 1]?.includes("catch"))) {
          suggestions.push({
            id: `error-${index}`,
            line: index,
            column: 0,
            type: "error-fix",
            original: line.trim(),
            suggested: `try {\n  ${line.trim()}\n} catch (error) {\n  console.error('Error:', error);\n}`,
            confidence: 92,
            explanation: "Add error handling for async operations",
            bengaliExplanation: "async operation এর জন্য error handling যোগ করুন",
          })
        }

        // Check for optimization opportunities
        if (line.includes("for (") && line.includes(".length")) {
          const arrayName = line.match(/(\w+)\.length/)?.[1]
          if (arrayName) {
            suggestions.push({
              id: `optimize-${index}`,
              line: index,
              column: 0,
              type: "optimization",
              original: line.trim(),
              suggested: line.replace(`${arrayName}.length`, `len = ${arrayName}.length; i < len`),
              confidence: 78,
              explanation: "Cache array length for better performance",
              bengaliExplanation: "ভালো performance এর জন্য array length cache করুন",
            })
          }
        }
      })

      setActiveSuggestions(suggestions.slice(0, 3)) // Show top 3 suggestions
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }, 1000)
  }, [])

  // Auto-analyze code on changes
  useEffect(() => {
    if (code.length > 50) {
      const debounceTimer = setTimeout(() => {
        analyzeCode(code)
      }, 2000)

      return () => clearTimeout(debounceTimer)
    }
  }, [code, analyzeCode])

  const applySuggestion = useCallback(
    (suggestion: InlineSuggestion) => {
      const lines = code.split("\n")
      lines[suggestion.line] = suggestion.suggested
      const newCode = lines.join("\n")

      onCodeChange(newCode)
      onSuggestionApplied(suggestion)

      // Remove applied suggestion
      setActiveSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
    },
    [code, onCodeChange, onSuggestionApplied],
  )

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setActiveSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }, [])

  return (
    <div className="space-y-4">
      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 animate-pulse text-blue-600" />
              <span className="text-sm font-medium">কোড বিশ্লেষণ চলছে...</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">Analyzing patterns, performance, and best practices...</div>
          </CardContent>
        </Card>
      )}

      {/* Active Suggestions */}
      {activeSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">AI সাজেশন ({activeSuggestions.length})</span>
          </div>

          {activeSuggestions.map((suggestion) => (
            <Alert key={suggestion.id} className="border-l-4 border-l-blue-500">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {suggestion.type === "completion" && <Code2 className="h-4 w-4 text-green-600" />}
                  {suggestion.type === "refactor" && <GitBranch className="h-4 w-4 text-blue-600" />}
                  {suggestion.type === "optimization" && <Zap className="h-4 w-4 text-yellow-600" />}
                  {suggestion.type === "error-fix" && <FileCode className="h-4 w-4 text-red-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Line {suggestion.line + 1}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confident
                        </Badge>
                        <Badge
                          variant={
                            suggestion.type === "error-fix"
                              ? "destructive"
                              : suggestion.type === "optimization"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {suggestion.type}
                        </Badge>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{suggestion.bengaliExplanation}</div>
                        <div className="text-gray-600 text-xs mt-1">{suggestion.explanation}</div>
                      </div>

                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        <div className="text-red-600 mb-1">- {suggestion.original}</div>
                        <div className="text-green-600">+ {suggestion.suggested.split("\n")[0]}...</div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => applySuggestion(suggestion)} className="h-7">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          প্রয়োগ করুন
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="h-7"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
