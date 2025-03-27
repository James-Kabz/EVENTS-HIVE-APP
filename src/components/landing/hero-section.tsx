import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Discover & Join Amazing Events Near You
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Events Hive connects you with local and virtual events that match your interests. Find, book, and enjoy
                events with ease.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-1">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#discover">
                <Button variant="outline" size="lg">
                  Explore Events
                </Button>
              </Link>
            </div>
          </div>
          <Image
            src="images/placeholder.svg?height=550&width=550"
            width={550}
            height={550}
            alt="Events collage"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
          />
        </div>
      </div>
    </section>
  )
}

