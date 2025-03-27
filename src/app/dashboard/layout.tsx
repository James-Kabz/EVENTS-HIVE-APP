import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"


import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { authOptions } from "@/lib/auth/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // const { data: session } = useSession()
  const user = session.user;

  return (
    <SidebarProvider>
      {user &&<DashboardSidebar user={user} />}
      <div className="flex flex-col w-full">
        <div className="flex flex-col">
          {user && <DashboardHeader user={user} />}
          <main className="flex-1 p-2">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}


