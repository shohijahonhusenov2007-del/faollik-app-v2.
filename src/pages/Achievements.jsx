import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, ImageOff, SlidersHorizontal, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, deleteAchievement } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub = listenAchievements(user.uid, setAchievements)
    return unsub
  }, [user])

  const filtered = achievements
    .filter(a => (filter ? a.categoryId === filter : true))
    .filter(a => (search ? a.title.toLowerCase().includes(search.toLowerCase()) : true))
    .filter(a => (dateFrom ? a.date >= dateFrom : true))
    .filter(a => (dateTo ? a.date <= dateTo : true))
    .sort((a, b) => sortOrder === 'desc'
      ? (b.date || '').localeCompare(a.date || '')
      : (a.date || '').localeCompare(b.date || '')
    )

  const handleDelete = async (e, a) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id)
    }
  }

  const clearFilters = () => {
    setSortOrder('desc')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilter = sortOrder !== 'desc' || dateFrom || dateTo

  return (
    <div className="flex-page">
      <div className="header-card" style={{ paddingBottom: 20 }}>
        <div className="header-top-row" style={{ marginBottom: 0 }}>
          <h1 className="header-title">Yutuqlar</h1>
        </div>
        <div className="header-search-row">
          <div className="header-search">
            <Search size={16} />
            <input
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="filter-icon-btn" onClick={() => setShowFilterSheet(true)} style={{ position: 'relative' }}>
            <SlidersHorizontal size={18} />
            {hasActiveFilter && (
              <span style={{
                position: 'absolute', top: -2, right: -2, width: 9, height: 9,
                borderRadius: '50%', background: '#F5A623'
              }} />
            )}
          </button>
        </div>
      </div>

      <div className="filter-chips">
        <button
          onClick={() => setFilter('')}
          className={`filter-chip ${filter === '' ? 'active' : ''}`}>
          Barchasi
        </button>
        {STATIC_CATEGORIES.map(c => (
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
                {a.description && (
                  <p className="achievement-meta" style={{ marginBottom: 2 }}>{a.description}</p>
                )}
                <p className="achievement-meta">{a.date}</p>
                {a.categoryName && <span className="category-pill">{a.categoryName}</span>}
              </div>
              <button className="icon-btn" onClick={(e) => handleDelete(e, a)}>
                <Trash2 size={18} color="#DC2626" />
              </button>
            </Link>
          ))
        )}
      </div>

      {showFilterSheet && (
        <div className="modal-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title">Filtrlash</h3>
              <button className="icon-btn" onClick={() => setShowFilterSheet(false)}><X size={22} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Saralash</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`filter-chip ${sortOrder === 'desc' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setSortOrder('desc')}
                >
                  Yangi birinchi
                </button>
                <button
                  className={`filter-chip ${sortOrder === 'asc' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setSortOrder('asc')}
                >
                  Eski birinchi
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sana oralig'i</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>

            <button className="btn-secondary" onClick={clearFilters} style={{ marginBottom: 8 }}>
              Tozalash
            </button>
            <button className="btn-primary" onClick={() => setShowFilterSheet(false)}>
              Qo'llash
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
