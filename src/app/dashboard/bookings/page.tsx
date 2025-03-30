"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingsList } from "@/components/dashboard/bookings/bookings-list"

interface Booking {
  event: {
    startDate: string;
  };
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings")
        if (!response.ok) throw new Error("Failed to fetch bookings")
        const data = await response.json()
        setBookings(data.bookings)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your event bookings</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View all your bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList bookings={bookings} isLoading={isLoading} emptyMessage="You don't have any bookings yet" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Bookings for upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList
                bookings={bookings.filter((booking: Booking) => new Date(booking.event.startDate) > new Date())}
                isLoading={isLoading}
                emptyMessage="You don't have any upcoming bookings"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Bookings</CardTitle>
              <CardDescription>Bookings for past events</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList
                bookings={bookings.filter((booking: Booking) => new Date(booking.event.startDate) < new Date())}
                isLoading={isLoading}
                emptyMessage="You don't have any past bookings"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

