import { useState } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { addAchievement, addCategory } from '../lib/data'

export default function AddAchievementModal({ uid, categories, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Sarlavha kiritilishi shart'); return }
    setSaving(true)
    setError('')
    try {
      let finalCategoryId = categoryId
      let finalCategoryName = categories.find(c => c.id === categoryId)?.name || null

      if (newCategory.trim()) {
        const created = await addCategory(uid, newCategory.trim())
        finalCategoryId = created.id
        finalCategoryName = newCategory.trim()
      }

      await addAchievement(uid, {
        title: title.trim(),
        description: description.trim(),
        categoryId: finalCategoryId || null,
        categoryName: finalCategoryName,
        imageFile,
        date
      })
      onClose()
    } catch (err) {
      setError('Xatolik yuz berdi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="modal-title">Yangi yutuq</h3>
          <button className="icon-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Rasm</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', border: '1.5px dashed #D1D5DB', borderRadius: 12,
              padding: preview ? 0 : 24, cursor: 'pointer', overflow: 'hidden'
            }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              ) : (
                <>
                  <ImageIcon size={28} color="#9CA3AF" />
                  <span style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Rasm tanlash</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Sarlavha *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Masalan: Ko'ngillilar tanlovi g'olibi" />
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..." />
          </div>

          <div className="form-group">
            <label className="form-label">Kategoriya</label>
            <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">Tanlanmagan</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Yoki yangi kategoriya yarating</label>
            <input className="form-input" value={newCategory} onChange={e => setNewCategory(e.target.value)}
              placeholder="Yangi kategoriya nomi" />
          </div>

          <div className="form-group">
            <label className="form-label">Sana</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  )
}
