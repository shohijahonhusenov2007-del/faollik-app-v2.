import { useEffect, useState } from 'react'
import { Trash2, ImageOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenCategories, deleteAchievement } from '../lib/data'

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub1 = listenAchievements(user.uid, setAchievements)
    const unsub2 = listenCategories(user.uid, setCategories)
    return () => { unsub1(); unsub2() }
  }, [user])

  const filtered = filter
    ? achievements.filter(a => a.categoryId === filter)
    : achievements

  const handleDelete = async (a) => {
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id, a.imagePath)
    }
  }

  return (
    <div className="page-content" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>Yutuqlar</h1>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
          <button
            onClick={() => setFilter('')}
            className="category-pill"
            style={{
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: filter === '' ? 'var(--color-primary)' : '#EEF2FF',
              color: filter === '' ? 'white' : 'var(--color-primary)'
            }}>
            Barchasi
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className="category-pill"
              style={{
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: filter === c.id ? 'var(--color-primary)' : '#EEF2FF',
                color: filter === c.id ? 'white' : 'var(--color-primary)'
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ImageOff size={40} style={{ margin: '0 auto' }} />
          <p>Hali yutuq qo'shilmagan.</p>
        </div>
      ) : (
        filtered.map(a => (
          <div key={a.id} className="achievement-card">
            {a.imageUrl
              ? <img src={a.imageUrl} className="achievement-thumb" alt={a.title} />
              : <div className="achievement-thumb" />
            }
            <div className="achievement-info">
              <p className="achievement-title">{a.title}</p>
              {a.description && (
                <p className="achievement-meta" style={{ marginBottom: 2 }}>{a.description}</p>
              )}
              <p className="achievement-meta">{a.date}</p>
              {a.categoryName && <span className="category-pill">{a.categoryName}</span>}
            </div>
            <button className="icon-btn" onClick={() => handleDelete(a)}>
              <Trash2 size={18} color="#DC2626" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}
