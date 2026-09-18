import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, User as UserIcon, X, Download, Share2, Heart } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { Share } from '@capacitor/share'
import { Media } from '@capacitor-community/media'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { deleteAchievement, toggleLike } from '../lib/data'
import CategoryBadge from '../components/CategoryBadge'

export default function AchievementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const [achievement, setAchievement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState(null)

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

  const handleLike = async () => {
    const liked = (achievement.likes || []).includes(user.uid)
    const newLikes = liked
      ? (achievement.likes || []).filter(u => u !== user.uid)
      : [...(achievement.likes || []), user.uid]
    setAchievement({ ...achievement, likes: newLikes })
    await toggleLike(achievement.id, user.uid, liked)
  }

  const handleSaveToGallery = async () => {
    try {
      const albumName = 'Ijtimoiy Faollik'
      let albumIdentifier = null
      try {
        const { albums } = await Media.getAlbums()
        const found = albums.find(a => a.name === albumName)
        if (found) {
          albumIdentifier = found.identifier
        } else {
          await Media.createAlbum({ name: albumName })
          const { albums: newAlbums } = await Media.getAlbums()
          const created = newAlbums.find(a => a.name === albumName)
          albumIdentifier = created ? created.identifier : null
        }
      } catch (albumErr) {
        albumIdentifier = null
      }

      if (albumIdentifier) {
        await Media.savePhoto({ path: lightboxUrl, albumIdentifier })
      } else {
        await Media.savePhoto({ path: lightboxUrl, albumIdentifier: albumName })
      }
      alert('Rasm galereyaga saqlandi')
    } catch (err) {
      alert('Saqlashda xatolik: ' + err.message)
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: achievement?.title || 'Yutuq',
        url: lightboxUrl
      })
    } catch (err) {
      // user cancelled or error, ignore silently
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

      {mainImage && (
        <img
          src={mainImage}
          className="detail-hero"
          alt={achievement.title}
          onClick={() => setLightboxUrl(mainImage)}
          style={{ cursor: 'pointer' }}
        />
      )}

      <div className="detail-content">
        <h1 className="detail-title">{achievement.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <CategoryBadge
            categoryId={achievement.categoryId}
            name={achievement.categoryName}
            style={{ display: 'inline-block' }}
          />
          <button
            onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Heart
              size={19}
              color={(achievement.likes || []).includes(user.uid) ? '#EF4444' : 'var(--color-text-muted)'}
              fill={(achievement.likes || []).includes(user.uid) ? '#EF4444' : 'none'}
            />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{(achievement.likes || []).length || ''}</span>
          </button>
        </div>
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
                <div
                  key={i}
                  className="detail-thumb"
                  onClick={() => setLightboxUrl(url)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxUrl && (
        <div className="lightbox-overlay">
          <div className="lightbox-top">
            <button onClick={() => setLightboxUrl(null)}><X size={20} /></button>
          </div>
          <div className="lightbox-image-wrap">
            <img src={lightboxUrl} alt="" />
          </div>
          <div className="lightbox-bottom">
            <button className="lightbox-action-btn" onClick={handleSaveToGallery}>
              <span className="icon-circle"><Download size={20} /></span>
              Saqlash
            </button>
            <button className="lightbox-action-btn" onClick={handleShare}>
              <span className="icon-circle"><Share2 size={20} /></span>
              Ulashish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
