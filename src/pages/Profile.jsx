import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User as UserIcon, Mail, Save, FileText, Settings, ShieldCheck, Camera, Moon, Sun, Globe, Check } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { listenAchievements, uploadToImgBB } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'
import { getTheme, applyTheme } from '../lib/theme'
import { computeStreak } from '../lib/streak'
import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../lib/i18n'

export default function Profile() {
  const { user, profile, setProfile, logout } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [achievements, setAchievements] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [theme, setThemeState] = useState(getTheme())
  const { lang, setLang, t } = useLanguage()

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setThemeState(next)
  }

  useEffect(() => {
    if (!user) return
    const unsub = listenAchievements(user.uid, setAchievements)
    return unsub
  }, [user])

  const totalImages = achievements.reduce((sum, a) => sum + (a.imageUrls?.length || 0), 0)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await updateDoc(doc(db, 'users', user.uid), { name: name.trim() })
    setProfile({ ...profile, name: name.trim() })
    setSaving(false)
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const url = await uploadToImgBB(file)
      await updateDoc(doc(db, 'users', user.uid), { photoUrl: url })
      setProfile({ ...profile, photoUrl: url })
    } catch (err) {
      alert('Rasm yuklashda xatolik: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePdfExport = async () => {
    const pdf = new jsPDF()
    pdf.setFontSize(16)
    pdf.text('Ijtimoiy Faollik Portfolio', 14, 16)
    pdf.setFontSize(11)
    pdf.text(`Foydalanuvchi: ${profile?.name || ''}`, 14, 26)
    pdf.text(`Jami yutuqlar: ${achievements.length}`, 14, 33)

    let y = 46
    pdf.setFontSize(12)
    achievements.forEach((a, i) => {
      if (y > 270) { pdf.addPage(); y = 20 }
      pdf.setFont(undefined, 'bold')
      pdf.text(`${i + 1}. ${a.title}`, 14, y)
      pdf.setFont(undefined, 'normal')
      y += 6
      pdf.text(`Kategoriya: ${a.categoryName || '-'}    Sana: ${a.date || '-'}`, 14, y)
      y += 6
      if (a.description) {
        const lines = pdf.splitTextToSize(a.description, 180)
        pdf.text(lines, 14, y)
        y += lines.length * 6
      }
      y += 6
    })

    try {
      const base64 = pdf.output('datauristring').split(',')[1]
      const fileName = `yutuqlar_${Date.now()}.pdf`
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      })
      await Share.share({
        title: 'Yutuqlar PDF',
        url: result.uri
      })
    } catch (err) {
      alert('PDF saqlashda xatolik: ' + err.message)
    }
  }

  return (
    <div className="flex-page">
      <div className="header-card">
        <div className="header-top-row">
          <h1 className="header-title">{t('profile_title')}</h1>
          {profile?.role === 'Administrator' && <span className="admin-badge">Admin</span>}
        </div>
        <div className="user-card">
          <div className="user-avatar">
            {profile?.photoUrl
              ? <img src={profile.photoUrl} alt="" />
              : (profile?.name || 'F').charAt(0).toUpperCase()
            }
          </div>
          <div>
            <p className="user-name">{profile?.name}</p>
            <p className="user-role">{profile?.role}</p>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-green">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-label">{t('stat_achievements')}</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{STATIC_CATEGORIES.length}</span>
          <span className="stat-label">{t('stat_categories')}</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-number">{totalImages}</span>
          <span className="stat-label">{t('stat_images')}</span>
        </div>
      </div>

      {computeStreak(achievements) > 1 && (
        <div style={{
          margin: '0 16px 12px', padding: '10px 14px', borderRadius: 12,
          background: 'linear-gradient(90deg, #F5A623, #EF4444)', color: 'white',
          fontSize: 13.5, fontWeight: 600, textAlign: 'center'
        }}>
          🔥 {t('streak_days', { days: computeStreak(achievements) })}
        </div>
      )}

      <div className="page-content" style={{ paddingTop: 24 }}>
        <button className="profile-menu-item" onClick={handlePdfExport}>
          <FileText size={18} />
          {t('menu_pdf')}
        </button>

        <button className="profile-menu-item" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={18} />
          {t('menu_settings')}
        </button>

        <button className="profile-menu-item" onClick={() => setShowLanguages(!showLanguages)}>
          <Globe size={18} />
          {t('menu_language')}
        </button>

        {showLanguages && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', margin: '4px 0 10px' }}>
              {t('language_section_title')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLanguages(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10, border: 'none', textAlign: 'left',
                    background: lang === l.code ? 'rgba(37,99,235,0.08)' : 'transparent',
                    color: 'var(--color-text)', fontSize: 14, cursor: 'pointer'
                  }}
                >
                  <span>{l.nativeName}</span>
                  {lang === l.code && <Check size={16} color="var(--color-primary)" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {showSettings && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', marginBottom: 8
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
                {t('dark_mode')}
              </span>
              <button
                onClick={toggleTheme}
                style={{
                  width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)',
                  position: 'relative', flexShrink: 0
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: theme === 'dark' ? 22 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  transition: 'left 0.15s'
                }} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile_photo')}</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
              }}>
                <div className="user-avatar" style={{ background: 'var(--color-primary)', width: 56, height: 56, fontSize: 22 }}>
                  {profile?.photoUrl
                    ? <img src={profile.photoUrl} alt="" />
                    : (profile?.name || 'F').charAt(0).toUpperCase()
                  }
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600, fontSize: 13.5 }}>
                  <Camera size={16} />
                  {uploadingPhoto ? t('uploading') : t('change_photo')}
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} disabled={uploadingPhoto} />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label"><UserIcon size={14} style={{ verticalAlign: 'middle' }} /> {t('name_label')}</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={14} style={{ verticalAlign: 'middle' }} /> {t('email_label')}</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        )}

        {profile?.role === 'Administrator' && (
          <Link to="/admin" className="profile-menu-item admin-panel" style={{ textDecoration: 'none' }}>
            <ShieldCheck size={18} />
            {t('menu_admin_panel')}
          </Link>
        )}

        <button className="profile-menu-item danger" onClick={logout}>
          <LogOut size={18} />
          {t('menu_logout')}
        </button>
      </div>
    </div>
  )
}
