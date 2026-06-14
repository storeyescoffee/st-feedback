import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { getFeedbackProfile, createFeedback, completeFeedback, isMobileDevice, type FeedbackProfile } from '../api'
import './FeedbackPage.css'

export default function FeedbackPage() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<FeedbackProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [step, setStep] = useState<'choice' | 'comment' | 'done'>('choice')

  useEffect(() => {
    if (!code) return
    getFeedbackProfile(code)
      .then((res) => setProfile(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [code])

  function handleChoice(value: 'good' | 'bad') {
    setFeedback(value)
    setStep('comment')

    if (!code) return
    createFeedback({
      feedbackProfileCode: code,
      rating: value === 'good' ? 'GOOD' : 'BAD',
      language: i18n.language.toUpperCase(),
      isMobile: isMobileDevice(),
    })
      .then((res) => setFeedbackId(res.data.id))
      .catch(() => {/* silently fail — feedback still shown locally */})
  }

  function handleSend() {
    if (feedbackId && comment.trim()) {
      completeFeedback(feedbackId, { comment: comment.trim() }).catch(() => {})
    }
    setStep('done')
  }

  function handleGoogleReview() {
    if (feedbackId) {
      completeFeedback(feedbackId, { isVisiting: true }).catch(() => {})
    }
  }

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

  if (step === 'done') {
    return (
      <div className="fb-page">
        <div className="fb-thankyou">
          <div className="fb-thankyou-emoji">{feedback === 'good' ? '🌟' : '🙏'}</div>
          <h1>{t('thankyou.heading')}</h1>
          <p className="fb-thankyou-body">{t('thankyou.body')}</p>

          {feedback === 'good' && profile.googleReviewUrl && (
            <>
              <div className="fb-thankyou-divider" />
              <p className="fb-thankyou-google-text">{t('thankyou.googleAsk')}</p>
              <a
                href={profile.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-google-btn"
                onClick={handleGoogleReview}
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="fb-google-icon" />
                {t('thankyou.googleBtn')}
              </a>
            </>
          )}

          {feedback === 'bad' && (
            <>
              <div className="fb-thankyou-divider" />
              <p className="fb-thankyou-warm">{t('thankyou.warm')}</p>
            </>
          )}

          <p className="fb-thankyou-store">— {profile.storeName}</p>
        </div>
      </div>
    )
  }

  if (step === 'comment') {
    return (
      <div className="fb-page">
        <div className="fb-card">
          <div className="fb-header">
            <img src={profile.logoUrl} alt={profile.storeName} className="fb-logo" />
            <h2 className="fb-store-name">{profile.storeName}</h2>
            <h1 className="fb-title">{feedback === 'good' ? t('commentTitleGood') : t('commentTitleBad')}</h1>
            <p className="fb-subtitle">
              {feedback === 'good' ? '😊' : '😞'} {feedback === 'good' ? t('good') : t('bad')}
            </p>
          </div>

          <div className="fb-comment-wrap">
            <textarea
              className="fb-comment"
              placeholder={feedback === 'good' ? t('placeholderGood') : t('placeholderBad')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              autoFocus
            />
          </div>

          <button className="fb-send" onClick={handleSend}>
            {t('send')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fb-page">
      <div className="fb-card">
        <div className="fb-header">
          <img src={profile.logoUrl} alt={profile.storeName} className="fb-logo" />
          <h2 className="fb-store-name">{profile.storeName}</h2>
          <h1 className="fb-title">{t('title')}</h1>
          <p className="fb-subtitle">{t('subtitle')}</p>
        </div>

        <div className="fb-feedback-buttons">
          <button
            className="fb-feedback-btn fb-feedback-btn--good"
            onClick={() => handleChoice('good')}
            aria-label={t('good')}
          >
            <span className="fb-feedback-emoji">😊</span>
            <span className="fb-feedback-label">{t('good')}</span>
          </button>
          <button
            className="fb-feedback-btn fb-feedback-btn--bad"
            onClick={() => handleChoice('bad')}
            aria-label={t('bad')}
          >
            <span className="fb-feedback-emoji">😞</span>
            <span className="fb-feedback-label">{t('bad')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
