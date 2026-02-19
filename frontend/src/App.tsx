import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { TimeTracker } from './pages/TimeTracker'
import { Documents } from './pages/Documents'
import { DocumentEditor } from './pages/DocumentEditor'
import { History } from './pages/History'
import { Settings } from './pages/Settings'
import { Feedback } from './pages/Feedback'
import { AdminDashboard } from './pages/AdminDashboard'
import { DocsPage } from './pages/DocsPage'
import { LandingPage } from './pages/LandingPage'
import { useAuthStore } from './stores/authStore'
import { useApi } from './services/api'
import { useEffect } from 'react'

import { useAuth } from '@clerk/clerk-react'

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const api = useApi()
  const { isSignedIn, isLoaded } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUser(api)
    }
  }, [fetchUser, api, isLoaded, isSignedIn])

  // Docs page is public — accessible without authentication
  if (location.pathname === '/docs') {
    return <DocsPage />
  }

  return (
    <>
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracker" element={<TimeTracker />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentEditor />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  )
}

export default App
