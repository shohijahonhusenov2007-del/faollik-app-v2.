import { useEffect, useRef, useState } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { FileOpener } from '@capacitor-community/file-opener'

const REPO_API = 'https://api.github.com/repos/shohijahonhusenov2007-del/faollik-app-v2./releases/latest'
const CURRENT_BUILD = Number(import.meta.env.VITE_BUILD_NUMBER || 0)
const CHECK_INTERVAL_MS = 5 * 60 * 1000
const MIN_GAP_MS = 60 * 1000

export default function UpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const lastCheckRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const check = async (force = false) => {
      const now = Date.now()
      if (!force && now - lastCheckRef.current < MIN_GAP_MS) return
      lastCheckRef.current = now
      try {
        const res = await fetch(REPO_API, { cache: 'no-store' })
        if (!res.ok) return
        const release = await res.json()
        const versionAsset = release.assets?.find(a => a.name === 'version.json')
        const apkAsset = release.assets?.find(a => a.name === 'app-debug.apk')
        if (!versionAsset || !apkAsset) return

        const versionRes = await fetch(versionAsset.browser_download_url, { cache: 'no-store' })
        const versionData = await versionRes.json()

        if (!cancelled && versionData.build > CURRENT_BUILD) {
          setUpdateInfo({ build: versionData.build, apkUrl: apkAsset.browser_download_url })
        }
      } catch (err) {
        // silently ignore — no internet, GitHub unreachable, or rate limited
      }
    }

    check(true)
    const interval = setInterval(() => check(true), CHECK_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') check(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', () => check(false))

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', () => check(false))
    }
  }, [])

  const handleUpdate = async () => {
    if (!updateInfo) return
    setDownloading(true)
    setProgressText('Yuklanmoqda...')
    try {
      const res = await fetch(updateInfo.apkUrl)
      const blob = await res.blob()
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      setProgressText('Saqlanmoqda...')
      const fileName = 'faollik-update.apk'
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      })

      setProgressText('Ornatish oynasi ochilmoqda...')
      await FileOpener.open({
        filePath: result.uri,
        contentType: 'application/vnd.android.package-archive'
      })

      setDownloading(false)
      setUpdateInfo(null)
    } catch (err) {
      alert('Yangilanishni yuklashda xatolik: ' + err.message)
      setDownloading(false)
    }
  }

  if (!updateInfo) return null

  return (
    <div className="update-banner">
      <div className="update-banner-text">
        {downloading ? progressText : `Yangi versiya mavjud (build ${updateInfo.build})`}
      </div>
      {!downloading && (
        <button onClick={handleUpdate}>Yuklab olish</button>
      )}
    </div>
  )
}
