import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
// USE_MOCK_API is now primarily handled client-side in apiService.
// This server route will only act as a proxy to the real API.

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get("x-access-token")

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 })
    }

    console.log("👤 Get profile request with token:", accessToken ? "***" : "not provided")

    // If API_BASE_URL is not configured, this proxy cannot function.
    if (!API_BASE_URL) {
      console.error("❌ NEXT_PUBLIC_API_BASE_URL is not configured. Cannot proxy to real API.")
      return NextResponse.json({ error: "API server URL not configured." }, { status: 500 })
    }

    // Try real API
    try {
      const response = await fetch(`${API_BASE_URL}/api/getProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-access-token": accessToken,
        },
      })

      console.log("📊 Real API response status:", response.status)

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse real API JSON response:", parseError)
        return NextResponse.json({ error: "Server returned invalid JSON response." }, { status: 500 })
      }

      if (!response.ok) {
        console.error("❌ Real API get profile error:", data)
        return NextResponse.json({ error: data.message || "Failed to get profile" }, { status: response.status })
      }

      return NextResponse.json(data, { status: 200 })
    } catch (fetchError: any) {
      console.error("💥 Real API fetch failed:", fetchError.message)
      return NextResponse.json({ error: "Failed to connect to external API. Please try again later." }, { status: 500 })
    }
  } catch (error: any) {
    console.error("💥 Get profile proxy error:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
