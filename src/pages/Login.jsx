import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register, resetPassword } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    setError('')
    setInfo('')
    if (!email) {
      setError('Avval email manzilingizni kiriting')
      return
    }
    setResetting(true)
    try {
      await resetPassword(email)
      setInfo('Parolni tiklash havolasi emailingizga yuborildi')
    } catch (err) {
      setError('Xatolik: ' + (err.message || ''))
    } finally {
      setResetting(false)
    }
  }

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

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" name="email" id="login-email" autoComplete="username"
              className="form-input" value={email}
              onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password" name="password" id="login-password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="form-input" value={password}
              onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {!isRegister && (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 12.5, padding: 0, marginBottom: 14, cursor: 'pointer' }}
            >
              {resetting ? 'Yuborilmoqda...' : "Parolni unutdingizmi?"}
            </button>
          )}
          {error && <p className="error-text">{error}</p>}
          {info && <p style={{ color: 'var(--color-green)', fontSize: 13, marginBottom: 10 }}>{info}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Kutilmoqda...' : (isRegister ? 'Ro\'yxatdan o\'tish' : 'Kirish')}
          </button>
        </form>

        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => { setIsRegister(!isRegister); setError('') }}
        >
          {isRegister ? 'Kirish oynasiga qaytish' : 'Ro\'yxatdan o\'tish'}
        </button>
      </div>
    </div>
  )
}
