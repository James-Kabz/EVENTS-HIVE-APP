import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero-section"
import Features from "@/components/landing/features-section"
import DiscoverEvents from "@/components/landing/discover-events"
import HowItWorks from "@/components/landing/how-it-works"
import Pricing from "@/components/landing/pricing"
import CtaSection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <DiscoverEvents />
        <HowItWorks />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

