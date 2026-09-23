import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { login, register, resetPassword } = useAuth()
  const { t } = useLanguage()
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
      setError(t('enter_email_first'))
      return
    }
    setResetting(true)
    try {
      await resetPassword(email)
      setInfo(t('reset_email_sent'))
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
          {isRegister ? t('login_subtitle_register') : t('login_subtitle_login')}
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
            <label className="form-label">{t('password_label')}</label>
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
              {resetting ? t('sending') : t('forgot_password')}
            </button>
          )}
          {error && <p className="error-text">{error}</p>}
          {info && <p style={{ color: 'var(--color-green)', fontSize: 13, marginBottom: 10 }}>{info}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? t('waiting') : (isRegister ? t('register_submit') : t('login_submit'))}
          </button>
        </form>

        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => { setIsRegister(!isRegister); setError('') }}
        >
          {isRegister ? t('back_to_login') : t('register_submit')}
        </button>
      </div>
    </div>
  )
}
