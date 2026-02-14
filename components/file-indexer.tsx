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
import { FileText, Folder, Code, Hash, RefreshCw, Search, Database, CheckCircle, AlertTriangle } from "lucide-react"

interface FileIndex {
  filePath: string
  lines: Array<{
    number: number
    content: string
    type: "code" | "comment" | "import" | "function" | "variable" | "class" | "empty"
    entities: string[]
    references: string[]
    language: string
    indentation: number
  }>
  symbols: Array<{
    name: string
    type: "function" | "variable" | "class" | "interface" | "type"
    line: number
    scope: string
  }>
  imports: Array<{
    module: string
    items: string[]
    line: number
  }>
  metadata: {
    language: string
    totalLines: number
    codeLines: number
    commentLines: number
    emptyLines: number
    lastModified: Date
    encoding: string
    bengaliLines: number
  }
}

interface FileIndexerProps {
  onIndexUpdate?: (index: FileIndex) => void
  onStatusUpdate?: (message: string) => void
}

export function FileIndexer({ onIndexUpdate, onStatusUpdate }: FileIndexerProps) {
  const [currentIndex, setCurrentIndex] = useState<FileIndex | null>(null)
  const [isIndexing, setIsIndexing] = useState(false)
  const [autoIndex, setAutoIndex] = useState(true)
  const [indexProgress, setIndexProgress] = useState(0)
  const [indexedFiles, setIndexedFiles] = useState<string[]>([])

  // Simulate file indexing
  const performIndexing = useCallback(
    async (filePath = "current-file.tsx") => {
      setIsIndexing(true)
      setIndexProgress(0)
      onStatusUpdate?.(`🔍 Indexing ${filePath}...`)

      // Simulate indexing progress
      for (let i = 0; i <= 100; i += 10) {
        setIndexProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Create mock file index
      const mockIndex: FileIndex = {
        filePath,
        lines: [
          {
            number: 1,
            content: "// ZombieCoder Bengali Privacy Editor",
            type: "comment",
            entities: ["ZombieCoder", "Bengali", "Privacy", "Editor"],
            references: [],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 2,
            content: "// আপনার ZombieCoder AI এর সাথে integrated",
            type: "comment",
            entities: ["আপনার", "ZombieCoder", "AI", "integrated"],
            references: [],
            language: "bengali",
            indentation: 0,
          },
          {
            number: 3,
            content: "",
            type: "empty",
            entities: [],
            references: [],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 4,
            content: "import React from 'react';",
            type: "import",
            entities: ["React"],
            references: ["react"],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 5,
            content: "import { useState } from 'react';",
            type: "import",
            entities: ["useState"],
            references: ["react"],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 6,
            content: "",
            type: "empty",
            entities: [],
            references: [],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 7,
            content: "function BengaliGreeting(name) {",
            type: "function",
            entities: ["BengaliGreeting", "name"],
            references: [],
            language: "typescript",
            indentation: 0,
          },
          {
            number: 8,
            content: "  // আমার সোনার বাংলা - আমি তোমায় ভালবাসি",
            type: "comment",
            entities: ["আমার", "সোনার", "বাংলা", "আমি", "তোমায়", "ভালবাসি"],
            references: [],
            language: "bengali",
            indentation: 2,
          },
          {
            number: 9,
            content: '  console.log("Hello " + name);',
            type: "code",
            entities: ["console", "log", "Hello", "name"],
            references: ["console"],
            language: "typescript",
            indentation: 2,
          },
          {
            number: 10,
            content: "  return `নমস্কার, ${name}! ZombieCoder এ স্বাগতম!`;",
            type: "code",
            entities: ["return", "নমস্কার", "name", "ZombieCoder", "স্বাগতম"],
            references: ["name"],
            language: "typescript",
            indentation: 2,
          },
          {
            number: 11,
            content: "}",
            type: "code",
            entities: [],
            references: [],
            language: "typescript",
            indentation: 0,
          },
        ],
        symbols: [
          {
            name: "BengaliGreeting",
            type: "function",
            line: 7,
            scope: "global",
          },
          {
            name: "name",
            type: "variable",
            line: 7,
            scope: "BengaliGreeting",
          },
        ],
        imports: [
          {
            module: "react",
            items: ["React"],
            line: 4,
          },
          {
            module: "react",
            items: ["useState"],
            line: 5,
          },
        ],
        metadata: {
          language: "typescript",
          totalLines: 11,
          codeLines: 6,
          commentLines: 3,
          emptyLines: 2,
          lastModified: new Date(),
          encoding: "utf-8",
          bengaliLines: 2,
        },
      }

      setCurrentIndex(mockIndex)
      setIndexedFiles((prev) => [...prev.filter((f) => f !== filePath), filePath])
      setIsIndexing(false)
      setIndexProgress(100)

      onIndexUpdate?.(mockIndex)
      onStatusUpdate?.(
        `✅ Indexed ${filePath}: ${mockIndex.metadata.totalLines} lines, ${mockIndex.symbols.length} symbols`,
      )
    },
    [onIndexUpdate, onStatusUpdate],
  )

  // Auto-index on mount
  useEffect(() => {
    if (autoIndex) {
      performIndexing()
    }
  }, [autoIndex, performIndexing])

  const getLineTypeIcon = (type: string) => {
    switch (type) {
      case "function":
        return <Code className="h-3 w-3 text-blue-400" />
      case "import":
        return <Hash className="h-3 w-3 text-purple-400" />
      case "comment":
        return <FileText className="h-3 w-3 text-green-400" />
      case "variable":
        return <Database className="h-3 w-3 text-yellow-400" />
      case "class":
        return <Folder className="h-3 w-3 text-red-400" />
      default:
        return <FileText className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Search className="h-4 w-4" />
            File Indexer ({indexedFiles.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => performIndexing()}
            disabled={isIndexing}
            className="h-7 bg-purple-600 hover:bg-purple-700"
          >
            {isIndexing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Index Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-300">Auto Index:</Label>
          <Switch
            checked={autoIndex}
            onCheckedChange={setAutoIndex}
          />
        </div>

        {/* Indexing Progress */}
        {isIndexing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Indexing Progress</span>
              <span className="text-gray-400">{indexProgress}%</span>
            </div>
            <Progress value={indexProgress} className="h-2" />
          </div>
        )}

        {/* Index Statistics */}
        {currentIndex && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700 rounded p-2 text-center">
              <div className="text-lg font-bold text-blue-300">{currentIndex.metadata.totalLines}</div>
              <div className="text-gray-400">Total Lines</div>
            </div>
            <div className="bg-slate-700 rounded p-2 text-center">
              <div className="text-lg font-bold text-green-300">{currentIndex.symbols.length}</div>
              <div className="text-gray-400">Symbols</div>
            </div>
            <div className="bg-slate-700 rounded p-2 text-center">
              <div className="text-lg font-bold text-purple-300">{currentIndex.imports.length}</div>
              <div className="text-gray-400">Imports</div>
            </div>
            <div className="bg-slate-700 rounded p-2 text-center">
              <div className="text-lg font-bold text-orange-300">{currentIndex.metadata.bengaliLines}</div>
              <div className="text-gray-400">Bengali Lines</div>
            </div>
          </div>
        )}

        {/* Symbols List */}
        {currentIndex && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Symbols Found:</Label>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {currentIndex.symbols.map((symbol, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-700 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {getLineTypeIcon(symbol.type)}
                      <span className="text-white font-medium">{symbol.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                        {symbol.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        L{symbol.line}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Indexed Files */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Indexed Files:</Label>
          <ScrollArea className="h-20">
            <div className="space-y-1">
              {indexedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-1 text-xs text-gray-300"
                >
                  <FileText className="h-3 w-3" />
                  <span>{file}</span>
                  <CheckCircle className="h-3 w-3 text-green-400 ml-auto" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Status Alert */}
        <Alert className={`${
          currentIndex ? "bg-green-900/20 border-green-700" : "bg-yellow-900/20 border-yellow-700"
        }`}>
          {currentIndex ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription className="text-sm">
            {currentIndex ? (
              <>
                <strong>Index Ready:</strong> {currentIndex.metadata.totalLines} lines analyzed
                {currentIndex.metadata.bengaliLines > 0 && ` • ${currentIndex.metadata.bengaliLines} Bengali lines detected`}
              </>
            ) : (
              <strong>No Index:</strong> Click refresh to index current file
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default FileIndexer
