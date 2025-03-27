export default function HowItWorks() {
    return (
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How Events Hive Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Finding and joining events has never been easier.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-3">
            <StepCard
              number={1}
              title="Create an Account"
              description="Sign up for free and set up your profile with your interests."
            />
            <StepCard
              number={2}
              title="Discover Events"
              description="Browse events or get personalized recommendations based on your interests."
            />
            <StepCard
              number={3}
              title="Book & Attend"
              description="Secure your spot with easy booking and enjoy the event!"
            />
          </div>
        </div>
      </section>
    )
  }
  
  function StepCard({
    number,
    title,
    description,
  }: {
    number: number
    title: string
    description: string
  }) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
          <span className="text-xl font-bold">{number}</span>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    )
  }
  
  