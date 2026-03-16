import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

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

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/seller/:id"   element={<Booth />} />
      <Route path="/onboarding"   element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/sell"         element={<ProtectedRoute><SellerPanel /></ProtectedRoute>} />
      <Route path="/chat"         element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
      <Route path="/chat/:id"     element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/help"         element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
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
