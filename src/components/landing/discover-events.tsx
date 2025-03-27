import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

export default function DiscoverEvents() {
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
        <div className="mx-auto grid max-w-7xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCard key={i} index={i} />
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="#" className="group flex items-center gap-1 text-primary hover:underline">
            View all events <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function EventCard({ index }: { index: number }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border">
      <div className="aspect-video overflow-hidden">
        <Image
          src={`images/placeholder.svg?height=300&width=400&text=Event+${index}`}
          width={400}
          height={300}
          alt={`Event ${index}`}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>May {10 + index}, 2024</span>
          <MapPin className="ml-2 h-4 w-4" />
          <span>New York</span>
        </div>
        <h3 className="mt-2 text-lg font-bold">Tech Conference {2024 + index}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          Join us for the biggest tech event of the year with industry leaders and innovators.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">$99</span>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}

