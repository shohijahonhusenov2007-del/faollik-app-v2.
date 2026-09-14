import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAxaBuaK4nxAX-Afsd64dubTRsOgcD-Tuw",
  authDomain: "ijtimoiy-faollik-8fafa.firebaseapp.com",
  projectId: "ijtimoiy-faollik-8fafa",
  storageBucket: "ijtimoiy-faollik-8fafa.firebasestorage.app",
  messagingSenderId: "72259487865",
  appId: "1:72259487865:web:4659588141472e5b6deca8",
  measurementId: "G-565EB4WPQJ"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
