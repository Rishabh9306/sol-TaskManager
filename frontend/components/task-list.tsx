"use client"

import React, { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { Task } from "@/lib/types"
import { TaskItem } from "@/components/task-item"
import { getAllTasks, completeTask, deleteTask } from "@/utils/contract"
import { isMetaMaskInstalled, connectWallet } from "@/utils/ethers"

export function TaskList({ onEdit }: { onEdit: (task: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)

  // Check if MetaMask is installed
  useEffect(() => {
    setIsMetaMaskAvailable(isMetaMaskInstalled())
  }, [])

  // Connect to wallet and fetch tasks on component mount
  useEffect(() => {
    const initializeWallet = async () => {
      if (!isMetaMaskAvailable) return

      try {
        await connectWallet()
        setIsConnected(true)
        await fetchTasks()
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        toast.error("Failed to connect to wallet. Please make sure MetaMask is unlocked.")
        setIsLoading(false)
      }
    }

    initializeWallet()
  }, [isMetaMaskAvailable])

  // Function to fetch tasks from the blockchain
  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const blockchainTasks = await getAllTasks()
      
      // Convert blockchain tasks to the format expected by the UI
      const formattedTasks: Task[] = blockchainTasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed
      }))
      
      setTasks(formattedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to fetch tasks from the blockchain")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle task completion toggle
  const handleToggleComplete = async (id: string) => {
    try {
      await completeTask(Number(id))
      toast.success("Task status updated successfully")
      
      // Update the local state to reflect the change
      setTasks((prevTasks: Task[]) => 
        prevTasks.map((task: Task) => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      )
      
      // Refresh tasks from blockchain to ensure we have the latest state
      await fetchTasks()
    } catch (error) {
      console.error(`Error toggling task completion for task ${id}:`, error)
      toast.error("Failed to update task status")
    }
  }

  // Handle task deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteTask(Number(id))
      toast.success("Task deleted successfully")
      
      // Update the local state to remove the deleted task
      setTasks((prevTasks: Task[]) => prevTasks.filter((task: Task) => task.id !== id))
      
      // Refresh tasks from blockchain to ensure we have the latest state
      await fetchTasks()
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error)
      toast.error("Failed to delete task")
    }
  }

  // Show MetaMask not installed message
  if (!isMetaMaskAvailable) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">MetaMask Not Detected</h3>
        <p className="text-muted-foreground">
          Please install MetaMask browser extension to use this application.
        </p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Download MetaMask
        </a>
      </div>
    )
  }

  // Show wallet connection message
  if (!isConnected) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">Wallet Not Connected</h3>
        <p className="text-muted-foreground">
          Please connect your MetaMask wallet to view your tasks.
        </p>
      </div>
    )
  }

  // Show loading indicator
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading tasks from blockchain...</span>
      </div>
    )
  }

  // Show empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground">Add a new task to get started with your blockchain task manager</p>
      </div>
    )
  }

  // Show tasks
  return (
    <div className="grid gap-4 mt-8">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

