import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ImageOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenCategories } from '../lib/data'

export default function Home() {
  const { user, profile } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub1 = listenAchievements(user.uid, setAchievements)
    const unsub2 = listenCategories(user.uid, setCategories)
    return () => { unsub1(); unsub2() }
  }, [user])

  const photoCount = achievements.filter(a => a.imageUrl).length
  const initial = (profile?.name || 'F').charAt(0).toUpperCase()

  return (
    <div>
      <div className="header-card">
        <div className="header-top-row">
          <h1 className="header-title">Bosh sahifa</h1>
          <span className="admin-badge">{profile?.role || 'Admin'}</span>
        </div>
        <Link to="/profil" className="user-card" style={{ textDecoration: 'none', color: 'white' }}>
          <div className="user-avatar">{initial}</div>
          <div style={{ flex: 1 }}>
            <p className="user-name">{profile?.name || 'Foydalanuvchi'}</p>
            <p className="user-role">{profile?.role || 'Administrator'}</p>
          </div>
          <ChevronRight size={20} opacity={0.8} />
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-green">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-label">Yutuqlar</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Kategoriyalar</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-number">{photoCount}</span>
          <span className="stat-label">Rasmlar</span>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 8 }}>
        <div className="section-header">
          <h2>Barcha yangi yutuqlar</h2>
          <Link to="/yutuqlar" className="link-btn">Barchasi <ChevronRight size={15} /></Link>
        </div>

        {achievements.length === 0 ? (
          <div className="empty-state">
            <ImageOff size={40} style={{ margin: '0 auto' }} />
            <p>Hali yutuq qo'shilmagan.</p>
          </div>
        ) : (
          achievements.slice(0, 5).map(a => (
            <div key={a.id} className="achievement-card">
              {a.imageUrl
                ? <img src={a.imageUrl} className="achievement-thumb" alt={a.title} />
                : <div className="achievement-thumb" />
              }
              <div className="achievement-info">
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-meta">{a.date}</p>
                {a.categoryName && <span className="category-pill">{a.categoryName}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
