import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore'
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck, X, Users, UserPlus, UserMinus, LogOut, Mic, Square, Search } from 'lucide-react'
import { VoiceRecorder } from 'capacitor-voice-recorder'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  listenMessages, sendMessage, sendVoiceMessage, editMessage, deleteMessage, setTyping, markRead,
  addGroupMembers, removeGroupMember
} from '../lib/chat'

function formatTime(ts) {
  if (!ts?.toMillis) return ''
  return new Date(ts.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function highlightText(text, query) {
  if (!query || !query.trim()) return text
  const q = query.trim()
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#FDE68A', color: '#111', borderRadius: 3, padding: '0 1px' }}>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
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
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [selectedNew, setSelectedNew] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const typingTimeout = useRef(null)
  const recordInterval = useRef(null)
  const bottomRef = useRef(null)
  const MAX_RECORD_SECONDS = 60
  const [seenSheetMsg, setSeenSheetMsg] = useState(null)
  const pressTimer = useRef(null)
  const longPressTriggered = useRef(false)
  const touchHandledRef = useRef(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadUsers()
  }, [])

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

  const isGroupFullyRead = (m) => {
    if (!isGroup) return false
    const others = (conversation?.participants || []).filter(id => id !== m.senderId)
    if (others.length === 0) return false
    return others.every(id => {
      const lr = conversation?.lastRead?.[id]
      return lr && m.createdAt && lr.toMillis() >= m.createdAt.toMillis()
    })
  }

  const handlePressStart = (m) => {
    if (!m || m.deleted) return
    longPressTriggered.current = false
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      if (m.senderId === user.uid) setSeenSheetMsg(m)
    }, 500)
  }

  const handlePressEnd = (m) => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
    touchHandledRef.current = true
    setTimeout(() => { touchHandledRef.current = false }, 400)
    if (!longPressTriggered.current && m.senderId === user.uid && !m.deleted) {
      setActionMsg(actionMsg === m.id ? null : m.id)
    }
  }

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.text && m.text.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : messages

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
        await sendMessage(convId, user.uid, { text: text.trim(), imageFile }, {
          senderName: conversation?.names?.[user.uid] || 'Foydalanuvchi',
          participants: conversation?.participants || [],
          isGroup,
          groupName: conversation?.groupName
        })
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

  const startRecording = async () => {
    try {
      const canRecord = await VoiceRecorder.canDeviceVoiceRecord()
      if (!canRecord.value) { alert("Qurilma ovoz yozishni qo'llamaydi"); return }
      const hasPermission = await VoiceRecorder.hasAudioRecordingPermission()
      if (!hasPermission.value) {
        const req = await VoiceRecorder.requestAudioRecordingPermission()
        if (!req.value) { alert('Mikrofon uchun ruxsat kerak'); return }
      }
      await VoiceRecorder.startRecording()
      setIsRecording(true)
      setRecordSeconds(0)
      recordInterval.current = setInterval(() => {
        setRecordSeconds(s => {
          if (s + 1 >= MAX_RECORD_SECONDS) {
            stopRecording()
            return s
          }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      alert('Yozishni boshlashda xatolik: ' + err.message)
    }
  }

  const stopRecording = async () => {
    if (recordInterval.current) clearInterval(recordInterval.current)
    setIsRecording(false)
    try {
      const result = await VoiceRecorder.stopRecording()
      const base64 = result.value.recordDataBase64
      const mimeType = result.value.mimeType || 'audio/aac'
      const durationSec = Math.round((result.value.msDuration || 0) / 1000)
      if (base64) {
        await sendVoiceMessage(convId, user.uid, `data:${mimeType};base64,${base64}`, durationSec, {
          senderName: conversation?.names?.[user.uid] || 'Foydalanuvchi',
          participants: conversation?.participants || [],
          isGroup,
          groupName: conversation?.groupName
        })
      }
    } catch (err) {
      alert('Yuborishda xatolik: ' + err.message)
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

  const toggleSelectNew = (uid) => {
    setSelectedNew(ids => ids.includes(uid) ? ids.filter(i => i !== uid) : [...ids, uid])
  }

  const handleAddMembers = async () => {
    if (selectedNew.length === 0) return
    const names = {}
    selectedNew.forEach(id => {
      names[id] = allUsers.find(u => u.id === id)?.name || ''
    })
    await addGroupMembers(convId, selectedNew, names)
    setSelectedNew([])
    setShowAddMembers(false)
  }

  const handleRemoveMember = async (uid) => {
    const name = conversation?.names?.[uid] || 'Foydalanuvchi'
    if (confirm(`${name} guruhdan chiqarilsinmi?`)) {
      await removeGroupMember(convId, uid)
    }
  }

  const handleLeaveGroup = async () => {
    if (confirm("Guruhdan chiqmoqchimisiz?")) {
      await removeGroupMember(convId, user.uid)
      navigate('/chat')
    }
  }

  return (
    <div className="flex-page">
      <div className="chat-thread-header">
        <button className="fullpage-back" onClick={() => navigate('/chat')}><ArrowLeft size={20} /></button>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: isGroup ? 'pointer' : 'default' }}
          onClick={() => isGroup && setShowGroupInfo(true)}
        >
          <div className="chat-list-avatar">
            {isGroup ? <Users size={16} /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="chat-thread-name">{displayName}</p>
            <p className="chat-thread-status">
              {isGroup ? (groupTypingText ? `${groupTypingText} yozmoqda...` : `${conversation?.participants?.length || 0} a'zo`) : (isOtherTyping ? 'yozmoqda...' : '')}
            </p>
          </div>
        </div>
        <button className="icon-only-btn" onClick={() => setShowSearch(s => !s)}>
          <Search size={19} />
        </button>
      </div>

      {showSearch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Xabarlarni qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {searchQuery.trim() ? `${filteredMessages.length} ta` : ''}
          </span>
          <button className="icon-only-btn" onClick={() => { setShowSearch(false); setSearchQuery('') }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="chat-messages-wrap">
        {filteredMessages.map(m => {
          const mine = m.senderId === user.uid
          const isRead = mine && !isGroup && otherLastRead && m.createdAt && otherLastRead.toMillis() >= m.createdAt.toMillis()
          return (
            <div key={m.id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
              <div
                className="chat-bubble-content"
                onTouchStart={() => handlePressStart(m)}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(m) }}
                onTouchMove={() => { if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null } }}
                onClick={() => { if (!touchHandledRef.current) mine && !m.deleted && setActionMsg(actionMsg === m.id ? null : m.id) }}
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
                    {m.audioData && (
                      <audio controls src={m.audioData} style={{ width: 220, maxWidth: '100%' }} />
                    )}
                    {m.text && <span>{highlightText(m.text, searchQuery)}</span>}
                  </>
                )}
                <div className="chat-bubble-meta">
                  {m.edited && !m.deleted && <span>tahrirlangan</span>}
                  <span>{formatTime(m.createdAt)}</span>
                  {mine && !m.deleted && !isGroup && (isRead ? <CheckCheck size={13} /> : <Check size={13} />)}
                  {mine && !m.deleted && isGroup && (isGroupFullyRead(m) ? <CheckCheck size={13} /> : <Check size={13} />)}
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

      {isRecording ? (
        <div className="chat-input-bar" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, color: '#EF4444', fontWeight: 600, fontSize: 13.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            Yozilmoqda... {recordSeconds}s / {MAX_RECORD_SECONDS}s
          </span>
          <button onClick={stopRecording} style={{ background: '#EF4444', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <Square size={15} color="white" fill="white" />
          </button>
        </div>
      ) : (
        <div className="chat-input-bar">
          <label className="icon-only-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ImageIcon size={20} />
            <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
          </label>
          <button className="icon-only-btn" onClick={startRecording} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={20} />
          </button>
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
      )}

      {showGroupInfo && isGroup && (
        <div className="sheet-overlay" onClick={() => { setShowGroupInfo(false); setShowAddMembers(false) }}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            {!showAddMembers ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px 12px' }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{conversation?.groupName || 'Guruh'}</h3>
                  <button className="icon-only-btn" onClick={() => setShowGroupInfo(false)}><X size={18} /></button>
                </div>

                <button
                  className="profile-menu-item"
                  style={{ margin: '0 16px 12px', width: 'calc(100% - 32px)' }}
                  onClick={() => setShowAddMembers(true)}
                >
                  <UserPlus size={18} />
                  A'zo qo'shish
                </button>

                <p style={{ padding: '0 16px 8px', fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                  A'zolar ({conversation?.participants?.length || 0})
                </p>

                <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                  {(conversation?.participants || []).map(uid => (
                    <div key={uid} className="sheet-item">
                      <div className="chat-list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {(conversation?.names?.[uid] || 'F').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, marginLeft: 10 }}>
                        {conversation?.names?.[uid] || 'Foydalanuvchi'}{uid === user.uid ? ' (siz)' : ''}
                      </span>
                      {uid !== user.uid && (
                        <button className="icon-btn" onClick={() => handleRemoveMember(uid)}>
                          <UserMinus size={16} color="#DC2626" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ padding: 16 }}>
                  <button className="profile-menu-item danger" onClick={handleLeaveGroup}>
                    <LogOut size={18} />
                    Guruhdan chiqish
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px 12px' }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>A'zo qo'shish</h3>
                  <button className="icon-only-btn" onClick={() => setShowAddMembers(false)}><X size={18} /></button>
                </div>

                <div style={{ maxHeight: '45vh', overflowY: 'auto' }}>
                  {allUsers.filter(u => !(conversation?.participants || []).includes(u.id)).map(u => {
                    const checked = selectedNew.includes(u.id)
                    return (
                      <div key={u.id} className="sheet-item" style={{ cursor: 'pointer' }} onClick={() => toggleSelectNew(u.id)}>
                        <div className="chat-list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                          {(u.name || 'F').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ flex: 1, marginLeft: 10 }}>{u.name}</span>
                        <div className={`sheet-radio ${checked ? 'checked' : ''}`}>
                          {checked && <Check size={12} color="white" style={{ position: 'relative', top: -1 }} />}
                        </div>
                      </div>
                    )
                  })}
                  {allUsers.filter(u => !(conversation?.participants || []).includes(u.id)).length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 16 }}>Qo'shiladigan foydalanuvchi yo'q</p>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <button className="btn-primary" style={{ width: '100%' }} disabled={selectedNew.length === 0} onClick={handleAddMembers}>
                    Qo'shish ({selectedNew.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {seenSheetMsg && (
        <div className="sheet-overlay" onClick={() => setSeenSheetMsg(null)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px 12px' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Xabar holati</h3>
              <button className="icon-only-btn" onClick={() => setSeenSheetMsg(null)}><X size={18} /></button>
            </div>
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {(conversation?.participants || []).filter(id => id !== user.uid).map(uid => {
                const lr = conversation?.lastRead?.[uid]
                const read = lr && seenSheetMsg.createdAt && lr.toMillis() >= seenSheetMsg.createdAt.toMillis()
                return (
                  <div key={uid} className="sheet-item">
                    <div className="chat-list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                      {(conversation?.names?.[uid] || 'F').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, marginLeft: 10 }}>{conversation?.names?.[uid] || 'Foydalanuvchi'}</span>
                    {read ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-primary)' }}>
                        <CheckCheck size={14} /> {formatTime(lr)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Hali o'qimadi</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
