import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        background: '#111827',
        padding: '16px',
        display: 'flex',
        gap: '16px'
      }}>
        <Link
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Leaderboard
        </Link>

        <Link
          to="/admin"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Admin Panel
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}