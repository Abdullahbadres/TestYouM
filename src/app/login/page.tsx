"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Basic validation
    if (!emailOrUsername.trim()) {
      setError("Please enter your email or username")
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      setLoading(false)
      return
    }

    try {
      console.log("Login form submitted with:", emailOrUsername)
      await login(emailOrUsername, password)
      console.log("Login successful, redirecting to profile")
      router.push("/profile")
    } catch (err: any) {
      console.error("Login form error:", err)

      // Handle specific error messages
      if (err.message.includes("not found") || err.message.includes("User not found")) {
        setError("Account not found. Please check your email/username or register a new account.")
      } else if (err.message.includes("password") || err.message.includes("Invalid")) {
        setError("Incorrect password. Please try again.")
      } else if (err.message.includes("email") && err.message.includes("not registered")) {
        setError("This email is not registered. Please register first or check your email address.")
      } else if (err.message.includes("username") && err.message.includes("not found")) {
        setError("Username not found. Please check your username or register a new account.")
      } else {
        setError("Login failed. Please check your credentials and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-gradient flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-16">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Login</h1>
            <p className="text-white/60 text-sm">Welcome back! Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4"
                  placeholder="Enter Username/Email"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4 pr-12"
                    placeholder="Enter Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="gradient"
              size="full"
              className="h-[48px] rounded-[8px] font-bold text-base shadow-[0px_4px_62px_0px_rgba(98,205,203,0.35)]"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm">
              No account?{" "}
              <Link href="/register" className="text-[#62CDCB] hover:text-[#4FBCBA] font-medium underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Login Help */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-[#62CDCB] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-white/60">
                <p className="font-medium text-white/80 mb-1">Having trouble logging in?</p>
                <ul className="space-y-1">
                  <li>• Make sure you have registered an account first</li>
                  <li>• Check your email/username spelling</li>
                  <li>• Verify your password is correct</li>
                  <li>• Try registering if you don't have an account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
