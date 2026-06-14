import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import fr from './fr'
import ar from './ar'

export const SUPPORTED = ['en', 'fr', 'ar'] as const
export type Lang = (typeof SUPPORTED)[number]

const STORAGE_KEY = 'fb_lng'

/** Resolve language from localStorage, undefined if not yet chosen */
export function resolveLanguage(): Lang | undefined {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
  if (stored && SUPPORTED.includes(stored)) return stored
  return undefined
}

export function persistLanguage(lng: Lang) {
  localStorage.setItem(STORAGE_KEY, lng)
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
