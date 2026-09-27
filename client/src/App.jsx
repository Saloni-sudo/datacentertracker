import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import HomePage from './pages/HomePage'
import ReportsPage from './pages/ReportsPage'
import MethodologyPage from './pages/MethodologyPage'
import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import GuidelinesPage from './pages/GuidelinesPage'
import CorrectionsPage from './pages/CorrectionsPage'
import StatsPage from './pages/StatsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import RequireAuth from './components/RequireAuth'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/corrections" element={<CorrectionsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>

        {/* Admin stays URL-only: no link from the public navigation. */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
