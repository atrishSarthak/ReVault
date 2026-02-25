import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import CreateListing from './pages/seller/CreateListing'
import AdminDashboard from './pages/admin/AdminDashboard'
import BuyerDashboard from './pages/buyer/BuyerDashboard'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return null // or a loading spinner
  if (!isSignedIn) return <Navigate to="/sign-in" />
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />

        {/* Clerk Auth Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Seller Flow */}
        <Route path="/seller" element={
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        } />

        {/* Protected Admin Flow */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Buyer Flow */}
        <Route path="/buyer" element={
          <ProtectedRoute>
            <BuyerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
