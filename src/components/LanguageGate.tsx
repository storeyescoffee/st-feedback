import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n, { type Lang, SUPPORTED, persistLanguage, resolveLanguage } from '../i18n'
import StoreLogo from './StoreLogo'
import './LanguageGate.css'

const LANGS: { code: Lang; label: string; tag: string }[] = [
  { code: 'en', label: 'English', tag: 'EN' },
  { code: 'fr', label: 'Français', tag: 'FR' },
  { code: 'ar', label: 'العربية', tag: 'AR' },
]

function getInitial(): Lang | null {
  const resolved = resolveLanguage()
  if (resolved) {
    i18n.changeLanguage(resolved)
    document.documentElement.dir = resolved === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = resolved
    return resolved
  }
  return null
}

export default function LanguageGate({
  children,
  logoUrl,
  storeName,
}: {
  children: React.ReactNode
  logoUrl: string
  storeName: string
}) {
  const [chosen, setChosen] = useState<Lang | null>(getInitial)
  const { i18n: i18next } = useTranslation()

  function choose(lng: Lang) {
    persistLanguage(lng)
    i18next.changeLanguage(lng)
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lng
    setChosen(lng)
  }

  if (chosen) return <>{children}</>

  return (
    <div className="lg-page">
      <div className="lg-card">
        <StoreLogo src={logoUrl} alt={storeName} className="lg-logo" />
        <p className="lg-prompt">Choose your language</p>
        <p className="lg-prompt-sub">Choisissez votre langue</p>
        <p className="lg-prompt-sub lg-prompt-ar">اختر لغتك</p>
        <div className="lg-options">
          {LANGS.map(({ code, label, tag }) => (
            <button key={code} className="lg-btn" onClick={() => choose(code)}>
              <span className="lg-tag">{tag}</span>
              <span className="lg-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
