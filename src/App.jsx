import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { STATIC_CATEGORIES } from './lib/categories'

import BottomNav from './components/BottomNav'
import AddAchievementModal from './components/AddAchievementModal'
import UpdateBanner from './components/UpdateBanner'
import OfflineBanner from './components/OfflineBanner'
import Home from './pages/Home'
import Achievements from './pages/Achievements'
import AchievementDetail from './pages/AchievementDetail'
import ChatList from './pages/ChatList'
import ChatThread from './pages/ChatThread'
import Statistics from './pages/Statistics'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import AdminUserDetail from './pages/AdminUserDetail'
import UserAchievements from './pages/UserAchievements'
import Login from './pages/Login'
import NotificationBell from './components/NotificationBell'
import { LanguageProvider } from './context/LanguageContext'

function AppShell() {
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const location = useLocation()
  const hideNav = /^\/chat\/[^/]+$/.test(location.pathname)

  return (
    <div className="app-shell">
      <UpdateBanner />
      <OfflineBanner />
      <NotificationBell />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/yutuqlar" element={<Achievements />} />
        <Route path="/yutuqlar/:id" element={<AchievementDetail />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatThread />} />
        <Route path="/statistika" element={<Statistics />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/foydalanuvchi/:uid" element={<AdminUserDetail />} />
        <Route path="/foydalanuvchi/:uid" element={<UserAchievements />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav onAddClick={() => setShowAdd(true)} />}
      {showAdd && (
        <AddAchievementModal
          uid={user.uid}
          categories={STATIC_CATEGORIES}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <LanguageProvider>
      {loading ? (
        <div className="spinner-wrap">Yuklanmoqda...</div>
      ) : !user ? (
        <Login />
      ) : (
        <AppShell />
      )}
    </LanguageProvider>
  )
}
