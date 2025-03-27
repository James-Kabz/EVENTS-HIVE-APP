import { CalendarDays } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { useSession } from "next-auth/react"

interface Props {
  user: {
    id?: string | null
    role?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardWelcome({ user }: Props) {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 ">
        <CardTitle className="text-2xl">Welcome back, {user?.name || "User"}!</CardTitle>
        <CardDescription className="flex items-center">
          <CalendarDays className="mr-1 h-4 w-4" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is your dashboard where you can manage your account and access your data.</p>
      </CardContent>
    </Card>
  )
}