import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { MessageCircle } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenConversations, getOrCreateConversation } from '../lib/chat'

function formatTime(ts) {
  if (!ts?.toMillis) return ''
  const d = new Date(ts.toMillis())
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString()
}

export default function ChatList() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenConversations(user.uid, setConversations)
    return unsub
  }, [user])

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== user?.uid))
    }
    if (user) loadUsers()
  }, [user])

  const conversationUserIds = new Set(
    conversations.flatMap(c => c.participants).filter(id => id !== user?.uid)
  )
  const newContacts = users.filter(u => !conversationUserIds.has(u.id))

  const openContact = async (u) => {
    const convId = await getOrCreateConversation(user.uid, profile?.name || '', u.id, u.name || '')
    navigate(`/chat/${convId}`)
  }

  const otherOf = (conv) => conv.participants.find(id => id !== user?.uid)
  const otherName = (conv) => conv.names?.[otherOf(conv)] || 'Foydalanuvchi'
  const otherUser = (conv) => users.find(u => u.id === otherOf(conv))

  return (
    <div className="flex-page">
      <div className="header-card" style={{ paddingBottom: 16 }}>
        <div className="header-top-row" style={{ marginBottom: 0 }}>
          <h1 className="header-title">Chat</h1>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 12 }}>
        {conversations.length === 0 && newContacts.length === 0 && (
          <div className="empty-state">
            <MessageCircle size={40} style={{ margin: '0 auto' }} />
            <p>Hali suhbatlar yo'q.</p>
          </div>
        )}

        {conversations.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: 0 }}><h2>Suhbatlar</h2></div>
            {conversations.map(conv => {
              const ou = otherUser(conv)
              return (
                <Link key={conv.id} to={`/chat/${conv.id}`} className="chat-list-item">
                  <div className="chat-list-avatar">
                    {ou?.photoUrl ? <img src={ou.photoUrl} alt="" /> : otherName(conv).charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-list-info">
                    <p className="chat-list-name">{otherName(conv)}</p>
                    <p className="chat-list-preview">
                      {conv.typing?.[otherOf(conv)] ? 'yozmoqda...' : (conv.lastMessage || 'Suhbatni boshlang')}
                    </p>
                  </div>
                  <span className="chat-list-time">{formatTime(conv.lastMessageAt)}</span>
                </Link>
              )
            })}
          </>
        )}

        {newContacts.length > 0 && (
          <>
            <div className="section-header"><h2>Barcha foydalanuvchilar</h2></div>
            {newContacts.map(u => (
              <div key={u.id} className="chat-list-item" style={{ cursor: 'pointer' }} onClick={() => openContact(u)}>
                <div className="chat-list-avatar">
                  {u.photoUrl ? <img src={u.photoUrl} alt="" /> : (u.name || 'F').charAt(0).toUpperCase()}
                </div>
                <div className="chat-list-info">
                  <p className="chat-list-name">{u.name}</p>
                  <p className="chat-list-preview">{u.role}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
