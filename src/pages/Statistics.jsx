import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { collection, getDocs } from 'firebase/firestore'
import { Trophy } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenAllAchievements } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'
import { useLanguage } from '../context/LanguageContext'

export default function Statistics() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const isAdmin = profile?.role === 'Administrator'
  const [achievements, setAchievements] = useState([])
  const [allAchievements, setAllAchievements] = useState([])
  const [users, setUsers] = useState([])
  const [viewMode, setViewMode] = useState('personal')

  useEffect(() => {
    if (!user) return
    const unsub = listenAchievements(user.uid, setAchievements)
    return unsub
  }, [user])

  useEffect(() => {
    const unsub = listenAllAchievements(setAllAchievements)
    return unsub
  }, [])

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadUsers()
  }, [])

  const sourceList = (isAdmin && viewMode === 'all') ? allAchievements : achievements
  const photoCount = sourceList.reduce((sum, a) => sum + (a.imageUrls?.length || 0), 0)

  const monthKey = new Date().toISOString().slice(0, 7)
  const thisMonthCount = sourceList.filter(a => (a.date || '').startsWith(monthKey)).length

  const leaderboard = useMemo(() => {
    const counts = {}
    allAchievements.forEach(a => {
      if (!a.uid) return
      counts[a.uid] = (counts[a.uid] || 0) + 1
    })
    return Object.entries(counts)
      .map(([uid, count]) => ({
        uid, count,
        name: users.find(u => u.id === uid)?.name || 'Foydalanuvchi',
        photoUrl: users.find(u => u.id === uid)?.photoUrl
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [allAchievements, users])

  const monthlyData = useMemo(() => {
    const map = {}
    sourceList.forEach(a => {
      const month = (a.date || '').slice(0, 7)
      if (!month) return
      map[month] = (map[month] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }))
  }, [sourceList])

  const categoryData = STATIC_CATEGORIES.map(c => ({
    ...c,
    count: sourceList.filter(a => a.categoryId === c.id).length
  }))
  const total = sourceList.length

  return (
    <div className="page-content" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>{t('nav_stats')}</h1>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`filter-chip ${viewMode === 'personal' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setViewMode('personal')}
          >
            {t('personal_stats')}
          </button>
          <button
            className={`filter-chip ${viewMode === 'all' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setViewMode('all')}
          >
            {t('overall_stats')}
          </button>
        </div>
      )}

      <div className="stats-row" style={{ marginTop: 0, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card stat-green">
          <span className="stat-number">{total}</span>
          <span className="stat-label">{t('total_achievements')}</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{STATIC_CATEGORIES.length}</span>
          <span className="stat-label">{t('stat_categories')}</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-number">{photoCount}</span>
          <span className="stat-label">{t('stat_images')}</span>
        </div>
      </div>

      {thisMonthCount > 0 && (
        <div style={{
          margin: '4px 0 16px', padding: '10px 14px', borderRadius: 12,
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))', color: 'white',
          fontSize: 13.5, fontWeight: 600, textAlign: 'center'
        }}>
          {(isAdmin && viewMode === 'all') ? t('team_progress', { count: thisMonthCount }) : t('you_progress', { count: thisMonthCount })}
        </div>
      )}

      <div className="section-header"><h2>{t('by_category')}</h2></div>
      <div style={{ background: 'var(--color-card)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 130, height: 130, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.filter(c => c.count > 0)}
                dataKey="count" nameKey="name"
                innerRadius={38} outerRadius={62}
                paddingAngle={2}
              >
                {categoryData.filter(c => c.count > 0).map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {categoryData.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--color-text)' }}>{c.name.split(' ')[0]}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {c.count} ({total > 0 ? Math.round((c.count / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header"><h2>{t('monthly_activity')}</h2></div>
      <div style={{ background: 'var(--color-card)', borderRadius: 16, padding: '12px 8px', minHeight: 100 }}>
        {monthlyData.length > 0 ? (
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} width={24} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px 0', margin: 0 }}>
            {t('no_data')}
          </p>
        )}
      </div>

      <div className="section-header"><h2><Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t('leaderboard')}</h2></div>
      <div style={{ background: 'var(--color-card)', borderRadius: 16, padding: '6px 4px' }}>
        {leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px 0', margin: 0 }}>
            {t('no_data')}
          </p>
        ) : (
          leaderboard.map((u, i) => (
            <Link
              key={u.uid}
              to={`/foydalanuvchi/${u.uid}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 10, textDecoration: 'none', color: 'inherit',
                background: u.uid === user?.uid ? 'rgba(79, 63, 224, 0.08)' : 'transparent'
              }}
            >
              <span style={{ width: 20, fontWeight: 700, fontSize: 13.5, color: 'var(--color-text-muted)' }}>
                {i + 1}
              </span>
              <div className="chat-list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {u.photoUrl ? <img src={u.photoUrl} alt="" /> : u.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: u.uid === user?.uid ? 700 : 500 }}>
                {u.name}{u.uid === user?.uid ? ' ' + t('you_suffix') : ''}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-primary)' }}>{u.count}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
