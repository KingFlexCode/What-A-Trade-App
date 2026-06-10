import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import AppLayout from './components/layout/AppLayout'

// Pages
import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'
import OnboardingPage  from './pages/OnboardingPage'
import DashboardPage   from './pages/DashboardPage'
import TradesPage      from './pages/TradesPage'
import TradeDetailPage from './pages/TradeDetailPage'
import LogTradePage    from './pages/LogTradePage'
import CalendarPage    from './pages/CalendarPage'
import AnalyticsPage   from './pages/AnalyticsPage'
import RiskPage        from './pages/RiskPage'
import InsightsPage    from './pages/InsightsPage'
import PlaybooksPage   from './pages/PlaybooksPage'
import BrokersPage     from './pages/BrokersPage'
import SettingsPage    from './pages/SettingsPage'

// Guard: redirect to login if not authenticated
function Private({ children }) {
  const { isAuthenticated, onboardingComplete } = useStore()
  if (!isAuthenticated)       return <Navigate to="/login"      replace />
  if (!onboardingComplete)    return <Navigate to="/onboarding" replace />
  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/signup"     element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected */}
      <Route path="/"          element={<Private><DashboardPage /></Private>} />
      <Route path="/trades"    element={<Private><TradesPage /></Private>} />
      <Route path="/trades/:id" element={<Private><TradeDetailPage /></Private>} />
      <Route path="/log"       element={<Private><LogTradePage /></Private>} />
      <Route path="/log/:id"   element={<Private><LogTradePage /></Private>} />
      <Route path="/calendar"  element={<Private><CalendarPage /></Private>} />
      <Route path="/analytics" element={<Private><AnalyticsPage /></Private>} />
      <Route path="/risk"      element={<Private><RiskPage /></Private>} />
      <Route path="/insights"  element={<Private><InsightsPage /></Private>} />
      <Route path="/playbooks" element={<Private><PlaybooksPage /></Private>} />
      <Route path="/brokers"   element={<Private><BrokersPage /></Private>} />
      <Route path="/settings"  element={<Private><SettingsPage /></Private>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
