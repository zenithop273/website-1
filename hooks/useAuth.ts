'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  id: string
  name: string
  email: string
  username: string
  bio: string
  profileImage: string
  theme: string
  emailVerified?: boolean
}

interface AuthState {
  token: string | null
  user: UserProfile | null
  setAuth: (token: string, user: UserProfile) => void
  updateUser: (user: Partial<UserProfile>) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (partial) => set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null
      })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'linknest-auth' }
  )
)

// Fetch helper with auth header
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = useAuth.getState().token
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
}
