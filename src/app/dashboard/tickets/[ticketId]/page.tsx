"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

interface Ticket {
  id: string
  ticketNumber: string
  ticketType: {
    name: string
    price: number
  }
  booking: {
    id: string
    name: string
    email: string
    event: {
      id: string
      name: string
      startDate: string
      endDate: string
      location: string
    }
  }
}

export default function TicketPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const params = useParams()
  const ticketId = params.ticketId
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Ticket not found")
          }
          throw new Error("Failed to fetch ticket")
        }

        const data = await response.json()
        setTicket(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  const handleDownload = () => {
    window.open(`/api/tickets/${ticketId}/download`, "_blank")
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Ticket not found"}</h2>
        <Button asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>
    )
  }

  // Create QR code data
  const qrCodeData = JSON.stringify({
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    eventId: ticket.booking.event.id,
  })

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/bookings/${ticket.booking.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Booking
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="border-2 print:border-0">
        <CardHeader className="bg-primary text-primary-foreground print:bg-white print:text-black">
          <CardTitle className="text-2xl">Event Ticket</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">{ticket.booking.event.name}</h3>
                <p className="text-muted-foreground">
                  {format(new Date(ticket.booking.event.startDate), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(ticket.booking.event.startDate), "h:mm a")} -
                  {format(new Date(ticket.booking.event.endDate), "h:mm a")}
                </p>
                <p className="text-muted-foreground">{ticket.booking.event.location}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium">Ticket Information</h4>
                <p>Type: {ticket.ticketType.name}</p>
                <p>Ticket #: {ticket.ticketNumber}</p>
                <p>Attendee: {ticket.booking.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={qrCodeData} size={180} level="H" />
              </div>
              <p className="text-sm text-center mt-2">Scan at event entrance</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-sm text-muted-foreground">
            <p>This ticket is valid for one-time entry only.</p>
            <p>Please present this ticket (printed or on your device) at the event entrance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

