"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Calendar, Clock, MapPin, Edit, Ticket, ArrowLeft, Trash, Plus } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { EventFormModal } from "@/components/dashboard/events/event-form-modal"
import { DeleteEventModal } from "@/components/dashboard/events/delete-event-modal"
import Image from "next/image"
import { TicketTypeEditModal } from "@/components/dashboard/events/ticket-type-edit-modal"
import { TicketTypeCreateModal } from "@/components/dashboard/events/ticket-type-create-modal"

interface TicketType {
    id: string
    name: string
    description: string | null
    price: number
    quantity: number
    remaining: number
}

interface Event {
    id: string
    name: string
    description: string | null
    startDate: string
    endDate: string
    location: string
    imageUrl: string | null
    isPublished: boolean
    creator: {
        id: string
        name: string
        email: string
    }
    ticketTypes: TicketType[]
    _count: {
        bookings: number
    }
}

export default function EventDetailsPage() {

    const params = useParams()
    const eventId = params.eventId
    const router = useRouter()
    const { data: session } = useSession()
    const [event, setEvent] = useState<Event | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isTicketTypeEditModalOpen, setIsTicketTypeEditModalOpen] = useState(false)
    const [isTicketTypeCreateModalOpen, setIsTicketTypeCreateModalOpen] = useState(false)
    const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null)

    const fetchEvent = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/events/${eventId}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Event not found")
                }
                throw new Error("Failed to fetch event")
            }

            const data = await response.json()
            if (!data.isPublished && session?.user?.id !== data.creator.id) {
                // Check if user has admin access
                const permissionsResponse = await fetch("/api/permissions/check?permission=admin:access")
                const permissionsData = await permissionsResponse.json()

                if (!permissionsData.hasPermission) {
                    throw new Error("You don't have permission to view this event")
                }
            }
            setEvent(data)
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }, [eventId, session])

    useEffect(() => {
        fetchEvent()
    }, [fetchEvent])

    const isCreator = session?.user?.id === event?.creator.id

    const handleEditTicketType = (ticketType: TicketType) => {
        setSelectedTicketType(ticketType)
        setIsTicketTypeEditModalOpen(true)
    }
    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">{error || "Event not found"}</h2>
                <Button asChild>
                    <Link href="/dashboard/events">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/events">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>
                </Button>

                {isCreator && (
                    <div className="flex gap-2">
                        <Button onClick={() => setIsEditModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Event
                        </Button>
                        <Button variant="outline" asChild>
                        <Link href={`/dashboard/events/${event.id}/scanner`}>
                            <Ticket className="mr-2 h-4 w-4" />
                            Scan Tickets
                        </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="relative h-64 w-full">
                            <Image
                                src={event.imageUrl || `/placeholder.svg?height=200&width=400`}
                                alt={event.name}
                                fill
                                className="object-cover rounded-t-lg"
                            />
                            {!event.isPublished && (
                                <Badge variant="secondary" className="absolute top-4 right-4">
                                    Draft
                                </Badge>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl">{event.name}</CardTitle>
                            <CardDescription>
                                <div className="flex flex-wrap gap-4 text-sm">
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
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="details">
                                <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="space-y-4 mt-4">
                                    <div>
                                        <h3 className="text-lg font-medium">About this event</h3>
                                        <p className="mt-2 whitespace-pre-line">{event.description || "No description provided."}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-medium">Date and time</h3>
                                        <div className="mt-2 space-y-1">
                                            <p>
                                                <span className="font-medium">Start:</span>{" "}
                                                {format(new Date(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                                            </p>
                                            <p>
                                                <span className="font-medium">End:</span>{" "}
                                                {format(new Date(event.endDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-medium">Location</h3>
                                        <p className="mt-2">{event.location}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-medium">Organizer</h3>
                                        <p className="mt-2">{event.creator.name}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tickets" className="space-y-4 mt-4">
                                    {isCreator && (
                                        <div className="flex justify-end mb-4">
                                            <Button onClick={() => setIsTicketTypeCreateModalOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Ticket Type
                                            </Button>
                                        </div>
                                    )}

                                    {event.ticketTypes.length === 0 ? (
                                        <p>No tickets available for this event.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {event.ticketTypes.map((ticket) => (
                                                <Card key={ticket.id}>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-center">
                                                            <CardTitle className="text-lg">{ticket.name}</CardTitle>
                                                            {isCreator && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEditTicketType(ticket)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </Button>
                                                            )}
                                                        </div>
                                                        {ticket.description && <CardDescription>{ticket.description}</CardDescription>}
                                                    </CardHeader>
                                                    <CardContent className="pb-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-2xl font-bold">Kshs {ticket.price.toFixed(2)}</div>
                                                            <Badge variant={ticket.remaining > 0 ? "outline" : "secondary"}>
                                                                {ticket.remaining > 0 ? `${ticket.remaining} remaining` : "Sold out"}
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get Tickets</CardTitle>
                            <CardDescription>
                                {event.isPublished ? "Book your tickets for this event" : "This event is not yet published"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {event.ticketTypes.length === 0 ? (
                                <p className="text-muted-foreground">No tickets available.</p>
                            ) : (
                                <div className="space-y-2">
                                    {event.ticketTypes.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{ticket.name}</p>
                                                <p className="text-sm text-muted-foreground">Kshs {ticket.price.toFixed(2)}</p>
                                            </div>
                                            <Badge variant={ticket.remaining > 0 ? "outline" : "secondary"}>
                                                {ticket.remaining > 0 ? `${ticket.remaining}/${ticket.quantity}` : "Sold out"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                asChild
                                disabled={!event.isPublished || event.ticketTypes.every((t) => t.remaining === 0)}
                            >
                                <Link href={`/dashboard/events/${event.id}/book`}>
                                    <Ticket className="mr-2 h-4 w-4" />
                                    Book Tickets
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Event Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={event.isPublished ? "default" : "secondary"}>
                                        {event.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bookings:</span>
                                    <span>{event._count.bookings}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ticket Types:</span>
                                    <span>{event.ticketTypes.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Event Modal */}
            <EventFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    fetchEvent() // Refresh event data after editing
                }}
                eventId={event.id}
                mode="edit"
            />

            {/* Delete Event Modal */}
            <DeleteEventModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    if (event._count.bookings === 0) {
                        // If successfully deleted, redirect to events page
                        router.push("/dashboard/events")
                    } else {
                        // If not deleted (has bookings), just close the modal
                        fetchEvent()
                    }
                }}
                eventId={event.id}
                eventName={event.name}
                bookingsCount={event._count.bookings}
            />

            {/* Edit Ticket Type Modal */}
            {selectedTicketType && (
                <TicketTypeEditModal
                    isOpen={isTicketTypeEditModalOpen}
                    onClose={() => {
                        setIsTicketTypeEditModalOpen(false)
                        setSelectedTicketType(null)
                        fetchEvent() // Refresh event data after editing
                    }}
                    eventId={event.id}
                    ticketType={selectedTicketType}
                />
            )}

            {/* Create Ticket Type Modal */}
            <TicketTypeCreateModal
                isOpen={isTicketTypeCreateModalOpen}
                onClose={() => {
                    setIsTicketTypeCreateModalOpen(false)
                    fetchEvent() // Refresh event data after creating
                }}
                eventId={event.id}
            />
        </div>
    )
}

