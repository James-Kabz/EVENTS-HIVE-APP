import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero-section"
import DiscoverEvents from "@/components/landing/discover-events"
import CtaSection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <DiscoverEvents />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

