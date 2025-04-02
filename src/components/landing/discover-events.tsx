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
    <section id="discover" className="w-full py-8 md:py-16 lg:py-24">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">Popular Events</h2>
            <p className="max-w-[900px] text-sm text-muted-foreground md:text-base lg:text-xl">
              Explore trending events happening around you.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8 md:py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-muted-foreground">No upcoming events available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="mx-auto grid gap-4 sm:gap-6 py-8 md:py-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <div className="relative h-40 sm:h-48 md:h-52 w-full">
          <Image
            src={event.imageUrl || `/events_hive.png?height=300&width=400&text=${encodeURIComponent(event.name)}`}
            alt={event.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            priority={false}
          />
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{event.location}</span>
          </div>
        </div>
        
        <h3 className="mt-2 text-base sm:text-lg font-bold line-clamp-1">{event.name}</h3>
        
        <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground flex-grow">
          {event.description || "No description available."}
        </p>
        
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          {lowestPrice !== null ? (
            <span className="font-medium text-sm sm:text-base">Kshs {lowestPrice.toFixed(2)}</span>
          ) : (
            <span className="text-xs sm:text-sm text-muted-foreground">Free</span>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm px-2 sm:px-3" asChild>
            <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}