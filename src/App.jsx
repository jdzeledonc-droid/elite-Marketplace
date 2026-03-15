import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/seller/:id"   element={<Booth />} />
        <Route path="/onboarding"   element={<Onboarding />} />
        <Route path="/sell"         element={<SellerPanel />} />
        <Route path="/chat"         element={<ChatList />} />
        <Route path="/chat/:id"     element={<Conversation />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="/help"         element={<Help />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
