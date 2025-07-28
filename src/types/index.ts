export interface User {
  id: string
  email: string
  username: string
}

export interface Profile {
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

export interface LoginRequest {
  email?: string
  username?: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user?: User
}
