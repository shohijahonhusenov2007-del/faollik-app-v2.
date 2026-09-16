import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, User as UserIcon } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { deleteAchievement } from '../lib/data'

export default function AchievementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [achievement, setAchievement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'achievements', id))
      if (snap.exists()) setAchievement({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (confirm(`"${achievement.title}" o'chirilsinmi?`)) {
      await deleteAchievement(achievement.id)
      navigate('/yutuqlar')
    }
  }

  if (loading) {
    return <div className="spinner-wrap">Yuklanmoqda...</div>
  }

  if (!achievement) {
    return (
      <div className="page-content" style={{ paddingTop: 20 }}>
        <p>Yutuq topilmadi.</p>
      </div>
    )
  }

  const mainImage = achievement.imageUrls?.[0]

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>Yutuq detali</h3>
        <button className="fullpage-back" onClick={handleDelete}><Trash2 size={18} /></button>
      </div>

      {mainImage && <img src={mainImage} className="detail-hero" alt={achievement.title} />}

      <div className="detail-content">
        <h1 className="detail-title">{achievement.title}</h1>
        {achievement.categoryName && (
          <span className="category-pill" style={{ marginBottom: 12, display: 'inline-block' }}>
            {achievement.categoryName}
          </span>
        )}
        <div className="detail-meta-row">
          <Calendar size={14} /> {achievement.date}
        </div>
        {profile?.name && (
          <div className="detail-meta-row">
            <UserIcon size={14} /> {profile.name}
          </div>
        )}

        {achievement.description && (
          <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.6 }}>{achievement.description}</p>
        )}

        {achievement.imageUrls && achievement.imageUrls.length > 0 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 20 }}>
              Rasmlar ({achievement.imageUrls.length})
            </h2>
            <div className="detail-thumb-row">
              {achievement.imageUrls.map((url, i) => (
                <div key={i} className="detail-thumb">
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
