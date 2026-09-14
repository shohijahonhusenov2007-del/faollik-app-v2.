import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  query, orderBy, where, serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'

// ---------- Categories ----------
export function listenCategories(uid, callback) {
  const q = query(collection(db, 'categories'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addCategory(uid, name) {
  return addDoc(collection(db, 'categories'), { uid, name, createdAt: serverTimestamp() })
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id))
}

// ---------- Achievements ----------
export function listenAchievements(uid, callback) {
  const q = query(collection(db, 'achievements'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addAchievement(uid, { title, description, categoryId, categoryName, imageFiles, date }) {
  const imageUrls = []
  const imagePaths = []

  const files = (imageFiles || []).slice(0, 3)
  for (const file of files) {
    const imagePath = `achievements/${uid}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, imagePath)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    imageUrls.push(url)
    imagePaths.push(imagePath)
  }

  return addDoc(collection(db, 'achievements'), {
    uid, title, description: description || '',
    categoryId: categoryId || null,
    categoryName: categoryName || null,
    imageUrls, imagePaths,
    date: date || new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp()
  })
}

export async function deleteAchievement(id, imagePaths) {
  if (imagePaths && imagePaths.length) {
    for (const p of imagePaths) {
      try { await deleteObject(ref(storage, p)) } catch (e) { /* ignore */ }
    }
  }
  return deleteDoc(doc(db, 'achievements', id))
}

// ---------- Chat ----------
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
