import {
  collection, addDoc, doc, updateDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

export async function createNotification(toUid, data) {
  if (!toUid || toUid === data.fromUid) return
  await addDoc(collection(db, 'notifications'), {
    toUid,
    read: false,
    createdAt: serverTimestamp(),
    ...data
  })
}

export function listenNotifications(uid, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function markNotificationRead(id) {
  await updateDoc(doc(db, 'notifications', id), { read: true })
}

export async function markAllNotificationsRead(ids) {
  if (!ids || ids.length === 0) return
  const batch = writeBatch(db)
  ids.forEach(id => batch.update(doc(db, 'notifications', id), { read: true }))
  await batch.commit()
}
