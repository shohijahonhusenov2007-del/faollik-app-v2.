import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { MessageCircle, Users, Plus, X, Check } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { listenConversations, getOrCreateConversation, createGroupConversation } from '../lib/chat'
import { useLanguage } from '../context/LanguageContext'

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
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [showGroupSheet, setShowGroupSheet] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [creating, setCreating] = useState(false)

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
    conversations.filter(c => !c.isGroup).flatMap(c => c.participants).filter(id => id !== user?.uid)
  )
  const newContacts = users.filter(u => !conversationUserIds.has(u.id))

  const openContact = async (u) => {
    const convId = await getOrCreateConversation(user.uid, profile?.name || '', u.id, u.name || '')
    navigate(`/chat/${convId}`)
  }

  const otherOf = (conv) => conv.participants.find(id => id !== user?.uid)
  const otherName = (conv) => conv.names?.[otherOf(conv)] || 'Foydalanuvchi'
  const otherUser = (conv) => users.find(u => u.id === otherOf(conv))

  const toggleSelect = (uid) => {
    setSelectedIds(ids => ids.includes(uid) ? ids.filter(i => i !== uid) : [...ids, uid])
  }

  const closeGroupSheet = () => {
    setShowGroupSheet(false)
    setGroupName('')
    setSelectedIds([])
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return
    setCreating(true)
    try {
      const memberIds = [user.uid, ...selectedIds]
      const memberNames = { [user.uid]: profile?.name || '' }
      selectedIds.forEach(id => {
        const u = users.find(uu => uu.id === id)
        memberNames[id] = u?.name || ''
      })
      const convId = await createGroupConversation(memberIds, memberNames, groupName.trim(), user.uid)
      closeGroupSheet()
      navigate(`/chat/${convId}`)
    } catch (err) {
      alert('Xatolik: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const groupTypingText = (conv) => {
    const typingNames = Object.entries(conv.typing || {})
      .filter(([uid, val]) => val && uid !== user?.uid)
      .map(([uid]) => conv.names?.[uid] || 'Kimdir')
    if (typingNames.length === 0) return null
    return `${typingNames.join(', ')} ${t('typing_suffix')}`
  }

  return (
    <div className="flex-page">
      <div className="header-card" style={{ paddingBottom: 16 }}>
        <div className="header-top-row" style={{ marginBottom: 0 }}>
          <h1 className="header-title">{t('nav_chat')}</h1>
          <button className="icon-only-btn" onClick={() => setShowGroupSheet(true)} title={t('new_group')}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 12 }}>
        {conversations.length === 0 && newContacts.length === 0 && (
          <div className="empty-state">
            <MessageCircle size={40} style={{ margin: '0 auto' }} />
            <p>{t('no_conversations')}</p>
          </div>
        )}

        {conversations.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: 0 }}><h2>{t('conversations_label')}</h2></div>
            {conversations.map(conv => {
              if (conv.isGroup) {
                const typingText = groupTypingText(conv)
                return (
                  <Link key={conv.id} to={`/chat/${conv.id}`} className="chat-list-item">
                    <div className="chat-list-avatar">
                      <Users size={18} />
                    </div>
                    <div className="chat-list-info">
                      <p className="chat-list-name">{conv.groupName || t('group_fallback')}</p>
                      <p className="chat-list-preview">
                        {typingText || conv.lastMessage || t('start_conversation')}
                      </p>
                    </div>
                    <span className="chat-list-time">{formatTime(conv.lastMessageAt)}</span>
                  </Link>
                )
              }
              const ou = otherUser(conv)
              return (
                <Link key={conv.id} to={`/chat/${conv.id}`} className="chat-list-item">
                  <div className="chat-list-avatar">
                    {ou?.photoUrl ? <img src={ou.photoUrl} alt="" /> : otherName(conv).charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-list-info">
                    <p className="chat-list-name">{otherName(conv)}</p>
                    <p className="chat-list-preview">
                      {conv.typing?.[otherOf(conv)] ? t('typing_suffix') : (conv.lastMessage || t('start_conversation'))}
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
            <div className="section-header"><h2>{t('all_users_label')}</h2></div>
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

      {showGroupSheet && (
        <div className="sheet-overlay" onClick={closeGroupSheet}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px 12px' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{t('new_group')}</h3>
              <button className="icon-only-btn" onClick={closeGroupSheet}><X size={18} /></button>
            </div>

            <div style={{ padding: '0 16px 12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('group_name_placeholder')}
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
              />
            </div>

            <p style={{ padding: '0 16px 8px', fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              {t('select_members', { count: selectedIds.length })}
            </p>

            <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
              {users.map(u => {
                const checked = selectedIds.includes(u.id)
                return (
                  <div key={u.id} className="sheet-item" style={{ cursor: 'pointer' }} onClick={() => toggleSelect(u.id)}>
                    <div className="chat-list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                      {u.photoUrl ? <img src={u.photoUrl} alt="" /> : (u.name || 'F').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, marginLeft: 10 }}>{u.name}</span>
                    <div className={`sheet-radio ${checked ? 'checked' : ''}`}>
                      {checked && <Check size={12} color="white" style={{ position: 'relative', top: -1 }} />}
                    </div>
                  </div>
                )
              })}
              {users.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 16 }}>{t('no_users_found')}</p>
              )}
            </div>

            <div style={{ padding: 16 }}>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                disabled={!groupName.trim() || selectedIds.length === 0 || creating}
                onClick={handleCreateGroup}
              >
                {creating ? t('creating') : t('create_group')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
