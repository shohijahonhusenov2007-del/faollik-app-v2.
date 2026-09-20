import { Filesystem, Directory } from '@capacitor/filesystem'
import { FileOpener } from '@capacitor-community/file-opener'

const REPO_API = 'https://api.github.com/repos/shohijahonhusenov2007-del/faollik-app-v2./releases/latest'
const CURRENT_BUILD = Number(import.meta.env.VITE_BUILD_NUMBER || 0)
const CHECK_INTERVAL_MS = 5 * 60 * 1000
const MIN_GAP_MS = 60 * 1000

let state = { updateInfo: null, downloading: false, progressText: '' }
let lastCheck = 0
const listeners = new Set()

function setState(patch) {
  state = { ...state, ...patch }
  listeners.forEach(fn => fn(state))
}

export function subscribeUpdateStore(fn) {
  listeners.add(fn)
  fn(state)
  return () => listeners.delete(fn)
}

let started = false
export function startUpdateChecks() {
  if (started) return
  started = true

  const check = async (force = false) => {
    const now = Date.now()
    if (!force && now - lastCheck < MIN_GAP_MS) return
    lastCheck = now
    try {
      const res = await fetch(REPO_API, { cache: 'no-store' })
      if (!res.ok) return
      const release = await res.json()
      const versionAsset = release.assets?.find(a => a.name === 'version.json')
      const apkAsset = release.assets?.find(a => a.name === 'app-debug.apk')
      if (!versionAsset || !apkAsset) return

      const versionRes = await fetch(versionAsset.browser_download_url, { cache: 'no-store' })
      const versionData = await versionRes.json()

      if (versionData.build > CURRENT_BUILD) {
        setState({ updateInfo: { build: versionData.build, apkUrl: apkAsset.browser_download_url } })
      }
    } catch (err) {
      // silently ignore - no internet, GitHub unreachable, or rate limited
    }
  }

  check(true)
  setInterval(() => check(true), CHECK_INTERVAL_MS)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check(false)
  })
  window.addEventListener('focus', () => check(false))
}

export async function downloadUpdate() {
  const { updateInfo } = state
  if (!updateInfo) return
  setState({ downloading: true, progressText: 'Yuklanmoqda...' })
  try {
    const res = await fetch(updateInfo.apkUrl)
    const blob = await res.blob()
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    setState({ progressText: 'Saqlanmoqda...' })
    const fileName = 'faollik-update.apk'
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache
    })

    setState({ progressText: 'Ornatish oynasi ochilmoqda...' })
    await FileOpener.open({
      filePath: result.uri,
      contentType: 'application/vnd.android.package-archive'
    })

    setState({ downloading: false, updateInfo: null })
  } catch (err) {
    alert('Yangilanishni yuklashda xatolik: ' + err.message)
    setState({ downloading: false })
  }
}
