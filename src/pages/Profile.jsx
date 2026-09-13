import { useState } from 'react'
import { LogOut, User as UserIcon, Mail, Save } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'

export default function Profile() {
  const { user, profile, setProfile, logout } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await updateDoc(doc(db, 'users', user.uid), { name: name.trim() })
    setProfile({ ...profile, name: name.trim() })
    setSaving(false)
  }

  return (
    <div className="page-content" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>Profil</h1>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="user-avatar" style={{
          width: 72, height: 72, fontSize: 28, margin: '0 auto 10px auto',
          background: 'var(--color-primary)'
        }}>
          {(profile?.name || 'F').charAt(0).toUpperCase()}
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{profile?.name}</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>{profile?.role}</p>
      </div>

      <div className="form-group">
        <label className="form-label"><UserIcon size={14} style={{ verticalAlign: 'middle' }} /> Ism</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label"><Mail size={14} style={{ verticalAlign: 'middle' }} /> Email</label>
        <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: 24 }}>
        <Save size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>

      <button className="btn-secondary" onClick={logout} style={{ borderColor: '#DC2626', color: '#DC2626' }}>
        <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Chiqish
      </button>
    </div>
  )
}
