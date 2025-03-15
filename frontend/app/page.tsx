"use client"

import { useState } from "react"
import { TaskList } from "@/components/task-list"
import { AddTask } from "@/components/add-task"
import { EditTaskModal } from "@/components/edit-task-modal"
import type { Task } from "@/lib/types"
import { addTask as addTaskToBlockchain, editTask as editTaskOnBlockchain } from "@/utils/contract"
import { toast } from "sonner"

export default function TaskManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Handle adding a new task
  const handleAddTask = async (title: string, description: string) => {
    setIsLoading(true)
    try {
      await addTaskToBlockchain(title, description)
      toast.success("Task added successfully")
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle updating a task
  const handleUpdateTask = async (task: Task) => {
    setIsLoading(true)
    try {
      await editTaskOnBlockchain(Number(task.id), task.title, task.description)
      toast.success("Task updated successfully")
      setEditingTask(null)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Blockchain Task Manager</h1>
      </div>

      <AddTask addTask={handleAddTask} isLoading={isLoading} />

      <TaskList onEdit={setEditingTask} />

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={handleUpdateTask}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

