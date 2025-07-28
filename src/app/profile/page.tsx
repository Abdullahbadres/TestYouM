"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit3, Plus, X } from "lucide-react"

interface Profile {
  name: string
  birthday: string
  height: number
  weight: number
  interests: string[]
  gender?: string
  profileImage?: string
  heightUnit?: "cm" | "ft"
  heightFeet?: number
  heightInches?: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm")
  const [editForm, setEditForm] = useState<Profile>({
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
  })
  const [showImageModal, setShowImageModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { logout, isAuthenticated } = useAuth()
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
      setEditForm(profileData)
      setHeightUnit(profileData.heightUnit || "cm")
      if (profileData.profileImage) {
        setProfileImage(profileData.profileImage)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      const emptyProfile = {
        name: "",
        birthday: "",
        height: 0,
        weight: 0,
        interests: [],
        gender: "",
        profileImage: "",
        heightUnit: "cm" as const,
        heightFeet: 0,
        heightInches: 0,
      }
      setProfile(emptyProfile)
      setEditForm(emptyProfile)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setProfileImage(imageUrl)
        setEditForm({ ...editForm, profileImage: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAbout = async () => {
    setSaving(true)
    try {
      if (profile && profile.name) {
        await apiService.updateProfile(editForm)
      } else {
        await apiService.createProfile(editForm)
      }
      setProfile(editForm)
      setIsEditingAbout(false)
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const calculateAge = (birthday: string) => {
    if (!birthday) return ""
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getZodiacInfo = (birthday: string) => {
    if (!birthday) return { sign: "", horoscope: "", emoji: "" }
    const date = new Date(birthday)
    const month = date.getMonth() + 1
    const day = date.getDate()

    const zodiacData = [
      { sign: "Aries", horoscope: "Ram", emoji: "♈", start: [3, 21], end: [4, 19] },
      { sign: "Taurus", horoscope: "Bull", emoji: "♉", start: [4, 20], end: [5, 20] },
      { sign: "Gemini", horoscope: "Twins", emoji: "♊", start: [5, 21], end: [6, 21] },
      { sign: "Cancer", horoscope: "Crab", emoji: "♋", start: [6, 22], end: [7, 22] },
      { sign: "Leo", horoscope: "Lion", emoji: "♌", start: [7, 23], end: [8, 22] },
      { sign: "Virgo", horoscope: "Virgin", emoji: "♍", start: [8, 23], end: [9, 22] },
      { sign: "Libra", horoscope: "Balance", emoji: "♎", start: [9, 23], end: [10, 23] },
      { sign: "Scorpio", horoscope: "Scorpion", emoji: "♏", start: [10, 24], end: [11, 21] },
      { sign: "Sagittarius", horoscope: "Archer", emoji: "♐", start: [11, 22], end: [12, 21] },
      { sign: "Capricorn", horoscope: "Goat", emoji: "♑", start: [12, 22], end: [1, 19] },
      { sign: "Aquarius", horoscope: "Water Bearer", emoji: "♒", start: [1, 20], end: [2, 18] },
      { sign: "Pisces", horoscope: "Fish", emoji: "♓", start: [2, 19], end: [3, 20] },
    ]

    for (const zodiac of zodiacData) {
      const [startMonth, startDay] = zodiac.start
      const [endMonth, endDay] = zodiac.end

      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (startMonth > endMonth &&
          (month === startMonth || month === endMonth) &&
          ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)))
      ) {
        return zodiac
      }
    }
    return { sign: "", horoscope: "", emoji: "" }
  }

  const getHoroscopeEmoji = (horoscope: string) => {
    const horoscopeEmojis: { [key: string]: string } = {
      Ram: "🐏",
      Bull: "🐂",
      Twins: "👯",
      Crab: "🦀",
      Lion: "🦁",
      Virgin: "👸",
      Balance: "⚖️",
      Scorpion: "🦂",
      Archer: "🏹",
      Goat: "🐐",
      "Water Bearer": "🏺",
      Fish: "🐟",
    }
    return horoscopeEmojis[horoscope] || ""
  }

  const formatBirthday = (birthday: string) => {
    if (!birthday) return ""
    const date = new Date(birthday)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatHeight = (profile: Profile) => {
    if (!profile.height && !profile.heightFeet && !profile.heightInches) return ""

    if (profile.heightUnit === "ft") {
      const feet = profile.heightFeet || 0
      const inches = profile.heightInches || 0
      return `${feet} ft ${inches.toFixed(2)} in`
    } else {
      return `${profile.height?.toFixed(2) || "0.00"} cm`
    }
  }

  const formatWeight = (weight: number) => {
    if (!weight) return ""
    return `${weight.toFixed(2)} kg`
  }

  const handleHeightUnitChange = (unit: "cm" | "ft") => {
    setHeightUnit(unit)
    setEditForm({ ...editForm, heightUnit: unit })
  }

  const ImageModal = () => {
    if (!showImageModal || !profileImage) return null

    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={() => setShowImageModal(false)}
      >
        <div className="relative max-w-sm w-full max-h-[80vh]">
          <img
            src={profileImage || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-auto rounded-lg object-contain max-h-full"
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09141A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  const zodiacInfo = getZodiacInfo(profile?.birthday || "")

  return (
    <div className="min-h-screen bg-[#09141A]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 sm:p-6 sm:pt-16">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-[14px] sm:text-[16px] font-semibold truncate max-w-[200px]">
          {profile?.name ? `@${profile.name}` : "Profile"}
        </h1>
        <button
          onClick={handleLogout}
          className="text-white/70 hover:text-white transition-colors text-[12px] sm:text-[14px]"
        >
          Logout
        </button>
      </div>

      <div className="px-4 pb-6 sm:px-6 lg:px-8 max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
        {/* Profile Image Section */}
        <div className="relative mb-6">
          <div className="h-[190px] sm:h-[220px] lg:h-[250px] bg-gradient-to-r from-[#1F4247] to-[#0D1D23] rounded-[16px] flex items-end p-4 sm:p-6">
            <div className="flex items-center space-x-4">
              <div
                className="w-[57px] h-[57px] sm:w-[70px] sm:h-[70px] bg-gradient-to-r from-[#62CDCB] to-[#4599DB] rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => profileImage && setShowImageModal(true)}
              >
                {profileImage ? (
                  <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-[16px] sm:text-[18px] leading-tight truncate">
                  {profile?.name || "User"}
                </h2>
                {profile?.birthday && (
                  <p className="text-white/70 text-[13px] sm:text-[14px] leading-tight mt-1">
                    {calculateAge(profile.birthday)} years old
                  </p>
                )}
                {profile?.gender && (
                  <p className="text-white/70 text-[13px] sm:text-[14px] leading-tight">
                    {profile.gender === "male" ? "♂ Male" : "♀ Female"}
                  </p>
                )}
                {zodiacInfo.sign && (
                  <p className="text-white/70 text-[13px] sm:text-[14px] leading-tight">
                    {zodiacInfo.emoji} {zodiacInfo.sign} {getHoroscopeEmoji(zodiacInfo.horoscope)}{" "}
                    {zodiacInfo.horoscope}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#0E191F] rounded-[14px] p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-[14px] sm:text-[16px] leading-tight">About</h3>
            <Button
              onClick={() => {
                if (isEditingAbout) {
                  handleSaveAbout()
                } else {
                  setIsEditingAbout(true)
                }
              }}
              variant="ghost"
              size="sm"
              className="text-[#62CDCB] hover:text-[#4FBCBA] hover:bg-white/10 h-6 px-2 text-[12px] sm:text-[14px] font-medium transition-colors"
              disabled={saving}
            >
              {isEditingAbout ? saving ? "Saving..." : "Save & Update" : <Edit3 size={12} />}
            </Button>
          </div>

          {isEditingAbout ? (
            <div className="space-y-4">
              {/* Add Image */}
              <div className="space-y-2">
                <span className="text-white/70 text-[13px] sm:text-[14px] leading-tight">Add image:</span>
                <div className="flex items-center gap-4">
                  <div
                    className="w-[57px] h-[57px] sm:w-[70px] sm:h-[70px] bg-white/[0.06] border border-white/[0.22] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-white/[0.12] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-[8px]"
                      />
                    ) : (
                      <Plus size={20} className="text-white/40" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                <span className="sm:w-24 flex-shrink-0">Display name:</span>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px] flex-1"
                  placeholder="Enter name"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                <span className="sm:w-24 flex-shrink-0">Gender:</span>
                <div className="flex gap-2 flex-1">
                  <Button
                    onClick={() => setEditForm({ ...editForm, gender: "male" })}
                    variant={editForm.gender === "male" ? "gradient" : "outline"}
                    size="sm"
                    className="text-black h-[36px] sm:h-[40px] px-4 rounded-[8px] text-[13px] sm:text-[14px] flex-1 sm:flex-none "
                  >
                    ♂ Male
                  </Button>
                  <Button
                    onClick={() => setEditForm({ ...editForm, gender: "female" })}
                    variant={editForm.gender === "female" ? "gradient" : "outline"}
                    size="sm"
                    className="h-[36px] sm:h-[40px] px-4 rounded-[8px] text-[13px] sm:text-[14px] flex-1 sm:flex-none text-black"
                  >
                    ♀ Female
                  </Button>
                </div>
              </div>

              {/* Birthday */}
              <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                <span className="sm:w-24 flex-shrink-0">Birthday:</span>
                <Input
                  type="date"
                  value={editForm.birthday}
                  onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                  className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px] flex-1"
                />
              </div>

              {/* Horoscope (Auto-generated) */}
              {editForm.birthday && (
                <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                  <span className="sm:w-24 flex-shrink-0">Horoscope:</span>
                  <div className="flex-1">
                    <span className="text-white text-[13px] sm:text-[14px]">
                      {getHoroscopeEmoji(getZodiacInfo(editForm.birthday).horoscope)}{" "}
                      {getZodiacInfo(editForm.birthday).horoscope}
                    </span>
                  </div>
                </div>
              )}

              {/* Zodiac (Auto-generated) */}
              {editForm.birthday && (
                <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                  <span className="sm:w-24 flex-shrink-0">Zodiac:</span>
                  <div className="flex-1">
                    <span className="text-white text-[13px] sm:text-[14px]">
                      {getZodiacInfo(editForm.birthday).emoji} {getZodiacInfo(editForm.birthday).sign}
                    </span>
                  </div>
                </div>
              )}

              {/* Height */}
              <div className="flex flex-col text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                <span className="flex-shrink-0">Height:</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleHeightUnitChange("cm")}
                    variant={heightUnit === "cm" ? "gradient" : "outline"}
                    size="sm"
                    className="text-black h-[36px] sm:h-[40px] px-3 rounded-[8px] text-[11px] sm:text-[12px] flex-shrink-0"
                  >
                    cm
                  </Button>
                  <Button
                    onClick={() => handleHeightUnitChange("ft")}
                    variant={heightUnit === "ft" ? "gradient" : "outline"}
                    size="sm"
                    className="text-black h-[36px] sm:h-[40px] px-3 rounded-[8px] text-[11px] sm:text-[12px] flex-shrink-0"
                  >
                    ft/in
                  </Button>
                </div>

                {heightUnit === "cm" ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.height || ""}
                    onChange={(e) => setEditForm({ ...editForm, height: Number.parseFloat(e.target.value) || 0 })}
                    className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px]"
                    placeholder="0.00"
                  />
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="1"
                        value={editForm.heightFeet || ""}
                        onChange={(e) => setEditForm({ ...editForm, heightFeet: Number.parseInt(e.target.value) || 0 })}
                        className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px]"
                        placeholder="0 ft"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.heightInches || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, heightInches: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px]"
                        placeholder="0.00 in"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Weight */}
              <div className="flex flex-col sm:flex-row sm:items-center text-white/70 text-[13px] sm:text-[14px] leading-tight gap-2">
                <span className="sm:w-24 flex-shrink-0">Weight:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.weight || ""}
                  onChange={(e) => setEditForm({ ...editForm, weight: Number.parseFloat(e.target.value) || 0 })}
                  className="h-[36px] sm:h-[40px] bg-white/[0.06] border-white/[0.22] text-white placeholder:text-white/40 rounded-[8px] px-3 text-[13px] sm:text-[14px] flex-1"
                  placeholder="0.00 kg"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.birthday && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-[13px] sm:text-[14px] leading-tight">Birthday:</span>
                  <span className="text-white text-[13px] sm:text-[14px] leading-tight">
                    {formatBirthday(profile.birthday)}
                  </span>
                </div>
              )}

              {zodiacInfo.horoscope && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-[13px] sm:text-[14px] leading-tight">Horoscope:</span>
                  <span className="text-white text-[13px] sm:text-[14px] leading-tight">
                    {getHoroscopeEmoji(zodiacInfo.horoscope)} {zodiacInfo.horoscope}
                  </span>
                </div>
              )}

              {zodiacInfo.sign && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-[13px] sm:text-[14px] leading-tight">Zodiac:</span>
                  <span className="text-white text-[13px] sm:text-[14px] leading-tight">
                    {zodiacInfo.emoji} {zodiacInfo.sign}
                  </span>
                </div>
              )}

              {(profile?.height || profile?.heightFeet || profile?.heightInches || profile?.weight) && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-[13px] sm:text-[14px] leading-tight">Height & Weight:</span>
                  <span className="text-white text-[13px] sm:text-[14px] leading-tight text-right">
                    {formatHeight(profile)}
                    {formatHeight(profile) && formatWeight(profile.weight) && ", "}
                    {formatWeight(profile.weight)}
                  </span>
                </div>
              )}

              {!profile?.name && !profile?.birthday && !profile?.height && !profile?.weight && (
                <p className="text-white/40 text-[13px] sm:text-[14px] leading-tight">
                  Add in your information to give others a glimpse of who you are
                </p>
              )}
            </div>
          )}
        </div>

        {/* Interest Section */}
        <div className="bg-[#0E191F] rounded-[14px] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-[14px] sm:text-[16px] leading-tight">Interest</h3>
            <Button
              onClick={() => router.push("/profile/interest")}
              variant="ghost"
              size="sm"
              className="text-[#62CDCB] hover:text-[#4FBCBA] hover:bg-white/10 h-6 px-2 text-[12px] sm:text-[14px] font-medium transition-colors"
            >
              <Edit3 size={12} />
            </Button>
          </div>

          <div>
            {profile?.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="interest"
                    className="px-4 py-2 text-[13px] sm:text-[14px] leading-tight rounded-[100px] bg-white/[0.06] text-white"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => router.push("/profile/interest")}>
                <p className="text-white/40 text-[13px] sm:text-[14px] leading-tight">
                  Add in your interest to find a better match
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ImageModal />
    </div>
  )
}
