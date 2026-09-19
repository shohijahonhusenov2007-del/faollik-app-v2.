import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
      background: '#F5A623', color: 'white', fontSize: 12.5, fontWeight: 600,
      padding: '8px 12px'
    }}>
      <WifiOff size={14} />
      Internet yo'q — oflayn rejimda ko'rmoqdasiz
    </div>
  )
}
