import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import {
  getFeedbackProfile, createFeedback, completeFeedback, isMobileDevice,
  type FeedbackProfile, type Question,
} from '../api'
import './FeedbackPage.css'

type Step = 'choice' | 'questions' | 'done'

export default function FeedbackPage() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<FeedbackProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [step, setStep] = useState<Step>('choice')
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, 'GOOD' | 'BAD'>>({})

  useEffect(() => {
    if (!code) return
    getFeedbackProfile(code)
      .then((res) => setProfile(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [code])

  function handleChoice(value: 'good' | 'bad') {
    setFeedback(value)

    if (!code) return
    createFeedback({
      feedbackProfileCode: code,
      rating: value === 'good' ? 'GOOD' : 'BAD',
      language: i18n.language.toUpperCase(),
      isMobile: isMobileDevice(),
    })
      .then((res) => setFeedbackId(res.data.id))
      .catch(() => {})

    setStep('questions')
  }

  function toggleAnswer(questionId: number, rating: 'GOOD' | 'BAD') {
    setQuestionAnswers(prev => {
      if (prev[questionId] === rating) {
        const next = { ...prev }
        delete next[questionId]
        return next
      }
      return { ...prev, [questionId]: rating }
    })
  }

  function handleSend() {
    if (feedbackId) {
      const answers = Object.entries(questionAnswers).map(([qId, rating]) => ({
        questionId: Number(qId),
        rating: rating as 'GOOD' | 'BAD',
      }))
      if (comment.trim() || answers.length > 0) {
        completeFeedback(feedbackId, {
          comment: comment.trim() || undefined,
          answers: answers.length > 0 ? answers : undefined,
        }).catch(() => {})
      }
    }
    setStep('done')
  }

  function handleGoogleReview() {
    if (feedbackId) {
      completeFeedback(feedbackId, { isVisiting: true }).catch(() => {})
    }
  }

  function getQuestionLabel(q: Question): string {
    const lang = i18n.language
    if (lang === 'ar') return q.labelAr
    if (lang === 'fr') return q.labelFr
    return q.labelEn
  }

  // ── Loading ───────────────────────────────────────────────────
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

  // ── Error ─────────────────────────────────────────────────────
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

  // ── Done ──────────────────────────────────────────────────────
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

  // ── Questions + Comment step (combined) ──────────────────────
  if (step === 'questions') {
    const questions = profile.questions ?? []
    const hasQuestions = questions.length > 0
    return (
      <div className="fb-page">
        <div className={`fb-card${hasQuestions ? ' fb-card--wide' : ''}`}>
          <div className="fb-header">
            <img src={profile.logoUrl} alt={profile.storeName} className="fb-logo" />
            <h2 className="fb-store-name">{profile.storeName}</h2>
            <h1 className="fb-title">
              {hasQuestions ? t('questions.title') : (feedback === 'good' ? t('commentTitleGood') : t('commentTitleBad'))}
            </h1>
            <p className="fb-subtitle">
              {hasQuestions
                ? t('questions.subtitle')
                : `${feedback === 'good' ? '😊' : '😞'} ${feedback === 'good' ? t('good') : t('bad')}`}
            </p>
          </div>

          {hasQuestions && (
            <div className="fb-questions-list">
              {questions.map(q => (
                <div key={q.id} className="fb-question-item">
                  <p className="fb-question-label">{getQuestionLabel(q)}</p>
                  <div className="fb-question-btns">
                    <button
                      className={`fb-question-btn fb-question-btn--good${questionAnswers[q.id] === 'GOOD' ? ' fb-question-btn--active-good' : ''}`}
                      onClick={() => toggleAnswer(q.id, 'GOOD')}
                      aria-pressed={questionAnswers[q.id] === 'GOOD'}
                    >
                      <span className="fb-question-emoji">👍</span>
                    </button>
                    <button
                      className={`fb-question-btn fb-question-btn--bad${questionAnswers[q.id] === 'BAD' ? ' fb-question-btn--active-bad' : ''}`}
                      onClick={() => toggleAnswer(q.id, 'BAD')}
                      aria-pressed={questionAnswers[q.id] === 'BAD'}
                    >
                      <span className="fb-question-emoji">👎</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="fb-comment-wrap">
            <label className="fb-comment-optional-label">{t('commentOptional')}</label>
            <textarea
              className="fb-comment"
              placeholder={feedback === 'good' ? t('placeholderGood') : t('placeholderBad')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={hasQuestions ? 3 : 4}
            />
          </div>

          <button className="fb-send" onClick={handleSend}>
            {t('send')}
          </button>
        </div>
      </div>
    )
  }

  // ── Choice step (default) ─────────────────────────────────────
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
