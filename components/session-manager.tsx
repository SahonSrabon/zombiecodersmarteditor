"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Save, Download, Upload, FileText, Clock, Code, Mic, Brain, Archive, Trash2 } from "lucide-react"

interface SessionData {
  sessionId: string
  startTime: Date
  endTime?: Date
  duration?: number
  filesWorked: string[]
  totalLinesWritten: number
  totalVoiceCommands: number
  totalSuggestions: number
  learningNotes: string[]
  codeSnippets: Array<{
    id: string
    code: string
    timestamp: Date
    source: "manual" | "voice" | "ai-suggestion"
  }>
  stats: {
    productivity: number
    voiceUsage: number
    aiAssistance: number
  }
}

interface SessionManagerProps {
  currentSession: SessionData
  onSessionSave: (session: SessionData) => void
  onSessionLoad: (session: SessionData) => void
}

export function SessionManager({ currentSession, onSessionSave, onSessionLoad }: SessionManagerProps) {
  const [savedSessions, setSavedSessions] = useState<SessionData[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    totalLinesWritten: 0,
    averageProductivity: 0,
  })

  // Calculate session duration
  const getSessionDuration = useCallback((session: SessionData) => {
    const endTime = session.endTime || new Date()
    return Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60) // minutes
  }, [])

  // Calculate productivity score
  const calculateProductivity = useCallback(
    (session: SessionData) => {
      const duration = getSessionDuration(session)
      if (duration === 0) return 0

      const linesPerMinute = session.totalLinesWritten / duration
      const voiceEfficiency = session.totalVoiceCommands > 0 ? 1.2 : 1.0
      const aiEfficiency = session.totalSuggestions > 0 ? 1.1 : 1.0

      return Math.min(100, Math.round(linesPerMinute * 10 * voiceEfficiency * aiEfficiency))
    },
    [getSessionDuration],
  )

  // Auto-save functionality
  const autoSave = useCallback(() => {
    setIsAutoSaving(true)

    const updatedSession = {
      ...currentSession,
      duration: getSessionDuration(currentSession),
      stats: {
        productivity: calculateProductivity(currentSession),
        voiceUsage: Math.round(
          (currentSession.totalVoiceCommands / Math.max(1, currentSession.totalLinesWritten)) * 100,
        ),
        aiAssistance: Math.round(
          (currentSession.totalSuggestions / Math.max(1, currentSession.totalLinesWritten)) * 100,
        ),
      },
    }

    // Simulate saving to local file system
    setTimeout(() => {
      onSessionSave(updatedSession)
      setLastSaveTime(new Date())
      setIsAutoSaving(false)

      // Update saved sessions list
      setSavedSessions((prev) => {
        const existing = prev.find((s) => s.sessionId === updatedSession.sessionId)
        if (existing) {
          return prev.map((s) => (s.sessionId === updatedSession.sessionId ? updatedSession : s))
        }
        return [updatedSession, ...prev.slice(0, 9)] // Keep last 10 sessions
      })
    }, 1000)
  }, [currentSession, onSessionSave, getSessionDuration, calculateProductivity])

  // Manual save
  const manualSave = useCallback(() => {
    autoSave()
  }, [autoSave])

  // Export session data
  const exportSession = useCallback((session: SessionData) => {
    const yamlContent = `
# Bengali Copilot Editor Session
sessionId: ${session.sessionId}
startTime: ${session.startTime.toISOString()}
endTime: ${session.endTime?.toISOString() || "ongoing"}
duration: ${session.duration || 0} minutes

# Statistics
stats:
  totalLinesWritten: ${session.totalLinesWritten}
  totalVoiceCommands: ${session.totalVoiceCommands}
  totalSuggestions: ${session.totalSuggestions}
  productivity: ${session.stats?.productivity || 0}%
  voiceUsage: ${session.stats?.voiceUsage || 0}%
  aiAssistance: ${session.stats?.aiAssistance || 0}%

# Files Worked On
filesWorked:
${session.filesWorked.map((file) => `  - ${file}`).join("\n")}

# Learning Notes
learningNotes:
${session.learningNotes.map((note) => `  - "${note}"`).join("\n")}

# Code Snippets
codeSnippets:
${session.codeSnippets
  .map(
    (snippet) => `  - id: ${snippet.id}
    timestamp: ${snippet.timestamp.toISOString()}
    source: ${snippet.source}
    code: |
      ${snippet.code
        .split("\n")
        .map((line) => `      ${line}`)
        .join("\n")}`,
  )
  .join("\n")}
`

    // Simulate file download
    console.log("Exporting session to ~/Desktop/botgachh/sessions/", yamlContent)
  }, [])

  // Load session
  const loadSession = useCallback(
    (session: SessionData) => {
      onSessionLoad(session)
    },
    [onSessionLoad],
  )

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
  }, [])

  // Update stats
  useEffect(() => {
    const totalHours = savedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    const totalLines = savedSessions.reduce((acc, session) => acc + session.totalLinesWritten, 0)
    const avgProductivity =
      savedSessions.length > 0
        ? savedSessions.reduce((acc, session) => acc + (session.stats?.productivity || 0), 0) / savedSessions.length
        : 0

    setSessionStats({
      totalSessions: savedSessions.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalLinesWritten: totalLines,
      averageProductivity: Math.round(avgProductivity),
    })
  }, [savedSessions])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [autoSave])

  return (
    <div className="space-y-4">
      {/* Current Session Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            বর্তমান Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Session ID</div>
              <div className="font-mono text-xs">{currentSession.sessionId.slice(-8)}</div>
            </div>
            <div>
              <div className="text-gray-500">Duration</div>
              <div className="font-medium">{getSessionDuration(currentSession)} min</div>
            </div>
            <div>
              <div className="text-gray-500">Lines Written</div>
              <div className="font-medium">{currentSession.totalLinesWritten}</div>
            </div>
            <div>
              <div className="text-gray-500">Voice Commands</div>
              <div className="font-medium">{currentSession.totalVoiceCommands}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Productivity Score</div>
            <Progress value={calculateProductivity(currentSession)} className="h-2" />
            <div className="text-xs text-gray-500">
              {calculateProductivity(currentSession)}% - Based on lines/min, voice usage, and AI assistance
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={manualSave} disabled={isAutoSaving}>
              {isAutoSaving ? (
                <>
                  <Save className="h-3 w-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save Now
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportSession(currentSession)}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>

          {lastSaveTime && <div className="text-xs text-gray-500">Last saved: {lastSaveTime.toLocaleTimeString()}</div>}
        </CardContent>
      </Card>

      {/* Session Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Overall Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.totalSessions}</div>
              <div className="text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{sessionStats.totalHours}h</div>
              <div className="text-gray-600">Total Hours</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{sessionStats.totalLinesWritten}</div>
              <div className="text-gray-600">Lines Written</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">{sessionStats.averageProductivity}%</div>
              <div className="text-gray-600">Avg Productivity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Sessions */}
      {savedSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Saved Sessions ({savedSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {savedSessions.map((session) => (
                  <div key={session.sessionId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">Session {session.sessionId.slice(-8)}</div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {session.duration || 0}min
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {session.stats?.productivity || 0}%
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {session.totalLinesWritten} lines
                      </div>
                      <div className="flex items-center gap-1">
                        <Mic className="h-3 w-3" />
                        {session.totalVoiceCommands} voice
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        {session.totalSuggestions} AI
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {session.startTime.toLocaleDateString()} {session.startTime.toLocaleTimeString()}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => loadSession(session)}>
                        <Upload className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportSession(session)}>
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSession(session.sessionId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
