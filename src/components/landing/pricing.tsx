import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that{"'"}s right for you.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
          <PricingCard
            title="Free"
            description="For casual event-goers"
            price="$0"
            features={["Browse all events", "Book tickets", "Basic profile"]}
            buttonText="Get Started"
            buttonVariant="outline"
            highlighted={false}
          />
          <PricingCard
            title="Pro"
            description="For regular event attendees"
            price="$9.99"
            features={["All Free features", "Early access to tickets", "Exclusive events", "Discounted tickets"]}
            buttonText="Subscribe Now"
            buttonVariant="default"
            highlighted={true}
          />
          <PricingCard
            title="Business"
            description="For event organizers"
            price="$29.99"
            features={["All Pro features", "Create and manage events", "Analytics dashboard", "Priority support"]}
            buttonText="Contact Sales"
            buttonVariant="outline"
            highlighted={false}
          />
        </div>
      </div>
    </section>
  )
}

function PricingCard({
  title,
  description,
  price,
  features,
  buttonText,
  buttonVariant = "outline",
  highlighted = false,
}: {
  title: string
  description: string
  price: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline"
  highlighted?: boolean
}) {
  return (
    <div className={`flex flex-col rounded-lg border p-6 ${highlighted ? "border-primary shadow-lg" : ""}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant={buttonVariant} className="mt-auto">
        {buttonText}
      </Button>
    </div>
  )
}

