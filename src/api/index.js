import { clientStorage } from "./client-storage"

class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    this.useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true" // Get mock API flag
    console.log("🌐 API Service initialized with base URL:", this.baseURL)
    console.log("🎭 Use Mock API (Client-side):", this.useMockApi)

    if (!this.baseURL && !this.useMockApi) {
      console.error("❌ NEXT_PUBLIC_API_BASE_URL is not configured and Mock API is not enabled!")
      console.error(
        "Please add NEXT_PUBLIC_API_BASE_URL=http://techtest.youapp.ai to your .env.local file or set NEXT_PUBLIC_USE_MOCK_API=true",
      )
    }
  }

  getAuthHeaders() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token")
      return {
        "Content-Type": "application/json",
        ...(token && { "x-access-token": token }),
      }
    }
    return {
      "Content-Type": "application/json",
    }
  }

  async checkUserExists(emailOrUsername) {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Checking user existence for:", emailOrUsername)
      const user = clientStorage.getUser(emailOrUsername)
      return !!user // Returns true if user exists, false otherwise
    }

    try {
      console.log("🔍 Checking user existence for:", emailOrUsername)
      const isEmail = emailOrUsername.includes("@")
      const checkPayload = isEmail
        ? { email: emailOrUsername, password: "dummy_check_password_123" }
        : { username: emailOrUsername, password: "dummy_check_password_123" }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkPayload),
      })

      console.log("📊 User existence check response status:", response.status)

      if (response.status === 404) {
        console.log("❌ User not found (404)")
        return false
      } else if (response.status === 401) {
        console.log("✅ User exists but wrong password (401)")
        return true
      } else if (response.status === 200) {
        console.log("✅ User exists and authenticated (200)")
        return true
      } else {
        console.log("❓ Uncertain status, assuming user doesn't exist:", response.status)
        return false
      }
    } catch (error) {
      console.error("💥 Error checking user existence:", error)
      return false
    }
  }

  async register(data) {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Registering user:", data.username)
      const existingUser = clientStorage.getUser(data.email) || clientStorage.getUser(data.username)
      if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS")
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const accessToken = `token_${userId}_${Date.now()}`
      const newUser = {
        id: userId,
        email: data.email,
        username: data.username,
        password: data.password, // Mock: store plain password for validation
        access_token: accessToken,
        createdAt: new Date().toISOString(),
      }
      clientStorage.saveUser(newUser)
      localStorage.setItem("access_token", accessToken)
      console.log("✅ Mock registration successful, user saved to localStorage.")
      return { access_token: accessToken, user: { id: userId, email: data.email, username: data.username } }
    }

    try {
      // Validate input data
      if (!data.email || !data.username || !data.password) {
        throw new Error("Missing required registration fields: email, username, password")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error("Invalid email format")
      }

      // Validate username length
      if (data.username.length < 3) {
        throw new Error("Username must be at least 3 characters long")
      }

      const registerPayload = {
        email: data.email,
        username: data.username,
        password: data.password,
      }

      console.log("📝 Register API call:", { ...registerPayload, password: "***" })
      console.log("📡 Calling endpoint: /api/register")

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      })

      console.log("📊 Register response status:", response.status)
      console.log("📊 Register response headers:", Object.fromEntries(response.headers.entries()))

      let result
      try {
        const responseText = await response.text()
        console.log("📦 Raw register response:", responseText)

        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse register response as JSON:", parseError)
        const errorText = await response.text().catch(() => "Unknown error")
        if (response.ok) {
          result = { message: errorText || "Registration successful", access_token: null }
        } else {
          throw new Error(errorText || "Server returned invalid response format")
        }
      }

      console.log("📦 Parsed register response data:", result)

      if (!response.ok) {
        console.error("❌ Register API error:", result)
        if (response.status === 503) {
          throw new Error("API server is currently unavailable. Please try again later.")
        } else if (response.status === 502) {
          throw new Error("Server communication error. Please try again.")
        } else if (response.status === 409) {
          throw new Error("USER_ALREADY_EXISTS")
        } else if (response.status === 400) {
          throw new Error("INVALID_DATA")
        } else {
          throw new Error(
            result.error || result.message || result.details || `HTTP ${response.status}: Registration failed`,
          )
        }
      }

      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token)
        console.log("💾 Access token stored after registration")
        if (result.user) {
          clientStorage.saveUser({
            ...result.user,
            password: data.password,
            access_token: result.access_token,
          })
        }
      } else {
        console.warn("⚠️ No access token in registration response")
      }

      return result
    } catch (error) {
      console.error("💥 Register error:", error)
      throw error
    }
  }

  async login(data) {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Logging in user:", data.email || data.username)
      const user = clientStorage.getUser(data.email || data.username)
      if (!user) {
        throw new Error("USER_NOT_FOUND")
      }
      if (user.password !== data.password) {
        // Mock: compare plain password
        throw new Error("INVALID_CREDENTIALS")
      }
      const accessToken = `token_${user.id}_${Date.now()}`
      user.access_token = accessToken
      user.lastLogin = new Date().toISOString()
      clientStorage.saveUser(user) // Update user with new token and last login
      localStorage.setItem("access_token", accessToken)
      console.log("✅ Mock login successful, user data updated in localStorage.")
      return { access_token: accessToken, user: { id: user.id, email: user.email, username: user.username } }
    }

    try {
      // Validate input data
      if (!data.password || (!data.email && !data.username)) {
        throw new Error("Missing required login credentials")
      }

      const loginPayload = {
        email: data.email || "",
        username: data.username || "",
        password: data.password,
      }

      console.log("🔐 Login API call:", { ...loginPayload, password: "***" })
      console.log("📡 Calling endpoint: /api/login")

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      })

      console.log("📊 Login response status:", response.status)
      console.log("📊 Login response headers:", Object.fromEntries(response.headers.entries()))

      let result
      try {
        const responseText = await response.text()
        console.log("📦 Raw login response:", responseText)

        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse login response as JSON:", parseError)
        const errorText = await response.text().catch(() => "Unknown error")
        if (response.ok) {
          result = { message: errorText || "Login successful", access_token: null }
        } else {
          throw new Error(errorText || "Server returned invalid response format")
        }
      }

      console.log("📦 Parsed login response data:", result)

      if (!response.ok) {
        console.error("❌ Login API error:", result)
        if (response.status === 503) {
          throw new Error("API server is currently unavailable. Please try again later.")
        } else if (response.status === 502) {
          throw new Error("Server communication error. Please try again.")
        } else if (response.status === 404) {
          throw new Error("USER_NOT_FOUND")
        } else if (response.status === 401) {
          throw new Error("INVALID_CREDENTIALS")
        } else {
          throw new Error(result.error || result.message || result.details || `HTTP ${response.status}: Login failed`)
        }
      }

      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token)
        console.log("💾 Access token stored successfully")
        if (result.user) {
          const existingUser = clientStorage.getUser(result.user.email || result.user.username)
          if (existingUser) {
            clientStorage.saveUser({
              ...existingUser,
              access_token: result.access_token,
              lastLogin: new Date().toISOString(),
            })
          }
        }
      } else {
        console.warn("⚠️ No access token in response")
      }

      return result
    } catch (error) {
      console.error("💥 Login error:", error)
      throw error
    }
  }

  async getProfile() {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Getting profile")
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Access token required for mock profile")
      const tokenParts = token.split("_")
      const userId = tokenParts.length >= 3 ? `${tokenParts[1]}_${tokenParts[2]}_${tokenParts[3]}` : null
      if (!userId) throw new Error("Invalid mock access token")

      const profile = clientStorage.getProfile(userId)
      if (profile) {
        console.log("✅ Mock profile retrieved from localStorage:", profile)
        return { data: profile }
      } else {
        // Return a default empty profile if none exists
        const defaultProfile = {
          name: "",
          birthday: "",
          height: 0,
          weight: 0,
          interests: [],
          gender: "",
          profileImage: "",
          heightUnit: "cm",
          heightFeet: 0,
          heightInches: 0,
        }
        console.log("ℹ️ Mock profile not found, returning default empty profile.")
        return { data: defaultProfile }
      }
    }

    try {
      const headers = this.getAuthHeaders()
      console.log("👤 Get profile API call")
      console.log("📡 Headers:", { ...headers, "x-access-token": headers["x-access-token"] ? "***" : "not set" })

      const response = await fetch("/api/getProfile", {
        method: "GET",
        headers: headers,
      })

      console.log("📊 Get profile response status:", response.status)

      let result
      try {
        const responseText = await response.text()
        console.log("📦 Raw profile response:", responseText)

        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse profile response as JSON:", parseError)
        throw new Error("Server returned invalid response format")
      }

      console.log("📦 Get profile response data:", result)

      if (!response.ok) {
        console.error("❌ Get profile API error:", result)
        throw new Error(result.error || result.message || `HTTP ${response.status}: Failed to fetch profile`)
      }

      return result
    } catch (error) {
      console.error("💥 Get profile error:", error)
      throw error
    }
  }

  async createProfile(data) {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Creating profile")
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Access token required for mock profile creation")
      const tokenParts = token.split("_")
      const userId = tokenParts.length >= 3 ? `${tokenParts[1]}_${tokenParts[2]}_${tokenParts[3]}` : null
      if (!userId) throw new Error("Invalid mock access token")

      clientStorage.saveProfile(userId, data)
      console.log("✅ Mock profile created and saved to localStorage.")
      return { message: "Profile created successfully", data: data }
    }

    try {
      const profilePayload = {
        name: data.name || "",
        birthday: data.birthday || "",
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        interests: Array.isArray(data.interests) ? data.interests : [],
        gender: data.gender || "",
        profileImage: data.profileImage || "",
        heightUnit: data.heightUnit || "cm",
        heightFeet: Number(data.heightFeet) || 0,
        heightInches: Number(data.heightInches) || 0,
      }

      const headers = this.getAuthHeaders()
      console.log("📝 Create profile API call:", {
        ...profilePayload,
        profileImage: profilePayload.profileImage ? "***" : "",
      })

      const response = await fetch("/api/createProfile", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(profilePayload),
      })

      console.log("📊 Create profile response status:", response.status)

      let result
      try {
        const responseText = await response.text()
        console.log("📦 Raw create profile response:", responseText)

        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse create profile response as JSON:", parseError)
        throw new Error("Server returned invalid response format")
      }

      console.log("📦 Create profile response data:", result)

      if (!response.ok) {
        console.error("❌ Create profile API error:", result)
        throw new Error(result.error || result.message || `HTTP ${response.status}: Failed to create profile`)
      }

      const token = localStorage.getItem("access_token")
      if (token) {
        const tokenParts = token.split("_")
        const userId = tokenParts.length >= 3 ? `${tokenParts[1]}_${tokenParts[2]}_${tokenParts[3]}` : null
        if (userId) {
          clientStorage.saveProfile(userId, profilePayload)
        }
      }

      return result
    } catch (error) {
      console.error("💥 Create profile error:", error)
      throw error
    }
  }

  async updateProfile(data) {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Updating profile")
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Access token required for mock profile update")
      const tokenParts = token.split("_")
      const userId = tokenParts.length >= 3 ? `${tokenParts[1]}_${tokenParts[2]}_${tokenParts[3]}` : null
      if (!userId) throw new Error("Invalid mock access token")

      clientStorage.saveProfile(userId, data)
      console.log("✅ Mock profile updated and saved to localStorage.")
      return { message: "Profile updated successfully", data: data }
    }

    try {
      const profilePayload = {
        name: data.name || "",
        birthday: data.birthday || "",
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        interests: Array.isArray(data.interests) ? data.interests : [],
        gender: data.gender || "",
        profileImage: data.profileImage || "",
        heightUnit: data.heightUnit || "cm",
        heightFeet: Number(data.heightFeet) || 0,
        heightInches: Number(data.heightInches) || 0,
      }

      const headers = this.getAuthHeaders()
      console.log("📝 Update profile API call:", {
        ...profilePayload,
        profileImage: profilePayload.profileImage ? "***" : "",
      })

      const response = await fetch("/api/updateProfile", {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(profilePayload),
      })

      console.log("📊 Update profile response status:", response.status)

      let result
      try {
        const responseText = await response.text()
        console.log("📦 Raw update profile response:", responseText)

        if (responseText) {
          result = JSON.parse(responseText)
        } else {
          result = { message: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("❌ Failed to parse update profile response as JSON:", parseError)
        throw new Error("Server returned invalid response format")
      }

      console.log("📦 Update profile response data:", result)

      if (!response.ok) {
        console.error("❌ Update profile API error:", result)
        throw new Error(result.error || result.message || `HTTP ${response.status}: Failed to update profile`)
      }

      const token = localStorage.getItem("access_token")
      if (token) {
        const tokenParts = token.split("_")
        const userId = tokenParts.length >= 3 ? `${tokenParts[1]}_${tokenParts[2]}_${tokenParts[3]}` : null
        if (userId) {
          clientStorage.saveProfile(userId, profilePayload)
        }
      }

      return result
    } catch (error) {
      console.error("💥 Update profile error:", error)
      throw error
    }
  }

  async testConnection() {
    if (this.useMockApi) {
      console.log("🎭 Mock API: Connection test always succeeds.")
      return true
    }
    try {
      console.log("🧪 Testing API connection...")

      if (!this.baseURL) {
        console.error("❌ API Base URL not configured")
        return false
      }

      const response = await fetch(`${this.baseURL}/api/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📊 API test response status:", response.status)
      return response.ok
    } catch (error) {
      console.error("💥 API connection test failed:", error)
      return false
    }
  }
}

export const apiService = new ApiService()
