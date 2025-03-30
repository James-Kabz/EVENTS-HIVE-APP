"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, Clock, MapPin, ArrowLeft, XCircle, Printer, Download } from 'lucide-react'
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  totalAmount: number
  status: string
  paymentId: string | null
  createdAt: string
  event: {
    id: string
    name: string
    startDate: string
    endDate: string
    location: string
    imageUrl: string | null
  }
  tickets: {
    id: string
    ticketNumber: string
    ticketType: {
      id: string
      name: string
      price: number
    }
  }[]
}

export default function BookingDetailsPage() {
  const params = useParams()
  //   const router = useRouter();
  const id = params.id
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Booking not found")
        }
        throw new Error("Failed to fetch booking")
      }

      const data = await response.json()
      setBooking(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleCancelBooking = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to cancel booking")
      }

      toast("Booking cancelled", {
        description: "Your booking has been cancelled successfully.",
      })

      // Refresh booking data
      const bookingResponse = await fetch(`/api/bookings/${params.id}`)
      const bookingData = await bookingResponse.json()
      setBooking(bookingData)
    } catch (error) {
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        style: { backgroundColor: "#ff4d4f", color: "#fff" },
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Booking not found"}</h2>
        <Button asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>
    )
  }

  const isUpcoming = new Date(booking.event.startDate) > new Date()
  const canCancel = booking.status === "CONFIRMED" && isUpcoming

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Booking Confirmation</CardTitle>
                  <CardDescription>Booking ID: {booking.id}</CardDescription>
                </div>
                <Badge
                  variant={
                    booking.status === "CONFIRMED"
                      ? "default"
                      : booking.status === "CANCELLED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Event Details</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(booking.event.startDate), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(booking.event.startDate), "h:mm a")} -{" "}
                      {format(new Date(booking.event.endDate), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{booking.event.location}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Attendee Information</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{booking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{booking.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Date</p>
                    <p>{format(new Date(booking.createdAt), "MMMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Tickets</h3>
                <div className="mt-2 space-y-4">
                  {booking.tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{ticket.ticketType.name}</h4>
                            <p className="text-sm text-muted-foreground">Ticket #{ticket.ticketNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Kshs {ticket.ticketType.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
            {canCancel && (
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelBooking}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, Cancel Booking"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{booking.event.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(booking.event.startDate), "MMMM d, yyyy")}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                {Object.values(
                  booking.tickets.reduce(
                    (acc: Record<string, { name: string; price: number; count: number }>, ticket) => {
                      const key = ticket.ticketType.id
                      if (!acc[key]) {
                        acc[key] = {
                          name: ticket.ticketType.name,
                          price: ticket.ticketType.price,
                          count: 0,
                        }
                      }
                      acc[key].count++
                      return acc
                    },
                    {},
                  ),
                ).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.count} x {item.name}
                    </span>
                    <span>Kshs {(item.price * item.count).toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>Kshs {booking.totalAmount.toFixed(2)}</span>
                </div>

                {booking.paymentId && (
                  <div className="text-xs text-muted-foreground">Payment ID: {booking.paymentId}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}