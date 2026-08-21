import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
