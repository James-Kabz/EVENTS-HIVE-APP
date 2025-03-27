import { ArrowUpRight, Users, ShieldCheck, FileText } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">120</div>
          <p className="text-xs text-muted-foreground">+10% from last month</p>
        </CardContent>
        <CardFooter className="p-2">
          <a href="#" className="text-xs text-blue-500 hover:underline flex items-center">
            View all users
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </a>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">Admin, User, Guest</p>
        </CardContent>
        <CardFooter className="p-2">
          <a href="#" className="text-xs text-blue-500 hover:underline flex items-center">
            Manage roles
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </a>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">25</div>
          <p className="text-xs text-muted-foreground">+5 created this week</p>
        </CardContent>
        <CardFooter className="p-2">
          <a href="#" className="text-xs text-blue-500 hover:underline flex items-center">
            View all documents
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}

