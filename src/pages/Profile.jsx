import { useEffect, useState } from 'react'
import { LogOut, User as UserIcon, Mail, Save, Plus, Trash2 } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { listenCategories, addCategory, deleteCategory } from '../lib/data'

export default function Profile() {
  const { user, profile, setProfile, logout } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = listenCategories(user.uid, setCategories)
    return unsub
  }, [user])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await updateDoc(doc(db, 'users', user.uid), { name: name.trim() })
    setProfile({ ...profile, name: name.trim() })
    setSaving(false)
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setAddingCategory(true)
    await addCategory(user.uid, newCategory.trim())
    setNewCategory('')
    setAddingCategory(false)
  }

  const handleDeleteCategory = async (id) => {
    if (confirm("Kategoriya o'chirilsinmi?")) {
      await deleteCategory(id)
    }
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

      <div className="section-header" style={{ marginTop: 8 }}>
        <h2>Kategoriyalar</h2>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="form-input"
          placeholder="Yangi kategoriya nomi"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <button
          className="btn-primary"
          style={{ width: 48, padding: 0, flexShrink: 0 }}
          onClick={handleAddCategory}
          disabled={addingCategory}
        >
          <Plus size={20} />
        </button>
      </div>

      {categories.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Hali kategoriya yo'q</p>
      ) : (
        categories.map(c => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'white', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 8
          }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{c.name}</span>
            <button className="icon-btn" onClick={() => handleDeleteCategory(c.id)}>
              <Trash2 size={16} color="#DC2626" />
            </button>
          </div>
        ))
      )}

      <button className="btn-secondary" onClick={logout} style={{ borderColor: '#DC2626', color: '#DC2626', marginTop: 24 }}>
        <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Chiqish
      </button>
    </div>
  )
}
