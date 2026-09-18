export function compressImage(file, maxWidth = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name || 'image.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.onerror = () => resolve(file)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
