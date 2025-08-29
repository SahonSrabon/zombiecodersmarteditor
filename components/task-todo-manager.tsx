"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Calendar,
  Tag,
  BarChart3,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  bengaliTitle?: string
  bengaliDescription?: string
  priority: "low" | "medium" | "high" | "urgent"
  category: "coding" | "design" | "testing" | "documentation" | "meeting" | "learning" | "personal"
  status: "todo" | "in-progress" | "completed" | "cancelled"
  dueDate?: Date
  createdAt: Date
  completedAt?: Date
  tags: string[]
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  voiceCreated: boolean
}

interface TaskStats {
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  avgCompletionTime: number
}

interface TaskTodoManagerProps {
  onTaskCreate: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  onStatusUpdate: (message: string) => void
}

export function TaskTodoManager({ onTaskCreate, onTaskUpdate, onStatusUpdate }: TaskTodoManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("medium")
  const [newTaskCategory, setNewTaskCategory] = useState<Task["category"]>("coding")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskTags, setNewTaskTags] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | Task["status"]>("all")
  const [filterPriority, setFilterPriority] = useState<"all" | Task["priority"]>("all")
  const [filterCategory, setFilterCategory] = useState<"all" | Task["category"]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showBengali, setShowBengali] = useState(true)
  const [voiceIntegration, setVoiceIntegration] = useState(true)

  // Bengali translations for common tasks
  const bengaliTranslations = {
    "Write code": "কোড লিখুন",
    "Fix bug": "বাগ ঠিক করুন",
    "Create function": "ফাংশন তৈরি করুন",
    "Add comments": "কমেন্ট যোগ করুন",
    "Test application": "অ্যাপ্লিকেশন টেস্ট করুন",
    "Update documentation": "ডকুমেন্টেশন আপডেট করুন",
    "Review code": "কোড রিভিউ করুন",
    "Deploy application": "অ্যাপ্লিকেশন ডিপ্লয় করুন",
    "Design UI": "UI ডিজাইন করুন",
    "Database setup": "ডেটাবেস সেটআপ করুন",
  }

  // Task templates for quick creation
  const taskTemplates = [
    {
      title: "Write code",
      description: "Implement new feature or functionality",
      category: "coding" as const,
      priority: "medium" as const,
      tags: ["development", "feature"],
    },
    {
      title: "Fix bug",
      description: "Resolve reported issue or error",
      category: "coding" as const,
      priority: "high" as const,
      tags: ["bug", "fix"],
    },
    {
      title: "Test application",
      description: "Perform testing and quality assurance",
      category: "testing" as const,
      priority: "medium" as const,
      tags: ["testing", "qa"],
    },
    {
      title: "Update documentation",
      description: "Update project documentation and README",
      category: "documentation" as const,
      priority: "low" as const,
      tags: ["docs", "readme"],
    },
  ]

  // Calculate task statistics
  const calculateStats = useCallback((): TaskStats => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === "completed").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed",
    ).length

    const completionRate = total > 0 ? (completed / total) * 100 : 0

    const completedTasks = tasks.filter((t) => t.status === "completed" && t.actualTime)
    const avgCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) / completedTasks.length
        : 0

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate,
      avgCompletionTime,
    }
  }, [tasks])

  // Create new task
  const createTask = useCallback(() => {
    if (!newTaskTitle.trim()) {
      onStatusUpdate("❌ Task title is required")
      return
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      bengaliTitle: showBengali ? bengaliTranslations[newTaskTitle as keyof typeof bengaliTranslations] : undefined,
      bengaliDescription: showBengali ? `বিবরণ: ${newTaskDescription}` : undefined,
      priority: newTaskPriority,
      category: newTaskCategory,
      status: "todo",
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      createdAt: new Date(),
      tags: newTaskTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      voiceCreated: false,
    }

    setTasks((prev) => [task, ...prev])
    onTaskCreate(task)

    // Clear form
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskDueDate("")
    setNewTaskTags("")

    onStatusUpdate(`✅ Task created: ${task.title}`)
  }, [
    newTaskTitle,
    newTaskDescription,
    newTaskPriority,
    newTaskCategory,
    newTaskDueDate,
    newTaskTags,
    showBengali,
    bengaliTranslations,
    onTaskCreate,
    onStatusUpdate,
  ])

  // Create task from template
  const createFromTemplate = useCallback(
    (template: (typeof taskTemplates)[0]) => {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: template.title,
        description: template.description,
        bengaliTitle: showBengali ? bengaliTranslations[template.title as keyof typeof bengaliTranslations] : undefined,
        bengaliDescription: showBengali ? `বিবরণ: ${template.description}` : undefined,
        priority: template.priority,
        category: template.category,
        status: "todo",
        createdAt: new Date(),
        tags: template.tags,
        voiceCreated: false,
      }

      setTasks((prev) => [task, ...prev])
      onTaskCreate(task)
      onStatusUpdate(`✅ Task created from template: ${task.title}`)
    },
    [showBengali, bengaliTranslations, onTaskCreate, onStatusUpdate],
  )

  // Update task status
  const updateTaskStatus = useCallback(
    (taskId: string, status: Task["status"]) => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const updatedTask = {
              ...task,
              status,
              completedAt: status === "completed" ? new Date() : undefined,
              actualTime:
                status === "completed" && !task.actualTime
                  ? Math.floor(Math.random() * 120) + 30 // Simulate 30-150 minutes
                  : task.actualTime,
            }
            onTaskUpdate(updatedTask)
            return updatedTask
          }
          return task
        }),
      )

      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        onStatusUpdate(`📝 Task ${status}: ${task.title}`)
      }
    },
    [tasks, onTaskUpdate, onStatusUpdate],
  )

  // Delete task
  const deleteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      if (task) {
        onStatusUpdate(`🗑️ Task deleted: ${task.title}`)
      }
    },
    [tasks, onStatusUpdate],
  )

  // Start editing task
  const startEditing = useCallback((task: Task) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description)
    setNewTaskPriority(task.priority)
    setNewTaskCategory(task.category)
    setNewTaskDueDate(task.dueDate ? task.dueDate.toISOString().split("T")[0] : "")
    setNewTaskTags(task.tags.join(", "))
  }, [])

  // Save edited task
  const saveEditedTask = useCallback(() => {
    if (!editingTask || !newTaskTitle.trim()) return

    const updatedTask: Task = {
      ...editingTask,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      bengaliTitle: showBengali ? bengaliTranslations[newTaskTitle as keyof typeof bengaliTranslations] : undefined,
      bengaliDescription: showBengali ? `বিবরণ: ${newTaskDescription}` : undefined,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      tags: newTaskTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)))
    onTaskUpdate(updatedTask)

    // Clear form and editing state
    setEditingTask(null)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskDueDate("")
    setNewTaskTags("")

    onStatusUpdate(`✅ Task updated: ${updatedTask.title}`)
  }, [
    editingTask,
    newTaskTitle,
    newTaskDescription,
    newTaskPriority,
    newTaskCategory,
    newTaskDueDate,
    newTaskTags,
    showBengali,
    bengaliTranslations,
    onTaskUpdate,
    onStatusUpdate,
  ])

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesCategory = filterCategory === "all" || task.category === filterCategory
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.bengaliTitle && task.bengaliTitle.includes(searchQuery)) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch
  })

  // Initialize with sample tasks
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: "task-1",
        title: "Fix authentication bug",
        description: "Resolve login issues with OAuth integration",
        bengaliTitle: "অথেন্টিকেশন বাগ ঠিক করুন",
        bengaliDescription: "OAuth ইন্টিগ্রেশনের লগইন সমস্যা সমাধান করুন",
        priority: "high",
        category: "coding",
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        tags: ["bug", "auth", "oauth"],
        estimatedTime: 120,
        voiceCreated: false,
      },
      {
        id: "task-2",
        title: "Update documentation",
        description: "Add Bengali language support documentation",
        bengaliTitle: "ডকুমেন্টেশন আপডেট করুন",
        bengaliDescription: "বাংলা ভাষা সাপোর্ট ডকুমেন্টেশন যোগ করুন",
        priority: "medium",
        category: "documentation",
        status: "todo",
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        tags: ["docs", "bengali", "i18n"],
        estimatedTime: 60,
        voiceCreated: true,
      },
      {
        id: "task-3",
        title: "Design voice command UI",
        description: "Create user interface for voice commands",
        bengaliTitle: "ভয়েস কমান্ড UI ডিজাইন করুন",
        bengaliDescription: "ভয়েস কমান্ডের জন্য ইউজার ইন্টারফেস তৈরি করুন",
        priority: "medium",
        category: "design",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        completedAt: new Date(Date.now() - 86400000), // 1 day ago
        tags: ["ui", "voice", "design"],
        estimatedTime: 180,
        actualTime: 165,
        voiceCreated: false,
      },
    ]

    setTasks(sampleTasks)
  }, [])

  const stats = calculateStats()

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-red-600 text-red-300"
      case "high":
        return "border-orange-600 text-orange-300"
      case "medium":
        return "border-yellow-600 text-yellow-300"
      case "low":
        return "border-green-600 text-green-300"
      default:
        return "border-gray-600 text-gray-300"
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Square className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Task Statistics */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <BarChart3 className="h-4 w-4" />
            Task Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Tasks:</span>
                <Badge variant="secondary">{stats.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Completed:</span>
                <Badge variant="outline" className="border-green-600 text-green-300">
                  {stats.completed}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">In Progress:</span>
                <Badge variant="outline" className="border-yellow-600 text-yellow-300">
                  {stats.inProgress}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Overdue:</span>
                <Badge variant="outline" className="border-red-600 text-red-300">
                  {stats.overdue}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Completion Rate:</span>
              <span className="text-sm text-white">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Manager */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <CheckSquare className="h-4 w-4" />
              Task & Todo Manager ({filteredTasks.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch checked={showBengali} onCheckedChange={setShowBengali} />
              <Label className="text-xs text-gray-300">Bengali</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Task Creation Form */}
          <div className="space-y-3 border border-slate-600 rounded-lg p-3">
            <Label className="text-sm text-gray-300">{editingTask ? "Edit Task" : "Create New Task"}</Label>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
              <Select value={newTaskPriority} onValueChange={(value: Task["priority"]) => setNewTaskPriority(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Task description..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="bg-slate-700 border-slate-600"
              rows={2}
            />

            <div className="grid grid-cols-3 gap-3">
              <Select value={newTaskCategory} onValueChange={(value: Task["category"]) => setNewTaskCategory(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />

              <Input
                placeholder="Tags (comma separated)"
                value={newTaskTags}
                onChange={(e) => setNewTaskTags(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={editingTask ? saveEditedTask : createTask} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-3 w-3 mr-1" />
                {editingTask ? "Save Changes" : "Create Task"}
              </Button>

              {editingTask && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTask(null)
                    setNewTaskTitle("")
                    setNewTaskDescription("")
                    setNewTaskDueDate("")
                    setNewTaskTags("")
                  }}
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Quick Templates:</Label>
            <div className="grid grid-cols-2 gap-2">
              {taskTemplates.map((template, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => createFromTemplate(template)}
                  className="h-8 text-xs border-slate-600 bg-slate-700/50 justify-start"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {template.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select value={filterStatus} onValueChange={(value: "all" | Task["status"]) => setFilterStatus(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPriority}
                onValueChange={(value: "all" | Task["priority"]) => setFilterPriority(value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterCategory}
                onValueChange={(value: "all" | Task["category"]) => setFilterCategory(value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Tasks ({filteredTasks.length}):</Label>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div key={task.id} className={`border rounded-lg p-3 space-y-2 ${getPriorityColor(task.priority)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "todo" : "completed")}
                          className="h-6 w-6 p-0"
                        >
                          {getStatusIcon(task.status)}
                        </Button>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {showBengali && task.bengaliTitle ? task.bengaliTitle : task.title}
                          </div>
                          {task.voiceCreated && (
                            <Badge variant="outline" className="text-xs border-purple-600 text-purple-300">
                              🎙️ Voice
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>

                    {task.description && (
                      <div className="text-xs text-gray-400">
                        {showBengali && task.bengaliDescription ? task.bengaliDescription : task.description}
                      </div>
                    )}

                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.createdAt.toLocaleDateString()}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {task.dueDate.toLocaleDateString()}
                          </div>
                        )}
                        {task.actualTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.actualTime}min
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEditing(task)} className="h-6 w-6 p-0">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <div className="text-xs text-gray-400">
                      {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Create your first task to get started</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Status Alert */}
          <Alert
            className={`${tasks.length > 0 ? "bg-green-900/20 border-green-700" : "bg-blue-900/20 border-blue-700"}`}
          >
            <CheckSquare className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {tasks.length > 0 ? (
                <>
                  <strong>Task Manager Active:</strong> {stats.total} total tasks, {stats.completed} completed (
                  {stats.completionRate.toFixed(1)}% completion rate)
                  {showBengali && (
                    <>
                      <br />
                      <strong>Bengali Support:</strong> Enabled for task titles and descriptions
                    </>
                  )}
                  {voiceIntegration && (
                    <>
                      <br />
                      <strong>Voice Integration:</strong> Create tasks using Bengali voice commands
                    </>
                  )}
                </>
              ) : (
                <>
                  <strong>Task Manager Ready:</strong> Create your first task or use voice commands
                  <br />
                  <strong>Features:</strong> Bengali support, voice integration, priority management, and progress
                  tracking
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskTodoManager
