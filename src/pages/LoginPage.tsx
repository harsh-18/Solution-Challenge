// ============================================================
// ReliefSetu — Login Page
// Demo role selector — product-first entry
// ============================================================

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/models'
import { useNavigate } from 'react-router-dom'
import { Send, LayoutDashboard, ClipboardCheck, Settings, ArrowRight, Zap, Globe, Shield } from 'lucide-react'
import clsx from 'clsx'

const ROLE_CARDS = [
  {
    role: UserRole.FIELD_WORKER,
    label: 'Field Worker',
    description: 'Submit ground reports from mobile. Add text, location, photos, and urgency hints.',
    icon: Send,
    avatar: '👩🏽‍💼',
    name: 'Priya Sharma',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-200 hover:border-amber-300',
    path: '/field/report',
  },
  {
    role: UserRole.COORDINATOR,
    label: 'Coordinator',
    description: 'Review AI-extracted needs, approve tasks, match volunteers, monitor critical situations.',
    icon: LayoutDashboard,
    avatar: '👨🏽‍💻',
    name: 'Rajesh Kumar',
    color: 'from-brand-600 to-teal-400',
    bgColor: 'bg-brand-50 hover:bg-brand-100',
    borderColor: 'border-brand-200 hover:border-brand-300',
    path: '/coordinator',
  },
  {
    role: UserRole.VOLUNTEER,
    label: 'Volunteer',
    description: 'View assigned tasks, read AI-generated briefs, accept tasks, update progress.',
    icon: ClipboardCheck,
    avatar: '🧑🏽‍🤝‍🧑🏽',
    name: 'Amit Patel',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 hover:bg-violet-100',
    borderColor: 'border-violet-200 hover:border-violet-300',
    path: '/volunteer/tasks',
  },
  {
    role: UserRole.ADMIN,
    label: 'Admin',
    description: 'Manage volunteers, regions, skills, view audit logs and impact analytics.',
    icon: Settings,
    avatar: '👩🏽‍⚕️',
    name: 'Sneha Gupta',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200 hover:border-red-300',
    path: '/admin/settings',
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (role: UserRole, path: string) => {
    login(role)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-brand-50/30 to-surface-50 flex flex-col">
      {/* Demo Banner */}
      <div className="demo-banner">
        <span>🚀 Google Solution Challenge 2026 — Build with AI • Demo Mode</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-200">
              R
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-3">
            Relief<span className="text-gradient">Setu</span>
          </h1>
          <p className="text-base sm:text-lg text-surface-500 max-w-lg mx-auto leading-relaxed">
            Turn scattered community distress signals into coordinated volunteer action
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="badge bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" /> Gemini AI
            </span>
            <span className="badge bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">
              <Globe className="w-3 h-3 mr-1" /> Multilingual
            </span>
            <span className="badge bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1">
              <Shield className="w-3 h-3 mr-1" /> Smart Matching
            </span>
          </div>
        </div>

        {/* Role Cards */}
        <div className="w-full max-w-3xl">
          <p className="text-sm text-surface-500 text-center mb-4 font-medium">Select your role to begin the demo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {ROLE_CARDS.map((card, i) => (
              <button
                key={card.role}
                onClick={() => handleLogin(card.role, card.path)}
                className={clsx(
                  'card-interactive p-5 text-left border-2 transition-all duration-200 group',
                  card.borderColor,
                  'animate-slide-up'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm', card.color)}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900">{card.label}</h3>
                      <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-surface-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-surface-500 mt-1 leading-relaxed">{card.description}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-base">{card.avatar}</span>
                      <span className="text-xs text-surface-400">{card.name}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-surface-400">
            Powered by Vertex AI Gemini • Firebase • Cloud Run • Google Maps
          </p>
          <p className="text-[10px] text-surface-300 mt-1">
            Smart Resource Allocation • Open Innovation Track
          </p>
        </div>
      </div>
    </div>
  )
}
