# Ijtimoiy Faollik Portfolio — React + Firebase versiya

## 1. Firebase loyihasini yaratish

1. https://console.firebase.google.com ga kiring.
2. **"Add project"** → nom bering (masalan `faollik-app`) → davom eting → Analytics shart emas, o'chirib qo'yishingiz mumkin.

## 2. Authentication yoqish

1. Chap menyudan **Build → Authentication** → **Get started**.
2. **Sign-in method** ichidan **Email/Password** ni yoqing (Enable).
3. **Users** bo'limiga o'ting → **Add user** → o'zingiz uchun email va parol kiriting (shu bilan ilovaga kirasiz).

## 3. Firestore Database yaratish

1. **Build → Firestore Database** → **Create database**.
2. Joylashuvni tanlang (masalan `eur3` yoki eng yaqin region) → **Start in production mode**.
3. Yaratilgach, **Rules** bo'limiga o'ting va shu repo'dagi `firestore.rules` faylidagi matnni to'liq nusxalab, joylashtiring → **Publish**.

## 4. Storage yoqish (rasmlar uchun)

1. **Build → Storage** → **Get started** → production mode → davom eting.
2. **Rules** bo'limiga o'ting, `storage.rules` faylidagi matnni joylashtiring → **Publish**.

## 5. Web-ilova konfiguratsiyasini olish

1. Loyiha sozlamalari (⚙️ belgisi) → **Project settings**.
2. Pastga tushib **"Your apps"** → **</> (Web)** belgisini bosing.
3. Nom bering (masalan `faollik-web`) → **Register app**.
4. Chiqqan `firebaseConfig` obyektidagi qiymatlarni nusxalab, `src/firebase.js` faylidagi mos joylarga qo'ying:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## 6. Termux'da loyihani ishga tushirish

```bash
cd faollik-react
npm install
```

(Bu bir necha daqiqa vaqt olishi mumkin — barcha paketlarni yuklaydi.)

Sinab ko'rish uchun (mahalliy server):
```bash
npm run dev
```

Yakuniy build (Netlify'ga yuklash uchun):
```bash
npm run build
```

Bu `dist` papkasini yaratadi — aynan shu papka Netlify'ga yuklanadi.

## 7. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "React + Firebase versiya"
git branch -M main
git remote add origin https://TOKEN@github.com/USERNAME/REPO.git
git push -u origin main
```

## 8. Netlify'ga ulash

1. Netlify'da **yangi sayt** yarating ("Import an existing project" → GitHub → repo tanlang).
2. Build sozlamalari avtomatik `netlify.toml` fayldan olinadi:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy tugagach, sayt tayyor!

## Eslatma

- Ilovaga kirish uchun 2-qadamda yaratgan email/parol ishlatiladi (ro'yxatdan o'tish oynasi yo'q — faqat kirish).
- Rasm yuklash Firebase Storage orqali ishlaydi, shuning uchun internet aloqasi kerak.
- Barcha ma'lumotlar (yutuqlar, kategoriyalar) Firestore'da saqlanadi — istalgan qurilmadan kirib, bir xil ma'lumotlarni ko'rasiz.
