import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, where, serverTimestamp, getDoc, setDoc, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase'
import { uploadToImgBB } from './data'

function conversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

export async function getOrCreateConversation(uid1, name1, uid2, name2) {
  const convId = conversationId(uid1, uid2)
  const ref = doc(db, 'conversations', convId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uid1, uid2],
      names: { [uid1]: name1, [uid2]: name2 },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastSenderId: null,
      typing: { [uid1]: false, [uid2]: false }
    })
  }
  return convId
}

export async function createGroupConversation(memberIds, memberNames, groupName, creatorId) {
  const typing = {}
  const lastRead = {}
  memberIds.forEach(id => { typing[id] = false; lastRead[id] = null })
  const ref = await addDoc(collection(db, 'conversations'), {
    participants: memberIds,
    names: memberNames,
    isGroup: true,
    groupName,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastSenderId: null,
    typing,
    lastRead,
    createdBy: creatorId,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export async function addGroupMembers(convId, newMemberIds, newMemberNames) {
  const updates = {
    participants: arrayUnion(...newMemberIds)
  }
  newMemberIds.forEach(id => {
    updates[`names.${id}`] = newMemberNames[id] || ''
    updates[`typing.${id}`] = false
  })
  await updateDoc(doc(db, 'conversations', convId), updates)
}

export async function removeGroupMember(convId, uid) {
  await updateDoc(doc(db, 'conversations', convId), {
    participants: arrayRemove(uid)
  })
}

export function listenConversations(uid, callback) {
  const q = query(collection(db, 'conversations'), where('participants', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => {
      const ta = a.lastMessageAt?.toMillis?.() || 0
      const tb = b.lastMessageAt?.toMillis?.() || 0
      return tb - ta
    })
    callback(list)
  })
}

export function listenMessages(convId, callback) {
  const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(convId, senderId, { text, imageFile }) {
  let imageUrl = null
  if (imageFile) {
    imageUrl = await uploadToImgBB(imageFile)
  }
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    senderId,
    text: text || '',
    imageUrl,
    createdAt: serverTimestamp(),
    edited: false,
    deleted: false
  })
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: imageUrl ? '📷 Rasm' : text,
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId
  })
}

export async function editMessage(convId, messageId, newText) {
  await updateDoc(doc(db, 'conversations', convId, 'messages', messageId), {
    text: newText,
    edited: true
  })
}

export async function deleteMessage(convId, messageId) {
  await updateDoc(doc(db, 'conversations', convId, 'messages', messageId), {
    text: '',
    imageUrl: null,
    deleted: true
  })
}

export async function setTyping(convId, uid, isTyping) {
  await updateDoc(doc(db, 'conversations', convId), {
    [`typing.${uid}`]: isTyping
  })
}

export async function markRead(convId, uid) {
  await updateDoc(doc(db, 'conversations', convId), {
    [`lastRead.${uid}`]: serverTimestamp()
  })
}
