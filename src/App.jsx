import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Booth from './views/Booth'
import Onboarding from './views/Onboarding'
import SellerPanel from './views/SellerPanel'
import ChatList from './views/ChatList'
import Conversation from './views/Conversation'
import Profile from './views/Profile'
import Transactions from './views/Transactions'
import Settings from './views/Settings'
import Help from './views/Help'
import ResetPassword from './views/ResetPassword'
import ItemEdit from './views/ItemEdit'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/seller/:id"      element={<Booth />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/onboarding"   element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/sell"              element={<ProtectedRoute><SellerPanel /></ProtectedRoute>} />
      <Route path="/sell/item/:itemId" element={<ProtectedRoute><ItemEdit /></ProtectedRoute>} />
      <Route path="/chat"         element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
      <Route path="/chat/:id"     element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/help"         element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
