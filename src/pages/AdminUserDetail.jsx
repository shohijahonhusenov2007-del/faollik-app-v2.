import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenAchievements, deleteAchievement } from '../lib/data'
import CategoryBadge from '../components/CategoryBadge'

export default function AdminUserDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [targetUser, setTargetUser] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) {
        setTargetUser({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }
    loadUser()
  }, [uid])

  useEffect(() => {
    const unsub = listenAchievements(uid, setAchievements)
    return unsub
  }, [uid])

  if (profile && profile.role !== 'Administrator') {
    return <Navigate to="/profil" replace />
  }

  const handleDelete = async (a) => {
    if (confirm(`"${a.title}" o'chirilsinmi?`)) {
      await deleteAchievement(a.id)
    }
  }

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>{targetUser?.name || 'Foydalanuvchi'}</h3>
      </div>

      <div className="fullpage-content">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24 }}>Yuklanmoqda...</p>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 4 }}>
              Rol: {targetUser?.role || '-'}
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
              Jami: {achievements.length} ta yutuq
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sarlavha</th>
                    <th>Kategoriya</th>
                    <th>Sana</th>
                    <th>Rasm</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map(a => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td><CategoryBadge categoryId={a.categoryId} name={a.categoryName || '-'} /></td>
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
      </div>
    </div>
  )
}
