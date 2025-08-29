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
import { FileText, Search, RefreshCw, Database, Code, Globe, Activity, Clock, Hash } from "lucide-react"

interface FileEntity {
  type: "function" | "variable" | "class" | "import" | "comment" | "bengali-text"
  name: string
  line: number
  column: number
  content: string
  language?: string
}

interface IndexedFile {
  path: string
  name: string
  extension: string
  size: number
  lastModified: Date
  language: string
  lines: number
  entities: FileEntity[]
  bengaliContent: string[]
  imports: string[]
  exports: string[]
  complexity: number
  readabilityScore: number
}

interface FileIndex {
  files: IndexedFile[]
  totalFiles: number
  totalLines: number
  languages: Record<string, number>
  bengaliFiles: number
  lastIndexed: Date
  indexingProgress: number
}

interface FileIndexerProps {
  onIndexUpdate: (index: FileIndex) => void
  onStatusUpdate: (message: string) => void
}

export function FileIndexer({ onIndexUpdate, onStatusUpdate }: FileIndexerProps) {
  const [fileIndex, setFileIndex] = useState<FileIndex>({
    files: [],
    totalFiles: 0,
    totalLines: 0,
    languages: {},
    bengaliFiles: 0,
    lastIndexed: new Date(),
    indexingProgress: 0,
  })

  const [isIndexing, setIsIndexing] = useState(false)
  const [autoIndex, setAutoIndex] = useState(true)
  const [indexBengali, setIndexBengali] = useState(true)
  const [deepAnalysis, setDeepAnalysis] = useState(true)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "html",
    "css",
    "json",
    "markdown",
  ])

  // Detect programming language from file extension
  const detectLanguage = useCallback((filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      h: "c",
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      json: "json",
      md: "markdown",
      txt: "text",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
    }
    return languageMap[ext || ""] || "unknown"
  }, [])

  // Extract entities from code content
  const extractEntities = useCallback(
    (content: string, language: string): FileEntity[] => {
      const entities: FileEntity[] = []
      const lines = content.split("\n")

      lines.forEach((line, index) => {
        const lineNumber = index + 1
        const trimmed = line.trim()

        // Skip empty lines
        if (!trimmed) return

        // Bengali text detection
        if (indexBengali && /[\u0980-\u09FF]/.test(line)) {
          entities.push({
            type: "bengali-text",
            name: "Bengali Content",
            line: lineNumber,
            column: line.indexOf(line.match(/[\u0980-\u09FF]+/)?.[0] || ""),
            content: line.match(/[\u0980-\u09FF\s]+/g)?.join(" ") || "",
            language: "bengali",
          })
        }

        // JavaScript/TypeScript specific patterns
        if (language === "javascript" || language === "typescript") {
          // Function declarations
          const functionMatch = line.match(
            /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:$$[^)]*$$\s*=>|$$[^)]*$$\s*=>\s*{|function))/,
          )
          if (functionMatch) {
            entities.push({
              type: "function",
              name: functionMatch[1] || functionMatch[2] || "anonymous",
              line: lineNumber,
              column: line.indexOf(functionMatch[0]),
              content: trimmed,
            })
          }

          // Variable declarations
          const varMatch = line.match(/(?:const|let|var)\s+(\w+)/)
          if (varMatch && !functionMatch) {
            entities.push({
              type: "variable",
              name: varMatch[1],
              line: lineNumber,
              column: line.indexOf(varMatch[0]),
              content: trimmed,
            })
          }

          // Class declarations
          const classMatch = line.match(/class\s+(\w+)/)
          if (classMatch) {
            entities.push({
              type: "class",
              name: classMatch[1],
              line: lineNumber,
              column: line.indexOf(classMatch[0]),
              content: trimmed,
            })
          }

          // Import statements
          const importMatch = line.match(/import\s+.*?from\s+['"]([^'"]+)['"]/)
          if (importMatch) {
            entities.push({
              type: "import",
              name: importMatch[1],
              line: lineNumber,
              column: 0,
              content: trimmed,
            })
          }
        }

        // Python specific patterns
        if (language === "python") {
          // Function definitions
          const funcMatch = line.match(/def\s+(\w+)/)
          if (funcMatch) {
            entities.push({
              type: "function",
              name: funcMatch[1],
              line: lineNumber,
              column: line.indexOf(funcMatch[0]),
              content: trimmed,
            })
          }

          // Class definitions
          const classMatch = line.match(/class\s+(\w+)/)
          if (classMatch) {
            entities.push({
              type: "class",
              name: classMatch[1],
              line: lineNumber,
              column: line.indexOf(classMatch[0]),
              content: trimmed,
            })
          }

          // Import statements
          const importMatch = line.match(/(?:import\s+(\w+)|from\s+(\w+)\s+import)/)
          if (importMatch) {
            entities.push({
              type: "import",
              name: importMatch[1] || importMatch[2],
              line: lineNumber,
              column: 0,
              content: trimmed,
            })
          }
        }

        // Comments (universal)
        if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
          entities.push({
            type: "comment",
            name: "Comment",
            line: lineNumber,
            column: 0,
            content: trimmed,
          })
        }
      })

      return entities
    },
    [indexBengali],
  )

  // Calculate code complexity (simplified)
  const calculateComplexity = useCallback((content: string, language: string): number => {
    let complexity = 1 // Base complexity

    // Count control flow statements
    const controlFlowPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\btry\b/g,
      /\bcatch\b/g,
      /\b&&\b/g,
      /\b\|\|\b/g,
      /\?\s*:/g,
    ]

    controlFlowPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    })

    return Math.min(complexity, 50) // Cap at 50
  }, [])

  // Calculate readability score (simplified)
  const calculateReadability = useCallback(
    (content: string, entities: FileEntity[]): number => {
      const lines = content.split("\n").filter((line) => line.trim())
      const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length
      const commentRatio = entities.filter((e) => e.type === "comment").length / Math.max(entities.length, 1)

      // Simple readability score (0-100)
      let score = 100

      // Penalize very long lines
      if (avgLineLength > 80) score -= (avgLineLength - 80) * 0.5

      // Reward comments
      score += commentRatio * 20

      // Penalize very complex code
      const complexity = calculateComplexity(content, "javascript")
      if (complexity > 10) score -= (complexity - 10) * 2

      return Math.max(0, Math.min(100, Math.round(score)))
    },
    [calculateComplexity],
  )

  // Index a single file
  const indexFile = useCallback(
    async (filename: string, content: string): Promise<IndexedFile> => {
      const language = detectLanguage(filename)
      const entities = extractEntities(content, language)
      const lines = content.split("\n")

      const bengaliContent = entities.filter((e) => e.type === "bengali-text").map((e) => e.content)

      const imports = entities.filter((e) => e.type === "import").map((e) => e.name)

      const exports = entities.filter((e) => e.type === "function" || e.type === "class").map((e) => e.name)

      return {
        path: filename,
        name: filename.split("/").pop() || filename,
        extension: filename.split(".").pop() || "",
        size: content.length,
        lastModified: new Date(),
        language,
        lines: lines.length,
        entities,
        bengaliContent,
        imports,
        exports,
        complexity: calculateComplexity(content, language),
        readabilityScore: calculateReadability(content, entities),
      }
    },
    [detectLanguage, extractEntities, calculateComplexity, calculateReadability],
  )

  // Simulate file system scanning and indexing
  const performIndexing = useCallback(async () => {
    setIsIndexing(true)
    onStatusUpdate("🔍 Starting file indexing...")

    // Simulate file discovery
    const mockFiles = [
      {
        name: "app/page.tsx",
        content: `import React from 'react'
import { Button } from '@/components/ui/button'

// আমার সোনার বাংলা - জাতীয় সংগীত
export default function HomePage() {
  const handleClick = () => {
    console.log("Hello " + "World")
  }

  return (
    <div>
      <h1>স্বাগতম আমাদের অ্যাপে</h1>
      <Button onClick={handleClick}>ক্লিক করুন</Button>
    </div>
  )
}`,
      },
      {
        name: "components/editor.tsx",
        content: `"use client"
import { useState, useEffect } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  const [content, setContent] = useState(value)
  
  useEffect(() => {
    // কোড এডিটর আপডেট
    setContent(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setContent(newValue)
    onChange(newValue)
  }

  return (
    <textarea 
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="এখানে কোড লিখুন..."
    />
  )
}`,
      },
      {
        name: "utils/helpers.py",
        content: `# Bengali text processing utilities
import re

def extract_bengali_text(text):
    """বাংলা টেক্সট এক্সট্র্যাক্ট করার ফাংশন"""
    bengali_pattern = r'[\u0980-\u09FF]+'
    return re.findall(bengali_pattern, text)

def translate_to_english(bengali_text):
    # Translation logic here
    translations = {
        "নমস্কার": "Hello",
        "ধন্যবাদ": "Thank you",
        "স্বাগতম": "Welcome"
    }
    return translations.get(bengali_text, bengali_text)

class BengaliProcessor:
    def __init__(self):
        self.cache = {}
    
    def process(self, text):
        if text in self.cache:
            return self.cache[text]
        
        result = self.analyze_text(text)
        self.cache[text] = result
        return result
    
    def analyze_text(self, text):
        # Complex analysis logic
        return {"processed": True, "text": text}`,
      },
      {
        name: "config/settings.json",
        content: `{
  "app": {
    "name": "ZombieCoder Bengali Editor",
    "version": "1.0.0",
    "language": "bn-BD"
  },
  "features": {
    "voiceCommands": true,
    "bengaliSupport": true,
    "aiAssistance": true
  },
  "ui": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "SolaimanLipi"
  }
}`,
      },
      {
        name: "README.md",
        content: `# ZombieCoder Bengali Editor

একটি আধুনিক বাংলা কোড এডিটর যা AI সহায়তা প্রদান করে।

## Features

- 🎙️ Voice commands in Bengali
- 🤖 AI-powered code suggestions  
- 📝 Bengali text processing
- 🔒 Privacy-first approach

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Usage

এডিটর চালু করতে:

\`\`\`bash
npm start
\`\`\`

বাংলা ভয়েস কমান্ড ব্যবহার করুন:
- "কোড লিখো" - Start coding
- "সেভ করো" - Save file
- "রান করো" - Run code
`,
      },
    ]

    const indexedFiles: IndexedFile[] = []
    let progress = 0

    for (const file of mockFiles) {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500))

      progress = ((indexedFiles.length + 1) / mockFiles.length) * 100
      setFileIndex((prev) => ({ ...prev, indexingProgress: progress }))
      onStatusUpdate(`📁 Indexing ${file.name}... (${Math.round(progress)}%)`)

      try {
        const indexedFile = await indexFile(file.name, file.content)
        indexedFiles.push(indexedFile)
      } catch (error) {
        onStatusUpdate(`❌ Error indexing ${file.name}: ${error}`)
      }
    }

    // Calculate statistics
    const totalLines = indexedFiles.reduce((sum, file) => sum + file.lines, 0)
    const languages = indexedFiles.reduce(
      (acc, file) => {
        acc[file.language] = (acc[file.language] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const bengaliFiles = indexedFiles.filter((file) => file.bengaliContent.length > 0).length

    const newIndex: FileIndex = {
      files: indexedFiles,
      totalFiles: indexedFiles.length,
      totalLines,
      languages,
      bengaliFiles,
      lastIndexed: new Date(),
      indexingProgress: 100,
    }

    setFileIndex(newIndex)
    onIndexUpdate(newIndex)
    setIsIndexing(false)
    onStatusUpdate(
      `✅ Indexing complete: ${indexedFiles.length} files, ${totalLines} lines, ${bengaliFiles} Bengali files`,
    )
  }, [indexFile, onIndexUpdate, onStatusUpdate])

  // Auto-index on mount
  useEffect(() => {
    if (autoIndex) {
      const timer = setTimeout(() => {
        performIndexing()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [autoIndex, performIndexing])

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "text-yellow-400",
      typescript: "text-blue-400",
      python: "text-green-400",
      java: "text-red-400",
      cpp: "text-purple-400",
      html: "text-orange-400",
      css: "text-pink-400",
      json: "text-gray-400",
      markdown: "text-indigo-400",
      bengali: "text-emerald-400",
    }
    return colors[language] || "text-gray-400"
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Database className="h-4 w-4" />
            File Indexer ({fileIndex.totalFiles} files)
          </CardTitle>
          <Button 
            size="sm" 
            onClick={performIndexing}
            disabled={isIndexing}
            className="h-7 bg-purple-600 hover:bg-purple-700"
          >
            {isIndexing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Indexing Progress */}
        {isIndexing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Indexing Progress:</Label>
              <span className="text-xs text-gray-400">{Math.round(fileIndex.indexingProgress)}%</span>
            </div>
            <Progress value={fileIndex.indexingProgress} className="h-2" />
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Auto Index:</Label>
            <Switch
              checked={autoIndex}
              onCheckedChange={setAutoIndex}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Bengali Analysis:</Label>
            <Switch
              checked={indexBengali}
              onCheckedChange={setIndexBengali}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Total Files:</span>
              <Badge variant="secondary">{fileIndex.totalFiles}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Total Lines:</span>
              <Badge variant="secondary">{fileIndex.totalLines.toLocaleString()}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Bengali Files:</span>
              <Badge variant="outline" className="border-emerald-600 text-emerald-300">
                {fileIndex.bengaliFiles}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Last Indexed:</span>
              <span className="text-xs text-gray-400">
                {fileIndex.lastIndexed.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Languages:</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(fileIndex.languages).map(([language, count]) => (
              <Badge 
                key={language} 
                variant="outline" 
                className={`text-xs border-slate-600 ${getLanguageColor(language)}`}
              >
                {language} ({count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Recent Files:</Label>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {fileIndex.files.slice(0, 10).map((file) => (
                <div key={file.path} className="flex items-center justify-between p-2 rounded bg-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Code className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-white truncate max-w-32">{file.name}</span>
                    <Badge variant="outline" className={`text-xs border-slate-600 ${getLanguageColor(file.language)}`}>
                      {file.language}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {file.lines}L
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {file.entities.length}E
                    </Badge>
                    {file.bengaliContent.length > 0 && (
                      <Badge variant="outline" className="text-xs border-emerald-600 text-emerald-300">
                        🇧🇩
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status */}
        <Alert className={`${
          fileIndex.totalFiles > 0 ? "bg-green-900/20 border-green-700" : "bg-yellow-900/20 border-yellow-700"
        }`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {fileIndex.totalFiles > 0 ? (
              <>
                <strong>Index Ready:</strong> {fileIndex.totalFiles} files indexed with {fileIndex.bengaliFiles} Bengali files
              </>
            ) : (
              <strong>No Index:</strong> Click the search button to start indexing files
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default FileIndexer
\
