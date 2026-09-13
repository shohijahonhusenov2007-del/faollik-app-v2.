import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listenChat, sendChatMessage } from '../lib/data'

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = listenChat(user.uid, setMessages)
    return unsub
  }, [user])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await sendChatMessage(user.uid, text.trim(), 'me')
    setText('')
  }

  return (
    <div className="page-content" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0' }}>Chat</h1>

      <div className="chat-list" style={{ flex: 1 }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 40 }}>
            Hali xabar yo'q. Birinchi xabarni yozing!
          </p>
        )}
        {messages.map(m => (
          <div key={m.id} className={'chat-bubble' + (m.sender === 'me' ? ' mine' : '')}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          className="form-input"
          placeholder="Xabar yozing..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="fab" style={{ width: 44, height: 44, margin: 0 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
