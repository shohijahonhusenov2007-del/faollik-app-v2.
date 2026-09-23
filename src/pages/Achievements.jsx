import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, ImageOff, SlidersHorizontal, X, Heart } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenAllAchievements, deleteAchievement, toggleLike } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'
import CategoryBadge from '../components/CategoryBadge'
import { useLanguage } from '../context/LanguageContext'

export default function Achievements() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const isAdmin = profile?.role === 'Administrator'
  const [achievements, setAchievements] = useState([])
  const [allAchievements, setAllAchievements] = useState([])
  const [users, setUsers] = useState([])
  const [viewMode, setViewMode] = useState('personal')
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

  useEffect(() => {
    if (!isAdmin) return
    const unsub = listenAllAchievements(setAllAchievements)
    return unsub
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadUsers()
  }, [isAdmin])

  const authorName = (uid) => users.find(u => u.id === uid)?.name || ''
  const sourceList = (isAdmin && viewMode === 'all') ? allAchievements : achievements

  const filtered = sourceList
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

  const handleLike = async (e, a) => {
    e.preventDefault()
    e.stopPropagation()
    const liked = (a.likes || []).includes(user.uid)
    await toggleLike(a.id, user.uid, liked)
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
          <h1 className="header-title">{t('stat_achievements')}</h1>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className={`filter-chip ${viewMode === 'personal' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setViewMode('personal')}
            >
              {t('ach_personal')}
            </button>
            <button
              className={`filter-chip ${viewMode === 'all' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setViewMode('all')}
            >
              {t('ach_all')}
            </button>
          </div>
        )}
        <div className="header-search-row">
          <div className="header-search">
            <Search size={16} />
            <input
              placeholder={t('search_placeholder')}
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
          {t('see_all')}
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
            <p>{t('empty_nothing_found')}</p>
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
                <p className="achievement-meta">
                  {a.date}{isAdmin && viewMode === 'all' && authorName(a.uid) ? ` • ${authorName(a.uid)}` : ''}
                </p>
                <CategoryBadge categoryId={a.categoryId} name={a.categoryName} />
              </div>
              <button
                className="icon-btn"
                onClick={(e) => handleLike(e, a)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              >
                <Heart
                  size={17}
                  color={(a.likes || []).includes(user.uid) ? '#EF4444' : 'var(--color-text-muted)'}
                  fill={(a.likes || []).includes(user.uid) ? '#EF4444' : 'none'}
                />
                <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>{(a.likes || []).length || ''}</span>
              </button>
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
              <h3 className="modal-title">{t('filter_sheet_title')}</h3>
              <button className="icon-btn" onClick={() => setShowFilterSheet(false)}><X size={22} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">{t('sort_label')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`filter-chip ${sortOrder === 'desc' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setSortOrder('desc')}
                >
                  {t('sort_new_first')}
                </button>
                <button
                  className={`filter-chip ${sortOrder === 'asc' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setSortOrder('asc')}
                >
                  {t('sort_old_first')}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('date_range_label')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>

            <button className="btn-secondary" onClick={clearFilters} style={{ marginBottom: 8 }}>
              {t('clear_filters')}
            </button>
            <button className="btn-primary" onClick={() => setShowFilterSheet(false)}>
              {t('apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
