import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAuthStore } from '@/store/authStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import AuthCallback from '@/pages/AuthCallback'
import Dashboard from '@/pages/Dashboard'
import NewProposal from '@/pages/NewProposal'
import SmartMode from '@/pages/SmartMode'
import TemplateMode from '@/pages/TemplateMode'
import ProposalDetail from '@/pages/ProposalDetail'
import PublicProposal from '@/pages/PublicProposal'
import Analytics from '@/pages/Analytics'
import Templates from '@/pages/Templates'
import Settings from '@/pages/Settings'
import Pricing from '@/pages/Pricing'
import NotFound from '@/pages/NotFound'

function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/settings/billing"
          element={<Navigate to="/settings?tab=billing" replace />}
        />
        <Route path="/p/:shareToken" element={<PublicProposal />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/proposals/new" element={<NewProposal />} />
            <Route path="/proposals/new/smart" element={<SmartMode />} />
            <Route path="/proposals/new/template" element={<TemplateMode />} />
            <Route path="/proposals/:id" element={<ProposalDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
