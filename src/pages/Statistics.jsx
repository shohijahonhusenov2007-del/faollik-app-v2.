import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { listenAchievements } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'

export default function Statistics() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenAchievements(user.uid, setAchievements)
    return unsub
  }, [user])

  const photoCount = achievements.reduce((sum, a) => sum + (a.imageUrls?.length || 0), 0)

  const monthlyData = useMemo(() => {
    const map = {}
    achievements.forEach(a => {
      const month = (a.date || '').slice(0, 7)
      if (!month) return
      map[month] = (map[month] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }))
  }, [achievements])

  const categoryData = STATIC_CATEGORIES.map(c => ({
    ...c,
    count: achievements.filter(a => a.categoryId === c.id).length
  }))
  const total = achievements.length

  return (
    <div className="page-content" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>Statistika</h1>

      <div className="stats-row" style={{ marginTop: 0, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card stat-green">
          <span className="stat-number">{total}</span>
          <span className="stat-label">Jami yutuq</span>
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

      <div className="section-header"><h2>Kategoriyalar bo'yicha</h2></div>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
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

      <div className="section-header"><h2>Oylik faollik</h2></div>
      <div style={{ background: 'white', borderRadius: 16, padding: '12px 8px', minHeight: 100 }}>
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
            Ma'lumot yo'q
          </p>
        )}
      </div>
    </div>
  )
}
