import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, Heart, MessageCircle, Send, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/notifications'
import { subscribeUpdateStore, startUpdateChecks, downloadUpdate } from '../lib/updateStore'

function timeAgo(ts) {
  if (!ts?.toMillis) return ''
  const diff = Date.now() - ts.toMillis()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'hozir'
  if (min < 60) return `${min} daqiqa oldin`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} soat oldin`
  const day = Math.floor(hr / 24)
  return `${day} kun oldin`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [updateState, setUpdateState] = useState({ updateInfo: null, downloading: false, progressText: '' })

  useEffect(() => {
    if (!user) return
    const unsub = listenNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  useEffect(() => {
    startUpdateChecks()
    const unsub = subscribeUpdateStore(setUpdateState)
    return unsub
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length + (updateState.updateInfo ? 1 : 0)

  const handleClose = async () => {
    setOpen(false)
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      try { await markAllNotificationsRead(unreadIds) } catch (e) {}
    }
  }

  const handleClickNotif = async (n) => {
    if (!n.read) {
      try { await markNotificationRead(n.id) } catch (e) {}
    }
    setOpen(false)
    if (n.type === 'message' && n.convId) {
      navigate(`/chat/${n.convId}`)
    } else if ((n.type === 'like' || n.type === 'comment') && n.achievementId) {
      navigate(`/yutuqlar/${n.achievementId}`)
    }
  }

  const iconFor = (type) => {
    if (type === 'like') return <Heart size={16} color="#EF4444" fill="#EF4444" />
    if (type === 'comment') return <MessageCircle size={16} color="var(--color-primary)" />
    return <Send size={16} color="var(--color-primary)" />
  }

  const textFor = (n) => {
    if (n.type === 'like') return `${n.fromName} yutug'ingizni yoqtirdi: "${n.achievementTitle || ''}"`
    if (n.type === 'comment') return `${n.fromName} izoh qoldirdi: "${n.achievementTitle || ''}"`
    if (n.type === 'message') return `${n.fromName}: ${n.text || 'Xabar yubordi'}`
    return ''
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', right: 12, zIndex: 60,
          width: 40, height: 40, borderRadius: '50%', background: 'var(--color-card)',
          border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
        }}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, background: '#EF4444', color: 'white',
            borderRadius: 10, minWidth: 17, height: 17, fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="sheet-overlay" onClick={handleClose}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px 12px' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Bildirishnomalar</h3>
              <button className="icon-only-btn" onClick={handleClose}><X size={18} /></button>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {updateState.updateInfo && (
                <div
                  className="sheet-item"
                  style={{ cursor: 'pointer', alignItems: 'center', background: 'rgba(34,197,94,0.12)' }}
                  onClick={() => { if (!updateState.downloading) downloadUpdate() }}
                >
                  <div style={{ marginTop: 2 }}><Download size={16} color="#22C55E" /></div>
                  <div style={{ flex: 1, marginLeft: 10 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#22C55E' }}>
                      Yangi versiya mavjud (build {updateState.updateInfo.build})
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--color-text-muted)' }}>
                      {updateState.downloading ? updateState.progressText : "Yuklab olish uchun bosing"}
                    </p>
                  </div>
                </div>
              )}
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Hozircha bildirishnoma yo'q</p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="sheet-item"
                    style={{ cursor: 'pointer', alignItems: 'flex-start', background: n.read ? 'transparent' : 'rgba(37,99,235,0.06)' }}
                    onClick={() => handleClickNotif(n)}
                  >
                    <div style={{ marginTop: 2 }}>{iconFor(n.type)}</div>
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.4 }}>{textFor(n)}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--color-text-muted)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
