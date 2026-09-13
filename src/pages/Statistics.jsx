import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, listenCategories } from '../lib/data'

const COLORS = ['#1B3A6B', '#2C4E8A', '#60A5FA', '#A855F7', '#F5A623', '#22C55E', '#EF4444']

export default function Statistics() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub1 = listenAchievements(user.uid, setAchievements)
    const unsub2 = listenCategories(user.uid, setCategories)
    return () => { unsub1(); unsub2() }
  }, [user])

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

  const categoryData = useMemo(() => {
    const map = {}
    achievements.forEach(a => {
      const name = a.categoryName || 'Boshqa'
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [achievements])

  return (
    <div className="page-content" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>Statistika</h1>

      <div className="stats-row" style={{ marginTop: 0, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card stat-green">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-label">Jami yutuqlar</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Kategoriyalar</span>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <>
          <div className="section-header"><h2>Oylik faollik</h2></div>
          <div style={{ background: 'white', borderRadius: 16, padding: '12px 8px', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} width={24} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B3A6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {categoryData.length > 0 && (
        <>
          <div className="section-header"><h2>Kategoriyalar bo'yicha</h2></div>
          <div style={{ background: 'white', borderRadius: 16, padding: '12px 8px', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {achievements.length === 0 && (
        <div className="empty-state">
          <p>Statistika ko'rish uchun avval yutuq qo'shing.</p>
        </div>
      )}
    </div>
  )
}
