"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Check, X, Search, Camera, CameraOff } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { useParams } from "next/navigation"

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

export default function TicketScannerPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [facingMode, setFacingMode] = useState("environment") // Use back camera by default
  const [legacyMode, setLegacyMode] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)

  // const scannerRef = useRef<HTMLDivElement>(null)

  // Check for available cameras
  useEffect(() => {
    const checkAvailableCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setCameraError("Your browser doesn't support camera detection")
          return
        }

        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === "videoinput")

        setAvailableCameras(cameras)

        if (cameras.length === 0) {
          setCameraError("No cameras detected on your device")
        } else if (cameras.length > 0 && !selectedCamera) {
          // Select the first camera by default
          setSelectedCamera(cameras[0].deviceId)
        }
      } catch (error) {
        console.error("Error detecting cameras:", error)
        setCameraError("Failed to detect cameras")
      }
    }

    checkAvailableCameras()
  }, [selectedCamera])

  // Check if the browser supports camera access
  const checkCameraSupport = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          "Your browser doesn't support camera access. Try using a modern browser or the manual entry option.",
        )
        return false
      }

      // Test if we can access the camera
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode },
      }

      await navigator.mediaDevices.getUserMedia(constraints)
      setCameraError(null)
      return true
    } catch (error) {
      console.error("Camera access error:", error)

      if (error instanceof Error) {
        if (error.name === "NotFoundError") {
          setCameraError("No camera found. Please ensure your device has a camera.")
          toast.error("No camera found. Please use manual entry instead.")
        } else if (error.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please check your permissions.")
          toast.error("Camera access denied. Please allow camera access to scan tickets.")
        } else {
          setCameraError(`Camera error: ${error.message}`)
          toast.error(`Camera error: ${error.message}`)
        }
      } else {
        setCameraError("Could not access camera")
        toast.error("Could not access camera. Please check your camera permissions.")
      }

      return false
    }
  }

  // Update the toggleCamera function
  const toggleCamera = async () => {
    if (!isCameraActive) {
      // Check camera support before activating
      const hasSupport = await checkCameraSupport()
      if (!hasSupport) return
    }

    setIsCameraActive(!isCameraActive)
    setVerificationResult(null)
  }

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
        setEvent(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

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

    // Provide more helpful error messages based on the error type
    if (err.name === "NotAllowedError") {
      setCameraError("Camera access denied. Please allow camera access to scan tickets.")
      toast.error("Camera access denied. Please allow camera access to scan tickets.")
    } else if (err.name === "NotFoundError") {
      setCameraError("No camera found. Please ensure your device has a camera.")
      toast.error("No camera found. Please ensure your device has a camera.")
    } else if (err.name === "NotReadableError") {
      setCameraError("Camera is already in use by another application.")
      toast.error("Camera is already in use by another application.")
    } else {
      setCameraError(err.message || "Unknown camera error")
      toast.error("Camera error: " + (err.message || "Unknown error"))
    }

    // Automatically disable camera mode on error
    setIsCameraActive(false)
  }

  const verifyTicket = async (ticketId?: string, ticketNumber?: string) => {
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      // Ensure we're not sending empty strings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        eventId: eventId,
      }

      if (ticketId && ticketId.trim() !== "") {
        payload.ticketId = ticketId.trim()
      }

      if (ticketNumber && ticketNumber.trim() !== "") {
        payload.ticketNumber = ticketNumber.trim()
      }

      // Make sure we have at least one valid identifier
      if (!payload.ticketId && !payload.ticketNumber) {
        throw new Error("Please enter a valid ticket ID or ticket number")
      }

      const response = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    if (!ticketNumber || ticketNumber.trim() === "") {
      toast.error("Please enter a valid ticket number")
      return
    }

    await verifyTicket(undefined, ticketNumber.trim())
  }

  const switchCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment")
    setSelectedCamera(null) // Reset selected camera when switching facing mode
  }

  const toggleLegacyMode = () => {
    setLegacyMode(!legacyMode)
    setIsCameraActive(false)
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
          <Link href={`/dashboard/events/${eventId}`}>
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
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/10">
                    <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">{cameraError}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsCameraActive(false)}>
                      Use Manual Entry
                    </Button>
                  </div>
                ) : (
                  <>
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      constraints={{
                        video: selectedCamera
                          ? { deviceId: { exact: selectedCamera } }
                          : {
                              facingMode,
                              width: { ideal: 1280 },
                              height: { ideal: 720 },
                            },
                      }}
                      style={{ width: "100%", height: "100%" }}
                      legacyMode={legacyMode}
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none m-8 rounded"></div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {availableCameras.length > 1 && (
                  <select
                    className="px-3 py-2 rounded-md border border-input bg-background"
                    value={selectedCamera || ""}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value)
                      setIsCameraActive(false) // Reset camera to apply new device
                      setTimeout(() => setIsCameraActive(true), 100)
                    }}
                  >
                    <option value="">Select camera</option>
                    {availableCameras.map((camera, index) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                <Button onClick={switchCamera} variant="outline" disabled={legacyMode || !!selectedCamera}>
                  Switch Camera
                </Button>

                <Button onClick={toggleLegacyMode} variant="outline">
                  {legacyMode ? "Use Modern Mode" : "Use Legacy Mode"}
                </Button>

                <Button onClick={toggleCamera} variant="outline">
                  Stop Scanning
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={toggleCamera}
                className="w-full"
                disabled={availableCameras.length === 0 && !!cameraError}
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Ticket QR Code
              </Button>

              {cameraError && (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <p className="font-medium">Camera issue detected:</p>
                  <p>{cameraError}</p>
                </div>
              )}

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
                <Button type="submit" disabled={!ticketNumber.trim() || isVerifying}>
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

