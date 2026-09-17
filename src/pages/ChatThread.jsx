import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck, X, MoreVertical } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  listenMessages, sendMessage, editMessage, deleteMessage, setTyping, markRead
} from '../lib/chat'

function formatTime(ts) {
  if (!ts?.toMillis) return ''
  return new Date(ts.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatThread() {
  const { id: convId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)
  const typingTimeout = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'conversations', convId), (snap) => {
      if (snap.exists()) setConversation({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [convId])

  useEffect(() => {
    const unsub = listenMessages(convId, setMessages)
    return unsub
  }, [convId])

  useEffect(() => {
    if (user && convId) markRead(convId, user.uid)
  }, [convId, user, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    return () => {
      if (user && convId) setTyping(convId, user.uid, false)
    }
  }, [convId, user])

  const isGroup = conversation?.isGroup
  const otherId = conversation?.participants.find(id => id !== user?.uid)
  const otherName = conversation?.names?.[otherId] || 'Foydalanuvchi'
  const isOtherTyping = conversation?.typing?.[otherId]
  const otherLastRead = conversation?.lastRead?.[otherId]
  const displayName = isGroup ? (conversation?.groupName || 'Guruh') : otherName
  const groupTypingText = isGroup
    ? Object.entries(conversation?.typing || {})
        .filter(([uid, val]) => val && uid !== user?.uid)
        .map(([uid]) => conversation?.names?.[uid] || 'Kimdir')
        .join(', ')
    : ''
  const senderName = (uid) => conversation?.names?.[uid] || 'Foydalanuvchi'

  const handleTextChange = (val) => {
    setText(val)
    if (!user) return
    setTyping(convId, user.uid, val.length > 0)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setTyping(convId, user.uid, false), 2000)
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSend = async () => {
    if (!text.trim() && !imageFile) return
    setSending(true)
    try {
      if (editingId) {
        await editMessage(convId, editingId, text.trim())
        setEditingId(null)
      } else {
        await sendMessage(convId, user.uid, { text: text.trim(), imageFile })
      }
      setText('')
      setImageFile(null)
      setImagePreview(null)
      setTyping(convId, user.uid, false)
    } catch (err) {
      alert('Xatolik: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setText(m.text)
    setActionMsg(null)
  }

  const handleDelete = async (m) => {
    if (confirm("Xabar o'chirilsinmi?")) {
      await deleteMessage(convId, m.id)
    }
    setActionMsg(null)
  }

  return (
    <div className="flex-page">
      <div className="chat-thread-header">
        <button className="fullpage-back" onClick={() => navigate('/chat')}><ArrowLeft size={20} /></button>
        <div className="chat-list-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <p className="chat-thread-name">{displayName}</p>
          <p className="chat-thread-status">
            {isGroup ? (groupTypingText ? `${groupTypingText} yozmoqda...` : '') : (isOtherTyping ? 'yozmoqda...' : '')}
          </p>
        </div>
      </div>

      <div className="chat-messages-wrap">
        {messages.map(m => {
          const mine = m.senderId === user.uid
          const isRead = mine && !isGroup && otherLastRead && m.createdAt && otherLastRead.toMillis() >= m.createdAt.toMillis()
          return (
            <div key={m.id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
              <div
                className="chat-bubble-content"
                onClick={() => mine && !m.deleted && setActionMsg(actionMsg === m.id ? null : m.id)}
              >
                {isGroup && !mine && !m.deleted && (
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 2 }}>
                    {senderName(m.senderId)}
                  </span>
                )}
                {m.deleted ? (
                  <span className="chat-bubble-deleted">Xabar o'chirildi</span>
                ) : (
                  <>
                    {m.imageUrl && <img src={m.imageUrl} alt="" />}
                    {m.text && <span>{m.text}</span>}
                  </>
                )}
                <div className="chat-bubble-meta">
                  {m.edited && !m.deleted && <span>tahrirlangan</span>}
                  <span>{formatTime(m.createdAt)}</span>
                  {mine && !m.deleted && !isGroup && (isRead ? <CheckCheck size={13} /> : <Check size={13} />)}
                  {mine && !m.deleted && isGroup && <Check size={13} />}
                </div>

                {actionMsg === m.id && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, background: 'white', color: 'var(--color-text)',
                    borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.15)', marginTop: 4, zIndex: 10, overflow: 'hidden'
                  }}>
                    <button
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'white', textAlign: 'left', fontSize: 13 }}
                      onClick={(e) => { e.stopPropagation(); startEdit(m) }}
                    >
                      Tahrirlash
                    </button>
                    <button
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'white', textAlign: 'left', fontSize: 13, color: '#DC2626' }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(m) }}
                    >
                      O'chirish
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {imagePreview && (
        <div className="chat-image-preview-bar">
          <img src={imagePreview} alt="" />
          <button className="icon-btn" onClick={() => { setImageFile(null); setImagePreview(null) }}>
            <X size={16} />
          </button>
        </div>
      )}

      {editingId && (
        <div style={{ padding: '6px 12px 0 12px', fontSize: 12, color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Xabarni tahrirlash</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }} onClick={() => { setEditingId(null); setText('') }}>
            Bekor qilish
          </button>
        </div>
      )}

      <div className="chat-input-bar">
        <label className="icon-only-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ImageIcon size={20} />
          <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
        </label>
        <input
          type="text"
          placeholder="Xabar..."
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={sending}>
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
