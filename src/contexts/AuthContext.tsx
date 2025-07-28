"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiService } from "@/api"

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  checkUserExists: (emailOrUsername: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token")
        if (token) {
          try {
            // Verify token is still valid by trying to get profile
            await apiService.getProfile()
            setIsAuthenticated(true)
          } catch (error) {
            // Token is invalid, remove it
            console.log("🔑 Token invalid, removing...")
            localStorage.removeItem("access_token")
            setIsAuthenticated(false)
          }
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const checkUserExists = async (emailOrUsername: string): Promise<boolean> => {
    try {
      console.log("🔍 Checking if user exists:", emailOrUsername)
      const exists = await apiService.checkUserExists(emailOrUsername)
      console.log("✅ User exists check result:", exists)
      return exists
    } catch (error) {
      console.error("❌ Error checking user existence:", error)
      return false
    }
  }

  const login = async (emailOrUsername: string, password: string) => {
    try {
      // First check if user exists
      const userExists = await checkUserExists(emailOrUsername)

      if (!userExists) {
        throw new Error("USER_NOT_FOUND")
      }

      // Determine if input is email or username
      const isEmail = emailOrUsername.includes("@")
      const loginData = isEmail ? { email: emailOrUsername, password } : { username: emailOrUsername, password }

      console.log("🔐 Attempting login with:", { isEmail, emailOrUsername, hasPassword: !!password })

      const response = await apiService.login(loginData)

      console.log("✅ Login API response:", response)

      // Check if we got a valid response with access_token
      if (!response.access_token) {
        throw new Error("No access token received from server")
      }

      setIsAuthenticated(true)

      if (response.user) {
        setUser(response.user)
        console.log("👤 User data set:", response.user)
      }

      console.log("🎉 Login successful")
    } catch (error: any) {
      console.error("❌ Login failed:", error)

      // Clear any existing auth state
      setIsAuthenticated(false)
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
      }

      // Handle specific error types
      if (error.message === "USER_NOT_FOUND") {
        throw new Error("USER_NOT_FOUND")
      } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        throw new Error("INVALID_CREDENTIALS")
      } else if (error.message.includes("404") || error.message.includes("not found")) {
        throw new Error("USER_NOT_FOUND")
      } else if (error.message.includes("400") || error.message.includes("Bad Request")) {
        throw new Error("INVALID_REQUEST")
      } else {
        throw new Error(error.message || "LOGIN_FAILED")
      }
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      console.log("📝 Attempting registration with:", { email, username, hasPassword: !!password })

      const response = await apiService.register({ email, username, password })

      console.log("✅ Registration API response:", response)

      // Check if registration was successful
      if (!response.access_token) {
        throw new Error("Registration failed - no access token received")
      }

      setIsAuthenticated(true)

      if (response.user) {
        setUser(response.user)
        console.log("👤 User data set after registration:", response.user)
      }

      console.log("🎉 Registration successful")
    } catch (error: any) {
      console.error("❌ Registration failed:", error)

      // Clear any existing auth state
      setIsAuthenticated(false)
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
      }

      // Handle specific error types
      if (error.message.includes("409") || error.message.includes("already exists")) {
        throw new Error("USER_ALREADY_EXISTS")
      } else if (error.message.includes("400") || error.message.includes("validation")) {
        throw new Error("INVALID_DATA")
      } else {
        throw new Error(error.message || "REGISTRATION_FAILED")
      }
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
    setIsAuthenticated(false)
    setUser(null)
    console.log("🚪 User logged out")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        checkUserExists,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
