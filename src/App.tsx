import { useState, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FeedbackPage from './pages/FeedbackPage'
import LanguageGate from './components/LanguageGate'
import { getFeedbackProfile, type FeedbackProfile } from './api'
import './pages/FeedbackPage.css'

function FeedbackRoute() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<FeedbackProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!code) return
    getFeedbackProfile(code)
      .then((res) => setProfile(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="fb-page">
        <div className="fb-loading-card">
          <div className="fb-spinner" />
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="fb-page">
        <div className="fb-error-card">
          <div className="fb-error-icon">😕</div>
          <h1>{t('error.heading')}</h1>
          <p>{t('error.body')}</p>
        </div>
      </div>
    )
  }

  return (
    <LanguageGate logoUrl={profile.logoUrl} storeName={profile.storeName}>
      <FeedbackPage profile={profile} />
    </LanguageGate>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/:code" element={<FeedbackRoute />} />
    </Routes>
  )
}
