import {
  collection,
  onSnapshot
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { db } from '../firebase'

export default function LeaderboardPage() {
  const [teams, setTeams] = useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teams'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      data.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }

        const aResources = a.food + a.water + a.cardboard
        const bResources = b.food + b.water + b.cardboard

        return bResources - aResources
      })

      setTeams(data)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #1f2937)',
      color: 'white',
      padding: '12px',
      fontFamily: 'Arial',
      overflow: 'hidden'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '42px',
        marginBottom: '14px',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        SURVIVAL LEADERBOARD
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        {teams.map((team, index) => {
          const totalResources =
            team.food + team.water + team.cardboard

          return (
            <motion.div
              key={team.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'rgba(31, 41, 55, 0.95)',
                borderRadius: '18px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: index === 0
                  ? '2px solid gold'
                  : '2px solid transparent',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <motion.div
                  animate={{
                    y: [0, 0, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    width: '50px'
                  }}
                >
                  #{index + 1}
                </motion.div>

                <div style={{ fontSize: '36px' }}>
                  {team.icon}
                </div>

                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {team.name}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '15px',
                    opacity: 0.9,
                    marginTop: '4px'
                  }}>
                    <div>🍎 {team.food}</div>
                    <div>💧 {team.water}</div>
                    <div>📦 {team.cardboard}</div>
                    <div>🧰 {totalResources}</div>
                  </div>
                </div>
              </div>

              <motion.div
                key={team.score}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: '34px',
                  fontWeight: 'bold'
                }}
              >
                ❤️ {team.score}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}