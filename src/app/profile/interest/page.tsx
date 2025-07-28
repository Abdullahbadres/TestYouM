"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X } from "lucide-react"

interface Profile {
  name: string
  birthday: string
  height: number
  weight: number
  interests: string[]
  gender?: string
  profileImage?: string
}

export default function InterestPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    try {
      const data = await apiService.getProfile()
      const profileData = data.data || data
      setProfile(profileData)
      setInterests(profileData.interests || [])
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      setInterests([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        interests: interests,
      }

      if (profile && profile.name) {
        await apiService.updateProfile(updatedProfile)
      } else {
        await apiService.createProfile(updatedProfile)
      }

      router.push("/profile")
    } catch (error) {
      console.error("Failed to save interests:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent mb-2">
              Tell everyone about yourself
            </h1>
            <h2 className="text-xl font-semibold text-[#62CDCB] mb-6">What interest you?</h2>
          </div>

          <div className="space-y-6">
            {/* Add Interest Input */}
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="h-[51px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[9px] px-4"
                placeholder="Add your interest"
                onKeyPress={(e) => e.key === "Enter" && handleAddInterest()}
              />
              <Button
                onClick={handleAddInterest}
                variant="gradient"
                className="h-[51px] px-4 rounded-[9px] min-w-[60px]"
              >
                <Plus size={20} />
              </Button>
            </div>

            {/* Interest Tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="interest"
                    className="cursor-pointer px-4 py-2 text-[14px] rounded-[100px] bg-white/[0.06] text-white hover:bg-white/[0.12] transition-colors border border-white/20"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    {interest} <X size={14} className="ml-2" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="gradient"
              size="full"
              className="h-[48px] rounded-[8px] font-bold text-base shadow-[0px_4px_62px_0px_rgba(98,205,203,0.35)] mt-8"
            >
              {saving ? "Saving..." : "Save & Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
