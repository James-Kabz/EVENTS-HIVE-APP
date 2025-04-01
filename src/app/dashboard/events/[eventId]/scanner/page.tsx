"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Check, X, Ticket, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"

// We'll use a dynamic import for the QR scanner to avoid SSR issues
import dynamic from "next/dynamic"
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false })

interface Event {
  id: string
  name: string
  startDate: string
  location: string
}

interface VerificationResult {
  valid: boolean
  message: string
  ticket?: {
    id: string
    ticketNumber: string
    ticketType: string
    attendee: string
    event: string
    eventDate?: string
    usedAt?: string
    status: string
  }
}

export default function TicketScannerPage({ params }: { params: { eventId: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [facingMode, setFacingMode] = useState("environment") // Use back camera by default

  const scannerRef = useRef(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.eventId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Event not found")
          }
          throw new Error("Failed to fetch event")
        }

        const data = await response.json()
        setEvent(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.eventId])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = async (data: any) => {
    if (data && data.text) {
      try {
        // Parse the QR code data
        const qrData = JSON.parse(data.text)

        // If we have a ticketId or ticketNumber, verify it
        if (qrData.ticketId || qrData.ticketNumber) {
          setIsCameraActive(false)
          await verifyTicket(qrData.ticketId, qrData.ticketNumber)
        }
      } catch (error) {
        console.error("Error parsing QR code:", error)
        toast.error("Invalid QR code format")
      }
    }
  }

  const handleError = (err: Error) => {
    console.error("QR Scanner error:", err)
    toast.error("Camera error: " + (err.message || "Unknown error"))
  }

  const verifyTicket = async (ticketId?: string, ticketNumber?: string) => {
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          ticketNumber: ticketNumber || ticketNumber,
          eventId: params.eventId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to verify ticket")
      }

      setVerificationResult(result)

      if (result.valid) {
        toast.success("Ticket verified successfully")
      } else {
        toast.error(result.message || "Invalid ticket")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify ticket")
    } finally {
      setIsVerifying(false)
      setTicketNumber("")
    }
  }

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketNumber) return

    await verifyTicket(undefined, ticketNumber)
  }

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive)
    setVerificationResult(null)
  }

  const switchCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment")
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
          <Link href={`/dashboard/events/${params.eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Scanner</CardTitle>
          <CardDescription>
            Scan tickets for {event.name} on {format(new Date(event.startDate), "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCameraActive ? (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden">
              <div ref={scannerRef}>
                <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                    facingMode,
                    }}
                    style={{ width: "100%", height: "100%" }}
                />
                </div>

                <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none m-8 rounded"></div>
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={switchCamera} variant="outline">
                  Switch Camera
                </Button>
                <Button onClick={toggleCamera} variant="outline">
                  Stop Scanning
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={toggleCamera} className="w-full">
                <Ticket className="mr-2 h-4 w-4" />
                Scan Ticket QR Code
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter ticket number manually</span>
                </div>
              </div>

              <form onSubmit={handleManualVerify} className="flex space-x-2">
                <Input
                  placeholder="Enter ticket number (e.g., TKT-12345678)"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                />
                <Button type="submit" disabled={!ticketNumber || isVerifying}>
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          )}

          {verificationResult && (
            <Card className={`mt-6 ${verificationResult.valid ? "border-green-500" : "border-red-500"}`}>
              <CardHeader className={`${verificationResult.valid ? "bg-green-50" : "bg-red-50"} rounded-t-lg`}>
                <div className="flex items-center">
                  {verificationResult.valid ? (
                    <Check className="h-6 w-6 text-green-500 mr-2" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mr-2" />
                  )}
                  <CardTitle className={verificationResult.valid ? "text-green-700" : "text-red-700"}>
                    {verificationResult.valid ? "Valid Ticket" : "Invalid Ticket"}
                  </CardTitle>
                </div>
                <CardDescription>{verificationResult.message}</CardDescription>
              </CardHeader>
              {verificationResult.ticket && (
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm font-medium">Ticket Number:</p>
                      <p className="text-sm">{verificationResult.ticket.ticketNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm font-medium">Ticket Type:</p>
                      <p className="text-sm">{verificationResult.ticket.ticketType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm font-medium">Attendee:</p>
                      <p className="text-sm">{verificationResult.ticket.attendee}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm font-medium">Event:</p>
                      <p className="text-sm">{verificationResult.ticket.event}</p>
                    </div>
                    {verificationResult.ticket.eventDate && (
                      <div className="grid grid-cols-2 gap-1">
                        <p className="text-sm font-medium">Event Date:</p>
                        <p className="text-sm">{format(new Date(verificationResult.ticket.eventDate), "PPP p")}</p>
                      </div>
                    )}
                    {verificationResult.ticket.usedAt && (
                      <div className="grid grid-cols-2 gap-1">
                        <p className="text-sm font-medium">Used At:</p>
                        <p className="text-sm">{format(new Date(verificationResult.ticket.usedAt), "PPP p")}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      <p className="text-sm font-medium">Status:</p>
                      <p className="text-sm">{verificationResult.ticket.status}</p>
                    </div>
                  </div>
                </CardContent>
              )}
              <CardFooter className="pt-0">
                <Button onClick={() => setVerificationResult(null)} variant="outline" className="w-full">
                  Scan Another Ticket
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

