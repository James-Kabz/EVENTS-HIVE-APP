import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth/auth"
import { hasPermission } from "@/lib/auth/permissions"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const permission = searchParams.get("permission")

    if (!permission) {
      return NextResponse.json({ message: "Permission parameter is required" }, { status: 400 })
    }

    const userHasPermission = await hasPermission(session.user.id, permission)

    return NextResponse.json({ hasPermission: userHasPermission })
  } catch (error) {
    console.error("Error checking permission:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

