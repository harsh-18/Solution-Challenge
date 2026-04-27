// ============================================================
// ReliefSetu — Auth Context
// Demo mode: role-based login without credentials
// ============================================================

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User, UserRole } from '@/types/models'
import { DEMO_USERS } from '@/data/seedData'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (role: UserRole) => void
  loginAsUser: (userId: string) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role)
    if (demoUser) setUser(demoUser)
  }, [])

  const loginAsUser = useCallback((userId: string) => {
    const demoUser = DEMO_USERS.find(u => u.id === userId)
    if (demoUser) setUser(demoUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role)
    if (demoUser) setUser(demoUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginAsUser, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
