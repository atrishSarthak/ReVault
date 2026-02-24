import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

import SellerDashboard from './pages/SellerDashboard'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return null // or a loading spinner
  if (!isSignedIn) return <Navigate to="/sign-in" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/seller" element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
