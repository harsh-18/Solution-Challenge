// ============================================================
// ReliefSetu — Auth Context
// Demo mode: role-based login with local storage persistence
// ============================================================

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, UserRole } from '@/types/models'
import { DEMO_USERS } from '@/data/seedData'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isGoogleAuthenticated: boolean
  loginWithGoogle: () => Promise<void>
  login: (role: UserRole) => void
  loginAsUser: (userId: string) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const ROLE_PATHS: Record<UserRole, string> = {
  [UserRole.COORDINATOR]: '/coordinator',
  [UserRole.FIELD_WORKER]: '/field/report',
  [UserRole.VOLUNTEER]: '/volunteer/tasks',
  [UserRole.ADMIN]: '/admin/settings'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  
  // Load initial state from local storage to survive refreshes
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('reliefsetu_google_auth') === 'true'
  })

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reliefsetu_user')
    if (saved) {
      try {
        return JSON.parse(saved) as User
      } catch (e) {
        return null
      }
    }
    return null
  })

  // Sync to local storage whenever auth state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('reliefsetu_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('reliefsetu_user')
    }
    
    if (isGoogleAuthenticated) {
      localStorage.setItem('reliefsetu_google_auth', 'true')
    } else {
      localStorage.removeItem('reliefsetu_google_auth')
    }
  }, [user, isGoogleAuthenticated])

  const loginWithGoogle = useCallback(async () => {
    // Simulate network delay for OAuth
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsGoogleAuthenticated(true)
  }, [])

  const login = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role)
    if (demoUser) {
      setUser(demoUser)
      navigate(ROLE_PATHS[role])
    }
  }, [navigate])

  const loginAsUser = useCallback((userId: string) => {
    const demoUser = DEMO_USERS.find(u => u.id === userId)
    if (demoUser) {
      setUser(demoUser)
      navigate(ROLE_PATHS[demoUser.role])
    }
  }, [navigate])

  const logout = useCallback(() => {
    setUser(null)
    setIsGoogleAuthenticated(false)
    navigate('/')
  }, [navigate])

  const switchRole = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role)
    if (demoUser) {
      setUser(demoUser)
      navigate(ROLE_PATHS[role])
    }
  }, [navigate])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isGoogleAuthenticated,
      loginWithGoogle,
      login, 
      loginAsUser, 
      logout, 
      switchRole 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
