// ============================================================
// ReliefSetu — App Router
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { UserRole } from '@/types/models'

// Pages
import LoginPage from '@/pages/LoginPage'
import ReportIntake from '@/pages/fieldworker/ReportIntake'
import MyReports from '@/pages/fieldworker/MyReports'
import CommandCenter from '@/pages/coordinator/CommandCenter'
import ExtractionReview from '@/pages/coordinator/ExtractionReview'
import TaskQueue from '@/pages/coordinator/TaskQueue'
import VolunteerMatching from '@/pages/coordinator/VolunteerMatching'
import VolunteerTaskView from '@/pages/volunteer/TaskView'
import MapView from '@/pages/MapView'
import ImpactSummary from '@/pages/ImpactSummary'
import AdminSettings from '@/pages/admin/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <AppShell>{children}</AppShell>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/coordinator" replace /> : <LoginPage />} />

      {/* Field Worker */}
      <Route path="/field/report" element={<ProtectedRoute><ReportIntake /></ProtectedRoute>} />
      <Route path="/field/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />

      {/* Coordinator */}
      <Route path="/coordinator" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
      <Route path="/coordinator/review" element={<ProtectedRoute><ExtractionReview /></ProtectedRoute>} />
      <Route path="/coordinator/tasks" element={<ProtectedRoute><TaskQueue /></ProtectedRoute>} />
      <Route path="/coordinator/matching" element={<ProtectedRoute><VolunteerMatching /></ProtectedRoute>} />

      {/* Volunteer */}
      <Route path="/volunteer/tasks" element={<ProtectedRoute><VolunteerTaskView /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
      <Route path="/impact" element={<ProtectedRoute><ImpactSummary /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
