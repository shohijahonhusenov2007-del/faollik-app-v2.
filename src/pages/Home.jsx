import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ImageOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenAchievements } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'

export default function Home() {
  const { user, profile } = useAuth()
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenAchievements(user.uid, setAchievements)
    return unsub
  }, [user])

  const photoCount = achievements.reduce((sum, a) => sum + (a.imageUrls?.length || 0), 0)
  const initial = (profile?.name || 'F').charAt(0).toUpperCase()

  return (
    <div className="flex-page">
      <div className="header-card">
        <div className="header-top-row">
          <h1 className="header-title">Bosh sahifa</h1>
          <span className="admin-badge">{profile?.role || 'Admin'}</span>
        </div>
        <Link to="/profil" className="user-card" style={{ textDecoration: 'none', color: 'white' }}>
          <div className="user-avatar">
            {profile?.photoUrl ? <img src={profile.photoUrl} alt="" /> : initial}
          </div>
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
          <span className="stat-number">{STATIC_CATEGORIES.length}</span>
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
            <Link key={a.id} to={`/yutuqlar/${a.id}`} className="achievement-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              {a.imageUrls && a.imageUrls[0]
                ? <img src={a.imageUrls[0]} className="achievement-thumb" alt={a.title} />
                : <div className="achievement-thumb" />
              }
              <div className="achievement-info">
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-meta">{a.date}</p>
                {a.categoryName && <span className="category-pill">{a.categoryName}</span>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
