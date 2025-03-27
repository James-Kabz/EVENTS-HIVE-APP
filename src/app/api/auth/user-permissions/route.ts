import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { getUserPermissions } from "@/lib/auth/permissions"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ permissions: [] }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.user.id)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json({ message: "Something went wrong", permissions: [] }, { status: 500 })
  }
}

