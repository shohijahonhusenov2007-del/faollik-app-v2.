import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User as UserIcon, Mail, Save, FileText, Settings, ShieldCheck } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { listenAchievements } from '../lib/data'
import { STATIC_CATEGORIES } from '../lib/categories'

export default function Profile() {
  const { user, profile, setProfile, logout } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [achievements, setAchievements] = useState([])
  const [showSettings, setShowSettings] = useState(false)

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

  const handlePdfExport = () => {
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

    pdf.save('yutuqlar.pdf')
  }

  return (
    <div className="flex-page">
      <div className="header-card">
        <div className="header-top-row">
          <h1 className="header-title">Profil</h1>
          {profile?.role === 'Administrator' && <span className="admin-badge">Admin</span>}
        </div>
        <div className="user-card">
          <div className="user-avatar">{(profile?.name || 'F').charAt(0).toUpperCase()}</div>
          <div>
            <p className="user-name">{profile?.name}</p>
            <p className="user-role">{profile?.role}</p>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-green">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-label">Yutuqlar</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-number">{STATIC_CATEGORIES.length}</span>
          <span className="stat-label">Kategoriyalar</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-number">{totalImages}</span>
          <span className="stat-label">Rasmlar</span>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 24 }}>
        <button className="profile-menu-item" onClick={handlePdfExport}>
          <FileText size={18} />
          PDF chiqarish
        </button>

        <button className="profile-menu-item" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={18} />
          Sozlamalar
        </button>

        {showSettings && (
          <div style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label"><UserIcon size={14} style={{ verticalAlign: 'middle' }} /> Ism</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={14} style={{ verticalAlign: 'middle' }} /> Email</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        )}

        {profile?.role === 'Administrator' && (
          <Link to="/admin" className="profile-menu-item admin-panel" style={{ textDecoration: 'none' }}>
            <ShieldCheck size={18} />
            Admin panelga o'tish
          </Link>
        )}

        <button className="profile-menu-item danger" onClick={logout}>
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </div>
  )
}
