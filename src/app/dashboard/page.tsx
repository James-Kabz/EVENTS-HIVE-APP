import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/auth"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
      redirect("/login")
    }
  const user = session.user;
  return (
    <div className="flex flex-col min-w-full gap-6">
      {user && <DashboardWelcome user={user} />}
      <DashboardCards />
      <DashboardCharts />
    </div>
  )
}

