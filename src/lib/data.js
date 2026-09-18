import {
  collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc,
  query, orderBy, where, serverTimestamp, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase'
import { compressImage } from './image'

const IMGBB_API_KEY = 'bd5716b1f393da686383990fabbd875e'

export async function uploadToImgBB(file) {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('image', compressed)
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  })
  const json = await res.json()
  if (!json.success) throw new Error('Rasm yuklashda xatolik')
  return json.data.url
}

export async function toggleLike(achievementId, uid, liked) {
  const ref = doc(db, 'achievements', achievementId)
  await updateDoc(ref, {
    likes: liked ? arrayRemove(uid) : arrayUnion(uid)
  })
}

export function listenAchievements(uid, callback) {
  const q = query(collection(db, 'achievements'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function listenAllAchievements(callback) {
  const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addAchievement(uid, { title, description, categoryId, categoryName, imageFiles, date }) {
  const imageUrls = []
  const files = (imageFiles || []).slice(0, 3)
  for (const file of files) {
    const url = await uploadToImgBB(file)
    imageUrls.push(url)
  }

  return addDoc(collection(db, 'achievements'), {
    uid, title, description: description || '',
    categoryId: categoryId || null,
    categoryName: categoryName || null,
    imageUrls,
    date: date || new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp()
  })
}

export async function deleteAchievement(id) {
  return deleteDoc(doc(db, 'achievements', id))
}

export function listenChat(uid, callback) {
  const q = query(collection(db, 'chats', uid, 'messages'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function sendChatMessage(uid, text, sender) {
  return addDoc(collection(db, 'chats', uid, 'messages'), {
    text, sender, createdAt: serverTimestamp()
  })
}
