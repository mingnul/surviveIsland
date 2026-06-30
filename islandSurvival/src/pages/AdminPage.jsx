import {
  collection,
  doc,
  increment,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import defaultTeams from '../data/defaultTeams'
import { db } from '../firebase'

export default function AdminPage() {
  const [teams, setTeams] = useState([])

  async function addTeam() {
    const id = crypto.randomUUID()

    await setDoc(doc(db, "teams", id), {
      name: "New Group",
      icon: "🆕",
      score: 100,
      food: 0,
      water: 0,
      cardboard: 0,
      people: 6
    })
  }

  async function removeTeam(teamId) {
    if (round > 1) {
      alert("Cannot remove teams after game starts")
      return
    }
    await deleteDoc(doc(db, "teams", teamId))
  }

  async function endDay() {
    const gameRef = doc(db, "game", "current")

    const currentRoundSnap = await getDoc(gameRef)
    const round = Number(currentRoundSnap.data()?.round ?? 1)

    for (const team of teams) {
      const people = Number(team.people ?? 0)
      const food = Number(team.food ?? 0)
      const water = Number(team.water ?? 0)
      const score = Number(team.score ?? 100)
      const cardboard = Number(team.cardboard ?? 0)

      // -------------------------
      // FOOD RULE
      // -------------------------
      const requiredFood = people * 2
      const missingFood = Math.max(requiredFood - food, 0)
      const foodPenalty = Math.min(Math.ceil(missingFood / 2), 3)

      const newFood = Math.max(food - requiredFood, 0)

      // -------------------------
      // WATER RULE
      // -------------------------
      const requiredWater = people * 2
      const missingWater = Math.max(requiredWater - water, 0)
      const waterPenalty = Math.min(Math.ceil(missingWater / 2), 3)

      const newWater = Math.max(water - requiredWater, 0)

      // -------------------------
      // CARDBOARD RULE
      // -------------------------
      const requiredCardboard = round * 5
      const cardboardPenalty = cardboard < requiredCardboard ? 3 : 0

      // -------------------------
      // TOTAL SCORE LOSS
      // -------------------------
      const totalPenalty = foodPenalty + waterPenalty + cardboardPenalty
      const newScore = Math.max(score - totalPenalty, 0)

      await updateDoc(doc(db, "teams", team.id), {
        food: newFood,
        water: newWater,
        score: newScore
      })
    }

    // move to next round
    await updateDoc(gameRef, {
      round: round + 1
    })

    alert("End Day complete. Next round started.")
  }

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

    await setDoc(doc(db, "game", "current"), {
      round: 1
    })

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

        <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={endDay}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            background: '#ef4444',
            color: 'white'
          }}
        >
          End Day
        </button>

        <button onClick={addTeam}>
          + Add Group
        </button>
        

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
                label={`People (${team.people})`}
                onAdd={() => updateValue(team.id, 'people', 1)}
                onSubtract={() => updateValue(team.id, 'people', -1)}
              />

              <ControlRow
                label={`Cardboard (${team.cardboard})`}
                onAdd={() => updateValue(team.id, 'cardboard', 1)}
                onSubtract={() => updateValue(team.id, 'cardboard', -1)}
              />
              <button
              onClick={() => removeTeam(team.id)}
              style={{
                background: "red",
                color: "white",
                padding: "6px",
                borderRadius: "6px",
                marginTop: "8px"
              }}
            >
              Remove
            </button>
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