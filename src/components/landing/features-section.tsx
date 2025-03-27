import type React from "react"
import { Search, Ticket, Users } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need for Events</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Events Hive provides all the tools you need to discover, organize, and enjoy events.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Search className="h-8 w-8 text-primary" />}
            title="Discover Events"
            description="Find events based on your interests, location, and availability."
          />
          <FeatureCard
            icon={<Ticket className="h-8 w-8 text-primary" />}
            title="Easy Booking"
            description="Book tickets in seconds with our streamlined checkout process."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Connect with Others"
            description="Meet like-minded people and build your network at events."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-center text-muted-foreground">{description}</p>
    </div>
  )
}

