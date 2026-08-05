import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.storeyes.io',
})

export interface Question {
  id: number
  labelAr: string
  labelFr: string
  labelEn: string
  displayOrder: number
}

export interface FeedbackProfile {
  id: number
  storeId: number
  code: string
  storeName: string
  logoUrl: string
  googleReviewUrl: string
  questions?: Question[]
  multipleQuestionsEnabled?: boolean
}

export function getFeedbackProfile(code: string) {
  return api.get<FeedbackProfile>(`/api/feedback-profiles/${code}`)
}

export interface CreateFeedbackRequest {
  feedbackProfileCode: string
  rating: 'GOOD' | 'BAD'
  language: string
  isMobile: boolean
}

export interface CreateFeedbackResponse {
  success: boolean
  id: string
}

export function createFeedback(data: CreateFeedbackRequest) {
  return api.post<CreateFeedbackResponse>('/api/feedback', data)
}

export interface CompleteFeedbackRequest {
  comment?: string
  isVisiting?: boolean
  answers?: { questionId: number; rating: 'GOOD' | 'BAD' }[]
}

export function completeFeedback(id: string, data: CompleteFeedbackRequest) {
  return api.patch(`/api/feedback/${id}`, data)
}

export function isMobileDevice(): boolean {
  return (
    (navigator as any).userAgentData?.mobile ??
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ??
    navigator.maxTouchPoints > 1
  )
}

export function isIOSOrMac(): boolean {
  return /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)
}

export default api
