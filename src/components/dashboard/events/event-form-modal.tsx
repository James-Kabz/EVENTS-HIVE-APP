"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { EventForm } from "@/components/dashboard/events/event-form"
import { toast } from "sonner"


interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  eventId?: string
  mode: "create" | "edit"
}

interface EventData {
    id: string;
    name: string;
    description: string;
    // Add other properties as needed
  }

export function EventFormModal({ isOpen, onClose, eventId, mode }: EventFormModalProps) {
  const router = useRouter()
  const [event, setEvent] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(mode === "edit")

  useEffect(() => {
    if (mode === "edit" && eventId && isOpen) {
      setIsLoading(true)
      fetch(`/api/events/${eventId}`)
        .then((res) => res.json())
        .then((data) => {
          setEvent(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching event:", err)
          toast.error("Failed to load event data")
          setIsLoading(false)
        })
    } else if (mode === "create") {
      setEvent(null)
      setIsLoading(false)
    }
  }, [eventId, isOpen, mode])

  const handleSuccess = () => {
    router.refresh()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Event" : "Edit Event"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new event and add ticket types"
              : "Update event details and manage ticket types"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EventForm mode={mode} initialData={event} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}

