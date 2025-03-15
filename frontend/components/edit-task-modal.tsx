"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"

interface EditTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onUpdate: (task: Task) => Promise<void>
  isLoading: boolean
}

export function EditTaskModal({ task, isOpen, onClose, onUpdate, isLoading }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    await onUpdate({
      ...task,
      title,
      description,
    })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="title"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading || isSubmitting}
                required
              />
            </div>
            <div className="grid gap-2">
              <Textarea
                id="description"
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading || isSubmitting}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting || !title.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

