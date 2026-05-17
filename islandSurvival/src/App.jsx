import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  async function endDay() {
    for (const team of teams) {
      const requiredFood = team.people * 2
      const requiredWater = team.people * 2

      const remainingFood = Math.max(team.food - requiredFood, 0)
      const remainingWater = Math.max(team.water - requiredWater, 0)

      const missingFood = Math.max(requiredFood - team.food, 0)
      const missingWater = Math.max(requiredWater - team.water, 0)

      const foodPenalty = Math.ceil(missingFood / 2)
      const waterPenalty = Math.ceil(missingWater / 2)

      const totalPenalty = Math.min(foodPenalty + waterPenalty, 3)

      const newScore = Math.max(team.score - totalPenalty, 0)

      const teamRef = doc(db, 'teams', team.id)

      await updateDoc(teamRef, {
        food: remainingFood,
        water: remainingWater,
        score: newScore
      })
    }

    alert('End of day processed!')
  }

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