import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>User activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px] w-full bg-muted/50 rounded-md"></div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Distribution of users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full bg-muted/50 rounded-md"></div>
        </CardContent>
      </Card>
    </div>
  )
}

