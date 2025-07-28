import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
// USE_MOCK_API is now primarily handled client-side in apiService.
// This server route will only act as a proxy to the real API.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🔧 Proxy register request:", { ...body, password: "***" })
    console.log("🌐 API Base URL:", API_BASE_URL)

    // Validate required fields
    if (!body.email || !body.username || !body.password) {
      return NextResponse.json({ error: "Missing required fields: email, username, password" }, { status: 400 })
    }

    // If API_BASE_URL is not configured, this proxy cannot function.
    if (!API_BASE_URL) {
      console.error("❌ NEXT_PUBLIC_API_BASE_URL is not configured. Cannot proxy to real API.")
      return NextResponse.json({ error: "API server URL not configured." }, { status: 500 })
    }

    // Try real API
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })

      console.log("📊 Real API response status:", response.status)

      const responseText = await response.text()
      console.log("📦 Raw Real API response:", responseText.substring(0, 200))

      let data
      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error("❌ Failed to parse real API JSON response:", parseError)
          return NextResponse.json({ error: "Server returned invalid JSON response." }, { status: 500 })
        }
      } else {
        // If not JSON, but response is not OK, return error message
        if (!response.ok) {
          const errorMessage = responseText || "Registration failed"
          return NextResponse.json({ error: errorMessage }, { status: response.status })
        } else {
          // If not JSON but OK, assume success with plain text message
          return NextResponse.json(
            {
              message: responseText || "Registration successful",
              access_token: `real_api_token_${Date.now()}`, // Generate a dummy token if real API doesn't provide one
            },
            { status: 200 },
          )
        }
      }

      if (!response.ok) {
        console.error("❌ Real API registration error:", data)
        return NextResponse.json(
          { error: data?.message || data?.error || "Registration failed" },
          { status: response.status },
        )
      }

      console.log("✅ Real API registration successful")
      return NextResponse.json(data, { status: 200 })
    } catch (fetchError: any) {
      console.error("💥 Real API fetch failed:", fetchError.message)
      return NextResponse.json({ error: "Failed to connect to external API. Please try again later." }, { status: 500 })
    }
  } catch (error: any) {
    console.error("💥 Register proxy error:", error.message)
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 })
  }
}
