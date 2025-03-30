"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, CreditCard } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  remaining: number
}

interface Event {
  id: string
  name: string
  startDate: string
  endDate: string
  location: string
  imageUrl: string | null
  ticketTypes: TicketType[]
}

const bookingFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

export default function BookEventPage() {
  const params = useParams()
  const eventId = params.eventId
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  useEffect(() => {
    // Pre-fill form with user data if available
    if (session?.user) {
      form.setValue("name", session.user.name || "")
      form.setValue("email", session.user.email || "")
    }
  }, [session, form])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Event not found")
          }
          throw new Error("Failed to fetch event")
        }

        const data = await response.json()

        // Check if event is published
        if (!data.isPublished) {
          throw new Error("This event is not available for booking")
        }

        setEvent(data)

        // Initialize selected tickets
        const initialTickets: Record<string, number> = {}
        data.ticketTypes.forEach((ticket: TicketType) => {
          initialTickets[ticket.id] = 0
        })
        setSelectedTickets(initialTickets)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleTicketChange = (ticketId: string, value: number) => {
    setSelectedTickets({
      ...selectedTickets,
      [ticketId]: value,
    })
  }

  const calculateTotal = () => {
    if (!event) return 0

    return event.ticketTypes.reduce((total, ticket) => {
      return total + ticket.price * (selectedTickets[ticket.id] || 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, count) => sum + count, 0)
  }

  async function onSubmit(data: BookingFormValues) {
    // Validate that at least one ticket is selected
    if (getTotalTickets() === 0) {
        toast("No tickets selected", {
            description: "Please select at least one ticket to continue.",
            style: { backgroundColor: "#ff4d4f", color: "#fff" },
          });
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare tickets data
      const tickets = Object.entries(selectedTickets)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity,
        }))

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: params.eventId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          tickets,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to book tickets")
      }

      const result = await response.json()

      toast("Booking successful!", {
        description: "Your tickets have been booked successfully.",
      });

      // Redirect to booking confirmation page
      router.push(`/dashboard/bookings/${result.booking.id}`)
    } catch (error) {
      toast("Booking Failed",{
        description: error instanceof Error ? error.message : "Failed to book tickets",
        style: { backgroundColor: "#ff4d4f", color: "#fff" },
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <Link href={`/dashboard/events/${event.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book Tickets</CardTitle>
              <CardDescription>Fill in your details and select tickets for {event.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Information</h3>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormDescription>Your tickets will be sent to this email</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select Tickets</h3>
                    {event.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <h4 className="font-medium">{ticket.name}</h4>
                          <p className="text-sm text-muted-foreground">Kshs {ticket.price.toFixed(2)}</p>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={selectedTickets[ticket.id] <= 0}
                            onClick={() => handleTicketChange(ticket.id, Math.max(0, selectedTickets[ticket.id] - 1))}
                          >
                            -
                          </Button>
                          <span className="w-10 text-center">{selectedTickets[ticket.id] || 0}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={selectedTickets[ticket.id] >= ticket.remaining}
                            onClick={() =>
                              handleTicketChange(
                                ticket.id,
                                Math.min(ticket.remaining, (selectedTickets[ticket.id] || 0) + 1),
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting || getTotalTickets() === 0}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Kshs {calculateTotal().toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{event.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
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
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Order Summary</h3>
                <div className="space-y-2 mt-2">
                  {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                    if (quantity <= 0) return null
                    const ticket = event.ticketTypes.find((t) => t.id === ticketId)
                    if (!ticket) return null

                    return (
                      <div key={ticketId} className="flex justify-between text-sm">
                        <span>
                          {quantity} x {ticket.name}
                        </span>
                        <span>Kshs {(ticket.price * quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}

                  {getTotalTickets() > 0 ? (
                    <>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>Kshs {calculateTotal().toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No tickets selected</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

