import {
  collection,
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import defaultTeams from '../data/defaultTeams'
import { db } from '../firebase'

export default function AdminPage() {
  const [teams, setTeams] = useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teams'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setTeams(data)
    })

    return () => unsubscribe()
  }, [])

  async function initializeTeams() {
    for (const team of defaultTeams) {
      await setDoc(doc(db, 'teams', team.id), team)
    }

    alert('Teams initialized!')
  }

  async function updateValue(teamId, field, amount) {
    const teamRef = doc(db, 'teams', teamId)

    await updateDoc(teamRef, {
      [field]: increment(amount)
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111827',
      color: 'white',
      padding: '24px',
      fontFamily: 'Arial'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '42px' }}>
          Admin Panel
        </h1>

        <button
          onClick={initializeTeams}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Initialize Teams
        </button>
      </div>

      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {teams.map(team => (
          <div
            key={team.id}
            style={{
              background: '#1f2937',
              borderRadius: '20px',
              padding: '20px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '38px' }}>
                {team.icon}
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: 'bold'
              }}>
                {team.name}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <ControlRow
                label={`Score (${team.score})`}
                onAdd={() => updateValue(team.id, 'score', 10)}
                onSubtract={() => updateValue(team.id, 'score', -10)}
              />

              <ControlRow
                label={`Food (${team.food})`}
                onAdd={() => updateValue(team.id, 'food', 1)}
                onSubtract={() => updateValue(team.id, 'food', -1)}
              />

              <ControlRow
                label={`Water (${team.water})`}
                onAdd={() => updateValue(team.id, 'water', 1)}
                onSubtract={() => updateValue(team.id, 'water', -1)}
              />

              <ControlRow
                label={`Cardboard (${team.cardboard})`}
                onAdd={() => updateValue(team.id, 'cardboard', 1)}
                onSubtract={() => updateValue(team.id, 'cardboard', -1)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ControlRow({ label, onAdd, onSubtract }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '180px',
        fontSize: '18px'
      }}>
        {label}
      </div>

      <button
        onClick={onSubtract}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          fontWeight: 'bold'
        }}
      >
        -
      </button>

      <button
        onClick={onAdd}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          fontWeight: 'bold'
        }}
      >
        +
      </button>
    </div>
  )
}