"use client"

import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit, Loader2, Trash, XCircle } from "lucide-react"
import { useState } from "react"

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => Promise<void>
  onToggleComplete: (id: string) => Promise<void>
  isLoading: boolean
}

export function TaskItem({ task, onEdit, onDelete, onToggleComplete, isLoading }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(task.id)
    setIsDeleting(false)
  }

  const handleToggleComplete = async () => {
    setIsToggling(true)
    await onToggleComplete(task.id)
    setIsToggling(false)
  }

  return (
    <Card className={`transition-all ${task.completed ? "bg-muted/50" : "bg-background"}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </CardTitle>
          <Badge variant={task.completed ? "secondary" : "default"}>
            {task.completed ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
            {task.completed ? "Completed" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${task.completed ? "text-muted-foreground" : ""}`}>{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)} disabled={isLoading}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant={task.completed ? "outline" : "default"}
          size="sm"
          onClick={handleToggleComplete}
          disabled={isLoading || isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : task.completed ? (
            <XCircle className="h-4 w-4 mr-1" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          {task.completed ? "Mark Incomplete" : "Mark Complete"}
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading || isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash className="h-4 w-4 mr-1" />}
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

