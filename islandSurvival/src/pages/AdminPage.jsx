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
import { Link } from 'react-router-dom'
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
    await deleteDoc(doc(db, "teams", teamId))
  }

  async function endDay() {
    if(!confirm("end day?")) return
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
      const waterPenalty = Math.min(Math.ceil(missingWater / 2), 6)

      const newWater = Math.max(water - requiredWater, 0)

      // -------------------------
      // CARDBOARD RULE
      // -------------------------
      const requiredCardboard = round * 5
      const cardboardPenalty = cardboard < requiredCardboard ? 6 : 0

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
  //   if(!confirm("Reset game?")) return
  //   for (const team of defaultTeams) {
  //     await setDoc(doc(db, 'teams', team.id), team)
  //   }

  //   await setDoc(doc(db, "game", "current"), {
  //     round: 1
  //   })

  //   alert('Teams initialized!')
  // }
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <h1 style={{ fontSize: '42px' }}>
            Admin Panel
          </h1>

          <Link
            to="/"
            style={{
              fontSize: '15px',
              fontWeight: 'bold',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9ca3af',
              textDecoration: 'none'
            }}
          >
            Leaderboard
          </Link>
        </div>

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
                onAdd={() => updateValue(team.id, 'score', 1)}
                onSubtract={() => updateValue(team.id, 'score', -1)}
                onAddAmount={n => updateValue(team.id, 'score', n)}
              />

              <ControlRow
                label={`Food (${team.food})`}
                onAdd={() => updateValue(team.id, 'food', 1)}
                onSubtract={() => updateValue(team.id, 'food', -1)}
                onAddAmount={n => updateValue(team.id, 'food', n)}
              />

              <ControlRow
                label={`Water (${team.water})`}
                onAdd={() => updateValue(team.id, 'water', 1)}
                onSubtract={() => updateValue(team.id, 'water', -1)}
                onAddAmount={n => updateValue(team.id, 'water', n)}
              />

              <ControlRow
                label={`People (${team.people})`}
                onAdd={() => updateValue(team.id, 'people', 1)}
                onSubtract={() => updateValue(team.id, 'people', -1)}
                onAddAmount={n => updateValue(team.id, 'people', n)}
              />

              <ControlRow
                label={`Cardboard (${team.cardboard})`}
                onAdd={() => updateValue(team.id, 'cardboard', 1)}
                onSubtract={() => updateValue(team.id, 'cardboard', -1)}
                onAddAmount={n => updateValue(team.id, 'cardboard', n)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ControlRow({ label, onAdd, onSubtract, onAddAmount }) {
  const [qty, setQty] = useState('')

  const amount = Number(qty)
  const canAdd = qty.trim() !== '' && Number.isFinite(amount) && amount !== 0

  // Only applied when Add is pressed (or Enter) - never while typing.
  function commitAmount() {
    if (!canAdd) return
    onAddAmount(amount)
    setQty('')
  }

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

      <input
        type="number"
        value={qty}
        onChange={event => setQty(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') commitAmount()
        }}
        placeholder="qty"
        style={{
          width: '84px',
          height: '42px',
          boxSizing: 'border-box',
          padding: '0 10px',
          borderRadius: '8px',
          border: '1px solid #374151',
          background: '#111827',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}
      />

      <button
        onClick={commitAmount}
        disabled={!canAdd}
        style={{
          height: '42px',
          padding: '0 18px',
          borderRadius: '8px',
          border: 'none',
          cursor: canAdd ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
          opacity: canAdd ? 1 : 0.5
        }}
      >
        Add
      </button>

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