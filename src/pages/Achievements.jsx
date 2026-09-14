import { useEffect, useState } from 'react'
import { Search, Trash2, ImageOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenCategories, deleteAchievement } from '../lib/data'

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub1 = listenAchievements(user.uid, setAchievements)
    const unsub2 = listenCategories(user.uid, setCategories)
    return () => { unsub1(); unsub2() }
  }, [user])

  const filtered = achievements
    .filter(a => (filter ? a.categoryId === filter : true))
    .filter(a => (search ? a.title.toLowerCase().includes(search.toLowerCase()) : true))

  const handleDelete = async (a) => {
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id, a.imagePaths)
    }
  }

  return (
    <div>
      <div className="header-card" style={{ paddingBottom: 20 }}>
        <div className="header-top-row" style={{ marginBottom: 0 }}>
          <h1 className="header-title">Yutuqlar</h1>
        </div>
        <div className="header-search">
          <Search size={16} />
          <input
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-chips">
        <button
          onClick={() => setFilter('')}
          className={`filter-chip ${filter === '' ? 'active' : ''}`}>
          Barchasi
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`filter-chip ${filter === c.id ? 'active' : ''}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ImageOff size={40} style={{ margin: '0 auto' }} />
            <p>Hech narsa topilmadi.</p>
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} className="achievement-card">
              {a.imageUrls && a.imageUrls[0]
                ? <img src={a.imageUrls[0]} className="achievement-thumb" alt={a.title} />
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
    </div>
  )
}
