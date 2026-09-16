import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenAllAchievements, deleteAchievement } from '../lib/data'

export default function AdminPanel() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('achievements')

  useEffect(() => {
    const unsub = listenAllAchievements(setAchievements)
    return unsub
  }, [])

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadUsers()
  }, [])

  if (profile && profile.role !== 'Administrator') {
    return <Navigate to="/profil" replace />
  }

  const handleDelete = async (a) => {
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id)
    }
  }

  const userName = (uid) => users.find(u => u.id === uid)?.name || '-'

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>Admin panel</h3>
      </div>

      <div className="fullpage-content">
        <div className="filter-chips" style={{ padding: 0, marginBottom: 16 }}>
          <button
            className={`filter-chip ${tab === 'achievements' ? 'active' : ''}`}
            onClick={() => setTab('achievements')}
          >
            Yutuqlar
          </button>
          <button
            className={`filter-chip ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            Foydalanuvchilar
          </button>
        </div>

        {tab === 'achievements' && (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Jami: {achievements.length} ta yutuq (barcha foydalanuvchilar)
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Nomi</th>
                    <th>Kategoriya</th>
                    <th>Sana</th>
                    <th>Rasm</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map(a => (
                    <tr key={a.id}>
                      <td>{userName(a.uid)}</td>
                      <td>{a.title}</td>
                      <td>{a.categoryName || '-'}</td>
                      <td>{a.date}</td>
                      <td>{a.imageUrls?.length || 0}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleDelete(a)}>
                          <Trash2 size={16} color="#DC2626" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {achievements.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>
                Hali yutuq yo'q
              </p>
            )}
          </>
        )}

        {tab === 'users' && (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Jami: {users.length} ta foydalanuvchi
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ism</th>
                    <th>Rol</th>
                    <th>Ro'yxatdan o'tgan sana</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name || '-'}</td>
                      <td>{u.role || '-'}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>
                Foydalanuvchi topilmadi
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
