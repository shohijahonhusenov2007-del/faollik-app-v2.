import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { listenCategories } from './lib/data'

import BottomNav from './components/BottomNav'
import AddAchievementModal from './components/AddAchievementModal'
import Home from './pages/Home'
import Achievements from './pages/Achievements'
import Chat from './pages/Chat'
import Statistics from './pages/Statistics'
import Profile from './pages/Profile'
import Login from './pages/Login'

function AppShell() {
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenCategories(user.uid, setCategories)
    return unsub
  }, [user])

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/yutuqlar" element={<Achievements />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/statistika" element={<Statistics />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav onAddClick={() => setShowAdd(true)} />
      {showAdd && (
        <AddAchievementModal
          uid={user.uid}
          categories={categories}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="spinner-wrap">Yuklanmoqda...</div>
  }

  if (!user) {
    return <Login />
  }

  return <AppShell />
}
