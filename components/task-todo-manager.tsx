"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Flag,
  Calendar,
  User,
  Code,
  FileText,
  Settings,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  category: "coding" | "design" | "testing" | "documentation" | "meeting" | "personal"
  createdAt: Date
  dueDate?: Date
  bengaliTitle?: string
  assignee?: string
}

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: "low" | "medium" | "high"
  category: "quick" | "daily" | "weekly" | "project"
  bengaliText?: string
}

interface TaskTodoManagerProps {
  onTaskCreate?: (task: Task) => void
  onTaskUpdate?: (task: Task) => void
  onTodoCreate?: (todo: Todo) => void
  onStatusUpdate?: (message: string) => void
}

export function TaskTodoManager({ onTaskCreate, onTaskUpdate, onTodoCreate, onStatusUpdate }: TaskTodoManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("medium")
  const [newTaskCategory, setNewTaskCategory] = useState<Task["category"]>("coding")
  const [newTodoText, setNewTodoText] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<Todo["priority"]>("medium")
  const [activeTab, setActiveTab] = useState("tasks")

  // Create new task
  const createTask = useCallback(() => {
    if (!newTaskTitle.trim()) return

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      status: "pending",
      priority: newTaskPriority,
      category: newTaskCategory,
      createdAt: new Date(),
      bengaliTitle: newTaskTitle.includes("বাংলা") ? newTaskTitle : undefined,
    }

    setTasks((prev) => [task, ...prev])
    setNewTaskTitle("")
    setNewTaskDescription("")

    onTaskCreate?.(task)
    onStatusUpdate?.(`📋 Task created: ${task.title}`)
  }, [newTaskTitle, newTaskDescription, newTaskPriority, newTaskCategory, onTaskCreate, onStatusUpdate])

  // Create new todo
  const createTodo = useCallback(() => {
    if (!newTodoText.trim()) return

    const todo: Todo = {
      id: `todo-${Date.now()}`,
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date(),
      priority: newTodoPriority,
      category: "quick",
      bengaliText: newTodoText.includes("বাংলা") ? newTodoText : undefined,
    }

    setTodos((prev) => [todo, ...prev])
    setNewTodoText("")

    onTodoCreate?.(todo)
    onStatusUpdate?.(`✅ Todo added: ${todo.text}`)
  }, [newTodoText, newTodoPriority, onTodoCreate, onStatusUpdate])

  // Update task status
  const updateTaskStatus = useCallback(
    (taskId: string, status: Task["status"]) => {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)))

      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        const updatedTask = { ...task, status }
        onTaskUpdate?.(updatedTask)
        onStatusUpdate?.(`📝 Task ${status}: ${task.title}`)
      }
    },
    [tasks, onTaskUpdate, onStatusUpdate],
  )

  // Toggle todo completion
  const toggleTodo = useCallback(
    (todoId: string) => {
      setTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo)))

      const todo = todos.find((t) => t.id === todoId)
      if (todo) {
        onStatusUpdate?.(`${todo.completed ? "❌ Unchecked" : "✅ Completed"}: ${todo.text}`)
      }
    },
    [todos, onStatusUpdate],
  )

  // Delete task
  const deleteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      if (task) {
        onStatusUpdate?.(`🗑️ Task deleted: ${task.title}`)
      }
    },
    [tasks, onStatusUpdate],
  )

  // Delete todo
  const deleteTodo = useCallback(
    (todoId: string) => {
      const todo = todos.find((t) => t.id === todoId)
      setTodos((prev) => prev.filter((t) => t.id !== todoId))

      if (todo) {
        onStatusUpdate?.(`🗑️ Todo deleted: ${todo.text}`)
      }
    },
    [todos, onStatusUpdate],
  )

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case "high":
        return <Flag className="h-3 w-3 text-orange-500" />
      case "medium":
        return <Clock className="h-3 w-3 text-yellow-500" />
      case "low":
        return <Clock className="h-3 w-3 text-green-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "coding":
        return <Code className="h-3 w-3 text-blue-400" />
      case "design":
        return <Settings className="h-3 w-3 text-purple-400" />
      case "testing":
        return <CheckSquare className="h-3 w-3 text-green-400" />
      case "documentation":
        return <FileText className="h-3 w-3 text-yellow-400" />
      case "meeting":
        return <User className="h-3 w-3 text-orange-400" />
      case "personal":
        return <Calendar className="h-3 w-3 text-pink-400" />
      default:
        return <Square className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-600 text-green-300"
      case "in-progress":
        return "border-blue-600 text-blue-300"
      case "cancelled":
        return "border-red-600 text-red-300"
      default:
        return "border-gray-600 text-gray-300"
    }
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  const todoStats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <CheckSquare className="h-4 w-4" />
          Task & Todo Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="tasks" className="text-xs">
              Tasks ({taskStats.total})
            </TabsTrigger>
            <TabsTrigger value="todos" className="text-xs">
              Todos ({todoStats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {/* Task Creation */}
            <div className="space-y-3 p-3 bg-slate-700 rounded">
              <Input
                placeholder="Task title (Bengali or English)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />

              <Textarea
                placeholder="Task description (optional)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white min-h-[60px]"
              />

              <div className="flex gap-2">
                <Select value={newTaskPriority} onValueChange={(value: Task["priority"]) => setNewTaskPriority(value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={newTaskCategory} onValueChange={(value: Task["category"]) => setNewTaskCategory(value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={createTask} disabled={!newTaskTitle.trim()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task Statistics */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-300">{taskStats.pending}</div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-yellow-300">{taskStats.inProgress}</div>
                <div className="text-gray-400">In Progress</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-green-300">{taskStats.completed}</div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-300">{taskStats.total}</div>
                <div className="text-gray-400">Total</div>
              </div>
            </div>

            {/* Tasks List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <div className="text-xs text-gray-400">No tasks yet</div>
                    <div className="text-xs text-gray-500 mt-1">Create your first task above</div>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className={`border rounded p-3 space-y-2 ${getStatusColor(task.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <span className="text-sm font-medium text-white">{task.title}</span>
                          {task.bengaliTitle && (
                            <Badge variant="outline" className="text-xs border-orange-600 text-orange-300">
                              🇧🇩
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority)}
                          <Badge variant="outline" className="text-xs border-slate-500 text-gray-300">
                            {task.status}
                          </Badge>
                        </div>
                      </div>

                      {task.description && <div className="text-xs text-gray-400">{task.description}</div>}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{task.createdAt.toLocaleDateString()}</div>
                        <div className="flex gap-1">
                          <Select
                            value={task.status}
                            onValueChange={(value: Task["status"]) => updateTaskStatus(task.id, value)}
                          >
                            <SelectTrigger className="h-6 text-xs bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTask(task.id)}
                            className="h-6 w-6 p-0 border-slate-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="todos" className="space-y-4 mt-4">
            {/* Todo Creation */}
            <div className="space-y-3 p-3 bg-slate-700 rounded">
              <div className="flex gap-2">
                <Input
                  placeholder="Quick todo (Bengali or English)..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  onKeyDown={(e) => e.key === "Enter" && createTodo()}
                />

                <Select value={newTodoPriority} onValueChange={(value: Todo["priority"]) => setNewTodoPriority(value)}>
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={createTodo} disabled={!newTodoText.trim()} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Todo Statistics */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-yellow-300">{todoStats.pending}</div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-green-300">{todoStats.completed}</div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-300">{todoStats.total}</div>
                <div className="text-gray-400">Total</div>
              </div>
            </div>

            {/* Todos List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {todos.length === 0 ? (
                  <div className="text-center py-8">
                    <Square className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <div className="text-xs text-gray-400">No todos yet</div>
                    <div className="text-xs text-gray-500 mt-1">Add a quick todo above</div>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`border rounded p-3 flex items-center justify-between ${
                        todo.completed ? "border-green-600 bg-green-900/10" : "border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="ghost" onClick={() => toggleTodo(todo.id)} className="h-6 w-6 p-0">
                          {todo.completed ? (
                            <CheckSquare className="h-4 w-4 text-green-400" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>

                        <div className="flex-1">
                          <div className={`text-sm ${todo.completed ? "line-through text-gray-500" : "text-white"}`}>
                            {todo.text}
                          </div>
                          {todo.bengaliText && (
                            <div className="text-xs text-orange-300 bengali-text">🇧🇩 {todo.bengaliText}</div>
                          )}
                          <div className="text-xs text-gray-500">{todo.createdAt.toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPriorityIcon(todo.priority)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTodo(todo.id)}
                          className="h-6 w-6 p-0 border-slate-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default TaskTodoManager
