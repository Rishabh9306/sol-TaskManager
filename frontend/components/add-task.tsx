"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"

interface AddTaskProps {
  addTask: (title: string, description: string) => Promise<void>
  isLoading: boolean
}

export function AddTask({ addTask, isLoading }: AddTaskProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    await addTask(title, description)
    setTitle("")
    setDescription("")
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading || isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading || isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || isSubmitting || !title.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

