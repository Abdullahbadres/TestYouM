"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowLeft, Info, CheckCircle, AlertTriangle } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false)
  const [cameFromLogin, setCameFromLogin] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

  useEffect(() => {
    // Pre-fill form if coming from login page
    const emailParam = searchParams.get("email")
    const usernameParam = searchParams.get("username")

    if (emailParam) {
      setEmail(emailParam)
      setCameFromLogin(true)
    }

    if (usernameParam) {
      setUsername(usernameParam)
      setCameFromLogin(true)
    }
  }, [searchParams])

  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 6 && password.length <= 9,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    }

    return validations
  }

  const getPasswordStrength = (password: string) => {
    const validations = validatePassword(password)
    const validCount = Object.values(validations).filter(Boolean).length

    if (validCount === 4) return { strength: "Strong", color: "text-green-400" }
    if (validCount >= 2) return { strength: "Medium", color: "text-yellow-400" }
    return { strength: "Weak", color: "text-red-400" }
  }

  const isPasswordValid = (password: string) => {
    const validations = validatePassword(password)
    return Object.values(validations).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Validate username
    if (username.length < 3) {
      setError("Username must be at least 3 characters long")
      setLoading(false)
      return
    }

    // Validate password
    if (!isPasswordValid(password)) {
      setError("Password does not meet the requirements")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await register(email, username, password)
      router.push("/profile")
    } catch (err: any) {
      console.error("Registration error:", err)

      // Handle specific error messages
      if (err.message === "USER_ALREADY_EXISTS") {
        setError("This email or username is already registered. Please use different credentials or try logging in.")
      } else if (err.message === "INVALID_DATA") {
        setError("Please check your information and try again.")
      } else if (err.message.includes("Cloudflare Tunnel error")) {
        setError("External API is temporarily unavailable. Please try again later or contact support.")
      } else if (err.message.includes("Server returned invalid response format")) {
        setError("Server communication error. Please try again later.")
      } else if (err.message.includes("Server communication error")) {
        setError("Unable to connect to registration server. Please check your internet connection and try again.")
      } else {
        setError("Registration failed. Please check your information and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordValidations = validatePassword(password)
  const passwordStrength = getPasswordStrength(password)

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
            <h1 className="text-2xl font-bold text-white mb-2">Register</h1>
            <p className="text-white/60 text-sm">Create your account to get started</p>
          </div>

          {/* Coming from Login Notification */}
          {cameFromLogin && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-300">
                  <p className="font-medium mb-1">Account Setup</p>
                  <p className="text-xs">
                    We've pre-filled your {email ? "email" : "username"}. Complete the form below to create your
                    account.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4"
                  placeholder="Enter Email"
                  required
                />
              </div>

              {/* Username Input */}
              <div className="space-y-3">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4"
                  placeholder="Create Username (min 3 characters)"
                  required
                  minLength={3}
                />
              </div>

              {/* Password Input with Tooltip */}
              <div className="space-y-3 relative">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordTooltip(true)}
                    onBlur={() => setTimeout(() => setShowPasswordTooltip(false), 200)}
                    className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4 pr-12"
                    placeholder="Create Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* Info Icon */}
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Info
                      size={16}
                      className="text-white/40 cursor-help"
                      onMouseEnter={() => setShowPasswordTooltip(true)}
                      onMouseLeave={() => setShowPasswordTooltip(false)}
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/60">Strength:</span>
                    <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                  </div>
                )}

                {/* Floating Password Tooltip */}
                {showPasswordTooltip && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 z-10 shadow-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${passwordValidations.length ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span className={passwordValidations.length ? "text-green-400" : "text-white/60"}>
                          6-9 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${passwordValidations.uppercase ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span className={passwordValidations.uppercase ? "text-green-400" : "text-white/60"}>
                          At least 1 uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${passwordValidations.number ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span className={passwordValidations.number ? "text-green-400" : "text-white/60"}>
                          At least 1 number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${passwordValidations.symbol ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span className={passwordValidations.symbol ? "text-green-400" : "text-white/60"}>
                          At least 1 symbol (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50">
                        Example: <span className="text-[#62CDCB]">MyPass1!</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4 pr-12"
                    placeholder="Confirm Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${password === confirmPassword ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className={password === confirmPassword ? "text-green-400" : "text-red-400"}>
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isPasswordValid(password) || password !== confirmPassword}
              variant="gradient"
              size="full"
              className="h-[48px] rounded-[8px] font-bold text-base shadow-[0px_4px_62px_0px_rgba(98,205,203,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating account...
                </div>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm">
              Have an account?{" "}
              <Link href="/login" className="text-[#62CDCB] hover:text-[#4FBCBA] font-medium underline">
                Login here
              </Link>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#62CDCB] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-white/60">
                <p className="font-medium text-white/80 mb-1">Registration Requirements:</p>
                <ul className="space-y-1">
                  <li>• Valid email address</li>
                  <li>• Unique username (min 3 characters)</li>
                  <li>• Strong password (6-9 chars, 1 uppercase, 1 number, 1 symbol)</li>
                  <li>• Account will be saved securely</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
