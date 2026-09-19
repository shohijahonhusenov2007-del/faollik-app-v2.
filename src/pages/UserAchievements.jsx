import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { listenAchievements } from '../lib/data'
import CategoryBadge from '../components/CategoryBadge'

export default function UserAchievements() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [targetUser, setTargetUser] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) setTargetUser({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    load()
  }, [uid])

  useEffect(() => {
    const unsub = listenAchievements(uid, setAchievements)
    return unsub
  }, [uid])

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>{targetUser?.name || 'Foydalanuvchi'}</h3>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : achievements.length === 0 ? (
          <div className="empty-state">
            <ImageOff size={40} style={{ margin: '0 auto' }} />
            <p>Hali yutuq yo'q.</p>
          </div>
        ) : (
          achievements.map(a => (
            <Link
              key={a.id}
              to={`/yutuqlar/${a.id}`}
              className="achievement-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {a.imageUrls && a.imageUrls[0]
                ? <img src={a.imageUrls[0]} className="achievement-thumb" alt={a.title} />
                : <div className="achievement-thumb" />
              }
              <div className="achievement-info">
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-meta">{a.date}</p>
                <CategoryBadge categoryId={a.categoryId} name={a.categoryName} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
