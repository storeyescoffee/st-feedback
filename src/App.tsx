import { Routes, Route } from 'react-router-dom'
import FeedbackPage from './pages/FeedbackPage'
import LanguageGate from './components/LanguageGate'

export default function App() {
  return (
    <Routes>
      <Route
        path="/:code"
        element={
          <LanguageGate>
            <FeedbackPage />
          </LanguageGate>
        }
      />
    </Routes>
  )
}
