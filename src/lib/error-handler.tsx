import { NextResponse } from "next/server"

type ErrorResponse = {
  message: string
  status: number
  error?: unknown
}

export function handleApiError(error: unknown, defaultMessage = "Something went wrong"): ErrorResponse {
  console.error("API Error:", error)

  // Handle known error types
  if (error instanceof Error) {
    // You can add specific error type handling here
    return {
      message: error.message || defaultMessage,
      status: 500,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    }
  }

  // Default error response
  return {
    message: defaultMessage,
    status: 500,
    error: process.env.NODE_ENV === "development" ? error : undefined,
  }
}

export function createErrorResponse(errorInfo: ErrorResponse): NextResponse {
  return NextResponse.json(
    {
      message: errorInfo.message,
      ...(process.env.NODE_ENV === "development" && errorInfo.error ? { error: errorInfo.error } : {}),
    },
    { status: errorInfo.status },
  )
}

// Example usage in an API route:
// try {
//   // Your code here
// } catch (error) {
//   const errorInfo = handleApiError(error, "Failed to process request")
//   return createErrorResponse(errorInfo)
// }

