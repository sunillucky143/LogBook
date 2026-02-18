import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { TimeTracker } from './pages/TimeTracker'
import { Documents } from './pages/Documents'
import { DocumentEditor } from './pages/DocumentEditor'
import { History } from './pages/History'
import { Settings } from './pages/Settings'
import { Feedback } from './pages/Feedback'

function App() {
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
          </Routes>
        </Layout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default App
