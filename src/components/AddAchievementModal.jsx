import { useState } from 'react'
import { ArrowLeft, Camera, Check, X } from 'lucide-react'
import { addAchievement } from '../lib/data'
import { useLanguage } from '../context/LanguageContext'

export default function AddAchievementModal({ uid, categories, onClose }) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || ''

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files || [])
    const combined = [...imageFiles, ...files].slice(0, 3)
    setImageFiles(combined)
    setPreviews(combined.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (idx) => {
    const combined = imageFiles.filter((_, i) => i !== idx)
    setImageFiles(combined)
    setPreviews(combined.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError(t('name_required_error')); return }
    if (!categoryId) { setError(t('category_required_error')); return }
    setSaving(true)
    setError('')
    try {
      await addAchievement(uid, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        categoryName: selectedCategoryName,
        imageFiles,
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
    <div className="fullpage-overlay">
      <div className="fullpage-header">
        <button className="fullpage-back" onClick={onClose}><ArrowLeft size={20} /></button>
        <h3>{t('add_achievement_title')}</h3>
      </div>

      <div className="fullpage-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('name_required')}</label>
            <input
              className="form-input" value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('name_placeholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('category_required')}</label>
            <button type="button" className="select-btn" onClick={() => setShowCategorySheet(true)}>
              <span style={{ color: selectedCategoryName ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {selectedCategoryName || t('choose_label')}
              </span>
              <span>▾</span>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">{t('date_required')}</label>
            <input
              type="date" className="form-input" value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('description_label')}</label>
            <textarea
              className="form-textarea" value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder={t('description_placeholder')}
            />
            <div className="char-count">{description.length}/500</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('add_images_label')}</label>
            <div className="image-picker">
              {previews.map((src, idx) => (
                <div key={idx} className="image-picker-slot" style={{ position: 'relative', border: 'none' }}>
                  <img src={src} alt="" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)',
                      border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
              ))}
              {imageFiles.length < 3 && (
                <label className="image-picker-slot">
                  <Camera size={22} />
                  <span>{t('choose_image')}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImagePick} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={saving}>
            <Check size={18} />
            {saving ? t('saving') : t('save')}
          </button>
        </form>
      </div>

      {showCategorySheet && (
        <div className="sheet-overlay" onClick={() => setShowCategorySheet(false)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            {categories.length === 0 && (
              <p style={{ padding: '16px 4px', color: '#9CA3AF', fontSize: 14 }}>
                {t('no_category_yet')}
              </p>
            )}
            {categories.map(c => (
              <div
                key={c.id}
                className="sheet-item"
                onClick={() => { setCategoryId(c.id); setShowCategorySheet(false) }}
              >
                <span>{c.name}</span>
                <span className={`sheet-radio ${categoryId === c.id ? 'checked' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
