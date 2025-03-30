"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, Clock, Edit, Trash, Eye, Ticket } from "lucide-react"
import { EventFormModal } from "@/components/dashboard/events/event-form-modal"
import { DeleteEventModal } from "@/components/dashboard/events/delete-event-modal"
import Image from "next/image"

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  imageUrl: string
  isPublished: boolean
  creator: {
    id: string
    name: string
  }
  ticketTypes: {
    id: string
    name: string
    price: number
    remaining: number
  }[]
  _count: {
    bookings: number
  }
}

interface EventsListProps {
  events: Event[]
  isLoading: boolean
  emptyMessage?: string
  showManageActions?: boolean
  onEventUpdated?: () => void
}

export function EventsList({
  events,
  isLoading,
  emptyMessage = "No events found",
  showManageActions = false,
  onEventUpdated,
}: EventsListProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedEventId(event.id)
    setIsEditModalOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedEventId(event.id)
    setIsDeleteModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (events.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col h-full">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={event.imageUrl || `/placeholder.svg?height=200&width=400`}
                  alt={event.name}
                  fill
                  className="object-cover rounded-t-lg"
                />

                {!event.isPublished && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Draft
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <CardTitle className="text-xl mb-2 line-clamp-1">{event.name}</CardTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(event.startDate), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{format(new Date(event.startDate), "h:mm a")}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {event.ticketTypes.map((type) => (
                    <Badge key={type.id} variant="outline">
                      {type.name}: Kshs {type.price}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/dashboard/events/${event.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>

              {showManageActions ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditEvent(event)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeleteEvent(event)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/dashboard/events/${event.id}/book`}>
                    <Ticket className="h-4 w-4 mr-2" />
                    Book
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Event Modal */}
      {selectedEvent && (
        <EventFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEventId(null)
            setSelectedEvent(null)
            if (onEventUpdated) onEventUpdated()
          }}
          eventId={selectedEventId || ""}
          mode="edit"
        />
      )}

      {/* Delete Event Modal */}
      {selectedEvent && (
        <DeleteEventModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedEventId(null)
            setSelectedEvent(null)
            if (onEventUpdated) onEventUpdated()
          }}
          eventId={selectedEventId || ""}
          eventName={selectedEvent.name}
          bookingsCount={selectedEvent._count.bookings}
        />
      )}
    </>
  )
}

