import { useEffect, useState } from 'react'
import { subscribeUpdateStore, startUpdateChecks, downloadUpdate } from '../lib/updateStore'

export default function UpdateBanner() {
  const [state, setState] = useState({ updateInfo: null, downloading: false, progressText: '' })

  useEffect(() => {
    startUpdateChecks()
    const unsub = subscribeUpdateStore(setState)
    return unsub
  }, [])

  if (!state.updateInfo) return null

  return (
    <div className="update-banner">
      <div className="update-banner-text">
        {state.downloading ? state.progressText : `Yangi versiya mavjud (build ${state.updateInfo.build})`}
      </div>
      {!state.downloading && (
        <button onClick={downloadUpdate}>Yuklab olish</button>
      )}
    </div>
  )
}
