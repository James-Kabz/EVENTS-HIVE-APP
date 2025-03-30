"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, Clock, Eye, XCircle } from "lucide-react"
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
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  totalAmount: number
  status: string
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

interface BookingsListProps {
  bookings: Booking[]
  isLoading: boolean
  emptyMessage?: string
}

export function BookingsList({ bookings, isLoading, emptyMessage = "No bookings found" }: BookingsListProps) {
  const router = useRouter()
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancelBooking = async (bookingId: string) => {
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
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
      });

      router.refresh()
    } catch (error) {
      toast(
        "Error",
        {
          description: error instanceof Error ? error.message : `Failed to cancel booking`,
          style: { backgroundColor: "#ff4d4f", color: "#fff" }, // Custom styling for a "destructive" look
        }
      );
      
    } finally {
      setIsCancelling(false)
      setCancellingBookingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (bookings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => (
        <Card key={booking.id} className="flex flex-col h-full">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={booking.event.imageUrl || `/placeholder.svg?height=200&width=400`}
                alt={booking.event.name}
                fill
                className="h-full w-full object-cover rounded-t-lg"
              />
              <Badge
                variant={
                  booking.status === "CONFIRMED"
                    ? "default"
                    : booking.status === "CANCELLED"
                      ? "destructive"
                      : "secondary"
                }
                className="absolute top-2 right-2"
              >
                {booking.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <CardTitle className="text-xl mb-2 line-clamp-1">{booking.event.name}</CardTitle>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(booking.event.startDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{format(new Date(booking.event.startDate), "h:mm a")}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">{booking.event.location}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm">
                  <span className="font-medium">Booked for:</span> {booking.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Tickets:</span> {booking.tickets.length}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total:</span> Kshs {booking.totalAmount.toFixed(2)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Booked on:</span> {format(new Date(booking.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/dashboard/bookings/${booking.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>

            {booking.status === "CONFIRMED" && new Date(booking.event.startDate) > new Date() && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setCancellingBookingId(booking.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
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
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isCancelling}
                    >
                      {isCancelling && cancellingBookingId === booking.id ? (
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
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

