import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, User as UserIcon, X, Download, Share2, Heart, Send, MessageCircle, FileText } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { Media } from '@capacitor-community/media'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { deleteAchievement, toggleLike, listenComments, addComment } from '../lib/data'
import CategoryBadge from '../components/CategoryBadge'
import { useLanguage } from '../context/LanguageContext'

export default function AchievementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const { t } = useLanguage()
  const [achievement, setAchievement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'achievements', id))
      if (snap.exists()) setAchievement({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    const unsub = listenComments(id, setComments)
    return unsub
  }, [id])

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSendingComment(true)
    try {
      await addComment(id, user.uid, profile?.name || 'Foydalanuvchi', commentText.trim(), achievement.uid, achievement.title)
      setCommentText('')
    } catch (err) {
      alert('Xatolik: ' + err.message)
    } finally {
      setSendingComment(false)
    }
  }

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
    await toggleLike(achievement.id, user.uid, liked, achievement.uid, achievement.title, profile?.name || 'Foydalanuvchi')
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

  const handleExportCard = async () => {
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let y = 20

      pdf.setFontSize(18)
      pdf.setFont(undefined, 'bold')
      pdf.text('Ijtimoiy Faollik Portfolio', pageWidth / 2, y, { align: 'center' })
      y += 12

      if (mainImage) {
        try {
          const res = await fetch(mainImage)
          const blob = await res.blob()
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
          const format = blob.type.includes('png') ? 'PNG' : 'JPEG'
          const imgEl = new Image()
          await new Promise((resolve) => { imgEl.onload = resolve; imgEl.src = dataUrl })
          const maxW = pageWidth - 40
          const maxH = 110
          const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height)
          const w = imgEl.width * ratio
          const h = imgEl.height * ratio
          pdf.addImage(dataUrl, format, (pageWidth - w) / 2, y, w, h)
          y += h + 10
        } catch (imgErr) {
          // rasm yuklanmasa, o'tkazib yuboramiz
        }
      }

      pdf.setFontSize(15)
      pdf.setFont(undefined, 'bold')
      const titleLines = pdf.splitTextToSize(achievement.title, pageWidth - 28)
      pdf.text(titleLines, 14, y)
      y += titleLines.length * 7 + 4

      pdf.setFontSize(11)
      pdf.setFont(undefined, 'normal')
      pdf.text(`Kategoriya: ${achievement.categoryName || '-'}`, 14, y)
      y += 6
      pdf.text(`Sana: ${achievement.date || '-'}`, 14, y)
      y += 6
      if (profile?.name) {
        pdf.text(`Foydalanuvchi: ${profile.name}`, 14, y)
        y += 6
      }
      pdf.text(`Layklar: ${(achievement.likes || []).length}    Izohlar: ${comments.length}`, 14, y)
      y += 10

      if (achievement.description) {
        pdf.setFontSize(12)
        const descLines = pdf.splitTextToSize(achievement.description, pageWidth - 28)
        pdf.text(descLines, 14, y)
      }

      const base64 = pdf.output('datauristring').split(',')[1]
      const fileName = `yutuq_${achievement.id}.pdf`
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      })
      await Share.share({
        title: achievement.title,
        url: result.uri
      })
    } catch (err) {
      alert('Eksport qilishda xatolik: ' + err.message)
    }
  }

  if (loading) {
    return <div className="spinner-wrap">Yuklanmoqda...</div>
  }

  if (!achievement) {
    return (
      <div className="page-content" style={{ paddingTop: 20 }}>
        <p>{t('not_found_achievement')}</p>
      </div>
    )
  }

  const mainImage = achievement.imageUrls?.[0]

  return (
    <div className="flex-page">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h3>{t('detail_title')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="fullpage-back" onClick={handleExportCard}><FileText size={18} /></button>
          {(achievement.uid === user.uid || profile?.role === 'Administrator') && (
            <button className="fullpage-back" onClick={handleDelete}><Trash2 size={18} /></button>
          )}
        </div>
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
              {t('images_label', { count: achievement.imageUrls.length })}
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

        <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageCircle size={16} />
          {t('comments_label', { count: comments.length })}
        </h2>

        <div style={{ marginTop: 10 }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>{t('no_comments')}</p>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{c.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14 }}>{c.text}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 20 }}>
          <input
            type="text"
            className="form-input"
            placeholder={t('comment_placeholder')}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
            style={{ flex: 1 }}
          />
          <button className="icon-only-btn" onClick={handleAddComment} disabled={sendingComment} style={{ flexShrink: 0 }}>
            <Send size={18} />
          </button>
        </div>
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
              {t('save')}
            </button>
            <button className="lightbox-action-btn" onClick={handleShare}>
              <span className="icon-circle"><Share2 size={20} /></span>
              {t('share_label')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
