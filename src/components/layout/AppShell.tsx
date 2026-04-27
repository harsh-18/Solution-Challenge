// ============================================================
// ReliefSetu — App Shell Layout
// Responsive sidebar + mobile bottom nav
// ============================================================

import { ReactNode } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/models'
import clsx from 'clsx'
import {
  LayoutDashboard, FileText, ListChecks, Users, Map, BarChart3,
  Settings, LogOut, Send, ClipboardCheck, UserCheck, Bell, Menu, X,
  ChevronDown, Shield
} from 'lucide-react'
import { useState } from 'react'

import { ElementType } from 'react'

const NAV_ITEMS: Record<UserRole, { label: string, path: string, icon: ElementType }[]> = {
  [UserRole.COORDINATOR]: [
    { label: 'Command Center', path: '/coordinator', icon: LayoutDashboard },
    { label: 'Reports Review', path: '/coordinator/review', icon: FileText },
    { label: 'Task Queue', path: '/coordinator/tasks', icon: ListChecks },
    { label: 'Volunteer Match', path: '/coordinator/matching', icon: UserCheck },
    { label: 'Map View', path: '/map', icon: Map },
    { label: 'Impact', path: '/impact', icon: BarChart3 },
  ],
  [UserRole.FIELD_WORKER]: [
    { label: 'Submit Report', path: '/field/report', icon: Send },
    { label: 'My Reports', path: '/field/my-reports', icon: FileText },
    { label: 'Map View', path: '/map', icon: Map },
  ],
  [UserRole.VOLUNTEER]: [
    { label: 'My Tasks', path: '/volunteer/tasks', icon: ClipboardCheck },
    { label: 'Map View', path: '/map', icon: Map },
    { label: 'Impact', path: '/impact', icon: BarChart3 },
  ],
  [UserRole.ADMIN]: [
    { label: 'Command Center', path: '/coordinator', icon: LayoutDashboard },
    { label: 'Task Queue', path: '/coordinator/tasks', icon: ListChecks },
    { label: 'Volunteers', path: '/admin/settings', icon: Users },
    { label: 'Map View', path: '/map', icon: Map },
    { label: 'Impact', path: '/impact', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.FIELD_WORKER]: 'Field Worker',
  [UserRole.COORDINATOR]: 'Coordinator',
  [UserRole.VOLUNTEER]: 'Volunteer',
  [UserRole.ADMIN]: 'Admin',
}

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.FIELD_WORKER]: 'bg-amber-100 text-amber-700',
  [UserRole.COORDINATOR]: 'bg-brand-100 text-brand-700',
  [UserRole.VOLUNTEER]: 'bg-violet-100 text-violet-700',
  [UserRole.ADMIN]: 'bg-red-100 text-red-700',
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  if (!user) return null

  const navItems = NAV_ITEMS[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo Mode Banner */}
      <div className="demo-banner flex items-center justify-center gap-2">
        <Shield className="w-3 h-3" />
        <span>Demo Mode — Using simulated data & AI</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">ReliefSetu for Google Solution Challenge 2026</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-surface-200 shrink-0">
          {/* Logo */}
          <div className="p-5 border-b border-surface-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-teal-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                R
              </div>
              <div>
                <h1 className="text-base font-bold text-surface-900 tracking-tight">ReliefSetu</h1>
                <p className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">Field Intelligence</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/coordinator'}
                className={({ isActive }) => clsx(
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-surface-100">
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 transition-colors"
              >
                <span className="text-2xl">{user.avatar}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{user.name}</p>
                  <span className={clsx('badge text-[10px]', ROLE_COLORS[user.role])}>{ROLE_LABELS[user.role]}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-surface-400" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleSwitcher && (
                <div className="absolute bottom-full left-0 w-full mb-1 bg-white rounded-xl border border-surface-200 shadow-lg p-2 animate-slide-up z-50">
                  <p className="text-[10px] text-surface-400 uppercase tracking-wider font-medium px-2 py-1">Switch Role</p>
                  {Object.values(UserRole).map(role => (
                    <button
                      key={role}
                      onClick={() => { switchRole(role); setShowRoleSwitcher(false) }}
                      className={clsx(
                        'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors',
                        user.role === role ? 'bg-brand-50 text-brand-700 font-medium' : 'text-surface-600 hover:bg-surface-50'
                      )}
                    >
                      <span className={clsx('badge text-[10px]', ROLE_COLORS[role])}>{ROLE_LABELS[role]}</span>
                    </button>
                  ))}
                  <div className="border-t border-surface-100 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className="font-bold text-surface-900">ReliefSetu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx('badge text-[10px]', ROLE_COLORS[user.role])}>{ROLE_LABELS[user.role]}</span>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-icon btn-ghost">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute right-0 top-0 w-72 h-full bg-white shadow-2xl p-4 animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-surface-900">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/coordinator'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => clsx(isActive ? 'sidebar-link-active' : 'sidebar-link')}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-6 border-t border-surface-100 pt-4">
                  <p className="text-[10px] text-surface-400 uppercase tracking-wider font-medium px-2 mb-2">Switch Role</p>
                  {Object.values(UserRole).map(role => (
                    <button
                      key={role}
                      onClick={() => { switchRole(role); setMobileMenuOpen(false) }}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                        user.role === role ? 'bg-brand-50 text-brand-700 font-medium' : 'text-surface-600 hover:bg-surface-50'
                      )}
                    >
                      <span className={clsx('badge text-[10px]', ROLE_COLORS[role])}>{ROLE_LABELS[role]}</span>
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto bg-surface-50">
            <div className="page-enter">
              {children}
            </div>
          </div>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden flex items-center justify-around bg-white border-t border-surface-200 px-2 py-1 safe-area-pb">
            {navItems.slice(0, 5).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/coordinator'}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]',
                  isActive ? 'text-brand-700' : 'text-surface-400'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </nav>
        </main>
      </div>
    </div>
  )
}
