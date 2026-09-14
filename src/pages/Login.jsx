import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password)
      } else {
        await login(email, password)
      }
    } catch (err) {
      if (isRegister) {
        setError('Ro\'yxatdan o\'tishda xatolik: ' + (err.message || ''))
      } else {
        setError('Email yoki parol noto\'g\'ri')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <img src="/app-icon-192.png" alt="logo" className="login-logo" />
        <h1 style={{ textAlign: 'center', fontSize: 20, marginBottom: 4 }}>Ijtimoiy Faollik Portfolio</h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
          {isRegister ? 'Yangi hisob yarating' : 'Hisobingizga kiring'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-input" value={email}
              onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password" className="form-input" value={password}
              onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Kutilmoqda...' : (isRegister ? 'Ro\'yxatdan o\'tish' : 'Kirish')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          {isRegister ? 'Hisobingiz bormi?' : 'Hisobingiz yo\'qmi?'}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary, #1B3A6B)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegister ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
          </button>
        </p>
      </div>
    </div>
  )
}
