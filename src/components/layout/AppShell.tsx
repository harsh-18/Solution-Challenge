// ============================================================
// ReliefSetu — App Shell Layout
// Responsive sidebar + top gradient layout
// ============================================================

import { ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/models'
import clsx from 'clsx'
import { Menu, X, LogOut } from 'lucide-react'

// Unified nav items matching the design mockups
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Command', path: '/coordinator' },
  { label: 'Field Intake', path: '/field/report' },
  { label: 'AI Review', path: '/coordinator/review', badge: '2' },
  { label: 'Task Queue', path: '/coordinator/tasks' },
  { label: 'Matching', path: '/coordinator/matching' },
  { label: 'Volunteer', path: '/volunteer/tasks' },
  { label: 'Map', path: '/map' },
  { label: 'Impact', path: '/impact' },
  { label: 'Settings', path: '/admin/settings' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { user, switchRole, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-col bg-[#fcfcfc] border-r border-surface-200 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          {/* Logo */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center text-white text-lg font-bold shadow-sm">
              RS
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold text-surface-900 tracking-tight leading-none mb-1">ReliefSetu</h1>
              <p className="text-[9px] text-surface-500 font-bold tracking-widest uppercase leading-none">Field Intelligence</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 ml-1">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {[UserRole.COORDINATOR, UserRole.FIELD_WORKER, UserRole.VOLUNTEER, UserRole.ADMIN].map(role => {
                const isActive = user.role === role;
                const labels = {
                  [UserRole.COORDINATOR]: 'Coordinator',
                  [UserRole.FIELD_WORKER]: 'Field Worker',
                  [UserRole.VOLUNTEER]: 'Volunteer',
                  [UserRole.ADMIN]: 'Admin'
                };
                return (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={clsx(
                      'py-2 px-1 text-[11px] font-bold rounded-lg border transition-all text-center',
                      isActive 
                        ? 'bg-[#ebfbf6] border-[#bbf0df] text-[#0f766e] shadow-sm' 
                        : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                    )}
                  >
                    {labels[role]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto border-t border-surface-100">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/coordinator' || item.path === '/map'}
                className={({ isActive }) => clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all',
                  isActive 
                    ? 'bg-[#ebfbf6] text-[#0f766e] border border-[#bbf0df] shadow-sm' 
                    : 'text-surface-600 hover:bg-surface-100 border border-transparent'
                )}
              >
                {item.label}
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Google Spine */}
          <div className="p-4 mt-auto border-t border-surface-100 bg-[#fafafa]">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 ml-1">Google Spine</p>
            <div className="flex flex-col gap-1.5">
              {['Vertex AI Gemini', 'Firestore', 'Cloud Run', 'Maps'].map(tech => (
                <div key={tech} className="px-3 py-1.5 rounded-full bg-white border border-surface-200 text-[11px] font-bold text-surface-500 shadow-sm">
                  {tech}
                </div>
              ))}
            </div>
            <button onClick={handleLogout} className="mt-6 w-full text-xs font-bold text-surface-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9f9] relative">
          {/* Subtle gradient background at the top of the app to match screenshots */}
          <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-br from-[#fcf4ec] via-[#f7fdfb] to-[#f9f9f9] pointer-events-none z-0"></div>

          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-200 relative z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white font-bold text-sm">
                RS
              </div>
              <span className="font-extrabold text-surface-900">ReliefSetu</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-surface-600">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute right-0 top-0 w-64 h-full bg-white shadow-2xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-extrabold text-surface-900">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
                </div>
                <nav className="space-y-1 flex-1 overflow-y-auto">
                  {NAV_ITEMS.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/coordinator' || item.path === '/map'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => clsx(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold',
                        isActive ? 'bg-[#ebfbf6] text-[#0f766e]' : 'text-surface-600'
                      )}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto relative z-10 p-4 sm:p-8">
            <div className="max-w-[1200px] mx-auto animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

