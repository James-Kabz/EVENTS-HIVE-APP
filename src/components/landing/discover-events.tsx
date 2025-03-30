"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Event {
  id: string
  name: string
  description: string | null
  startDate: string
  location: string
  imageUrl: string | null
  ticketTypes: {
    id: string
    name: string
    price: number
  }[]
}

export default function DiscoverEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/public/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to load events")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <section id="discover" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Popular Events</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore trending events happening around you.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="mx-auto grid min-w-7xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/dashboard/events" className="group flex items-center gap-1 text-primary hover:underline">
            View all events <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function EventCard({ event }: { event: Event }) {
  // Get the lowest price from ticket types
  const lowestPrice = event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((ticket) => ticket.price)) : null

  return (
    <div className="group relative overflow-hidden rounded-lg border">
      <div className="aspect-video overflow-hidden">
        <Image
          src={event.imageUrl || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(event.name)}`}
          width={400}
          height={300}
          alt={event.name}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
          <MapPin className="ml-2 h-4 w-4" />
          <span className="truncate">{event.location}</span>
        </div>
        <h3 className="mt-2 text-lg font-bold">{event.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {event.description || "No description available."}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {lowestPrice !== null ? (
            <span className="font-medium">Kshs {lowestPrice.toFixed(2)}</span>
          ) : (
            <span className="text-muted-foreground">Free</span>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

