"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionGate } from "@/components/auth/permission-gate"
import { EventsList } from "@/components/dashboard/events/events-list"
import { EventFormModal } from "@/components/dashboard/events/event-form-modal"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"

export default function EventsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()

        setEvents(data.events)

        // Filter my events
        if (session?.user?.id) {
          setMyEvents(data.events.filter((event: any) => event.creator.id === session.user.id))
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [session])

  const refreshEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/events")
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()

      setEvents(data.events)

      // Filter my events
      if (session?.user?.id) {
        setMyEvents(data.events.filter((event: any) => event.creator.id === session.user.id))
      }
    } catch (error) {
      console.error("Error refreshing events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage and browse events</p>
        </div>
        <PermissionGate permission="events:create">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </PermissionGate>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>Browse all published events</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsList
                events={events}
                isLoading={isLoading}
                emptyMessage="No events found"
                onEventUpdated={refreshEvents}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Events</CardTitle>
              <CardDescription>Events you have created</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsList
                events={myEvents}
                isLoading={isLoading}
                emptyMessage="You haven't created any events yet"
                showManageActions
                onEventUpdated={refreshEvents}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events happening soon</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsList
                events={events.filter((event: any) => new Date(event.startDate) > new Date())}
                isLoading={isLoading}
                emptyMessage="No upcoming events found"
                onEventUpdated={refreshEvents}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Modal */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          refreshEvents()
        }}
        mode="create"
      />
    </div>
  )
}

