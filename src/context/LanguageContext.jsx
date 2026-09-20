import { createContext, useContext, useEffect, useState } from 'react'
import { getLanguage, applyLanguage, translate } from '../lib/i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getLanguage())

  useEffect(() => {
    applyLanguage(lang)
  }, [lang])

  const setLang = (code) => setLangState(code)
  const t = (key, params) => translate(lang, key, params)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
