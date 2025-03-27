import { type NextRequest, NextResponse } from "next/server"
import { handleApiError, createErrorResponse } from "@/lib/error-handler"

// This is an example API route that demonstrates how to use the error handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const errorType = searchParams.get("type")

  try {
    switch (errorType) {
      case "not-found":
        return NextResponse.json({ message: "Resource not found" }, { status: 404 })

      case "unauthorized":
        return NextResponse.json({ message: "Unauthorized access" }, { status: 401 })

      case "forbidden":
        return NextResponse.json({ message: "Forbidden access" }, { status: 403 })

      case "validation":
        return NextResponse.json({ message: "Validation error", errors: ["Field is required"] }, { status: 422 })

      case "server":
        throw new Error("Internal server error example")

      default:
        return NextResponse.json({ message: "Example API endpoint" }, { status: 200 })
    }
  } catch (error) {
    const errorInfo = handleApiError(error, "Failed to process request")
    return createErrorResponse(errorInfo)
  }
}

