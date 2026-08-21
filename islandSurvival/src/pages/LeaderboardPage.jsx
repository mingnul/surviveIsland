import { doc, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { db } from '../firebase'

/* ------------------------------------------------------------------ *
 * Design tokens
 * ------------------------------------------------------------------ */

const C = {
  bg: '#0d1117',
  rowBg: '#161e27',
  rowEdge: '#222c37',
  panel: '#2c3845',
  text: '#e8edf2',
  muted: '#6f7d8c',
  label: '#5d6b7a',
  gold: '#f0c04a',
  round: '#ffc233',
  food: '#8fd07a',
  water: '#6fb6e8',
  cardboard: '#d9a468',
  teamM: '#5aa9f0',
  teamF: '#f07ab0'
}

const SANS = "'Barlow Condensed', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, Consolas, monospace"

const GRID = 'minmax(0, 1.3fr) minmax(0, 0.85fr) minmax(0, 0.85fr) minmax(0, 1fr) minmax(0, 1.3fr)'

const MEDALS = [
  { bg: '#f0c04a', color: '#3a2b00', ring: '#ffe08a' },
  { bg: '#c3ccd4', color: '#242c33', ring: '#e4ebf1' },
  { bg: '#c07a45', color: '#2b1500', ring: '#e0a374' }
]
const NO_MEDAL = { bg: 'transparent', color: C.label, ring: '#2a3542' }

/* ------------------------------------------------------------------ *
 * Pixel-art icons
 * ------------------------------------------------------------------ */

function FoodIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ flex: '0 0 auto' }} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="0" width="1" height="1" fill={C.food} />
      <rect x="1" y="1" width="5" height="1" fill="#e0553f" />
      <rect x="0" y="2" width="7" height="3" fill="#e0553f" />
      <rect x="1" y="5" width="5" height="1" fill="#e0553f" />
      <rect x="2" y="6" width="3" height="1" fill="#e0553f" />
    </svg>
  )
}

function WaterIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ flex: '0 0 auto' }} shapeRendering="crispEdges" fill={C.water} aria-hidden="true">
      <rect x="3" y="0" width="1" height="1" />
      <rect x="2" y="1" width="3" height="1" />
      <rect x="1" y="2" width="5" height="2" />
      <rect x="0" y="4" width="7" height="2" />
      <rect x="1" y="6" width="5" height="1" />
    </svg>
  )
}

function CardboardIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ flex: '0 0 auto' }} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width="7" height="2" fill="#e6c08c" />
      <rect x="0" y="2" width="7" height="5" fill={C.cardboard} />
      <rect x="3" y="2" width="1" height="5" fill="#a9773f" />
    </svg>
  )
}

function HeartIcon({ fill = '#e0553f', width = 22, height = 19 }) {
  return (
    <svg viewBox="0 0 7 6" width={width} height={height} style={{ flex: '0 0 auto' }} shapeRendering="crispEdges" fill={fill} aria-hidden="true">
      <rect x="1" y="0" width="2" height="1" />
      <rect x="4" y="0" width="2" height="1" />
      <rect x="0" y="1" width="7" height="2" />
      <rect x="1" y="3" width="5" height="1" />
      <rect x="2" y="4" width="3" height="1" />
      <rect x="3" y="5" width="1" height="1" />
    </svg>
  )
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const clampHealth = value => Math.max(0, Math.min(100, Number(value ?? 0)))

const healthColor = health =>
  health > 60 ? '#4fbf6a' : health > 30 ? '#ffc233' : '#e0553f'

const teamColor = name =>
  /^M/i.test(name ?? '') ? C.teamM : /^F/i.test(name ?? '') ? C.teamF : C.text

/* ------------------------------------------------------------------ *
 * Column header
 * ------------------------------------------------------------------ */

function ColumnHeaders() {
  const cell = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px'
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        alignItems: 'end',
        gap: '0 14px',
        padding: '0 16px 6px',
        fontFamily: MONO,
        fontSize: '22px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        color: C.label
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <span>Rank</span>
        <span>Team</span>
      </div>

      <div style={{ ...cell, color: C.food }}>
        <FoodIcon />
        <span>Food</span>
      </div>

      <div style={{ ...cell, color: C.water }}>
        <WaterIcon />
        <span>Water</span>
      </div>

      <div style={{ ...cell, color: C.cardboard }}>
        <CardboardIcon />
        <span>Cardboard</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ flex: 1, textAlign: 'right' }}>Health</span>
        <HeartIcon />
        <span style={{ width: '62px' }} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * One leaderboard row
 * ------------------------------------------------------------------ */

function TeamRow({ team, rank }) {
  const isFirst = rank === 0
  const health = clampHealth(team.score)
  const barColor = healthColor(health)
  const nameColor = teamColor(team.name)
  const medal = MEDALS[rank] || NO_MEDAL

  const statCell = {
    textAlign: 'center',
    fontFamily: MONO,
    fontSize: '28px',
    fontWeight: 700
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ layout: { type: 'spring', stiffness: 320, damping: 32 }, duration: 0.25 }}
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        alignItems: 'center',
        gap: '0 14px',
        padding: '10px 16px',
        borderRadius: '8px',
        background: isFirst
          ? 'linear-gradient(90deg, #2a2005 0%, #1b1a12 60%, #161e27 100%)'
          : C.rowBg,
        borderLeft: `4px solid ${isFirst ? C.gold : C.rowEdge}`,
        boxShadow: isFirst
          ? '0 0 0 1px rgba(240,192,74,0.45), 0 0 26px rgba(240,192,74,0.28)'
          : 'none'
      }}
    >
      {/* Rank + team name, on the angled panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '22px',
          alignSelf: 'stretch',
          background: `linear-gradient(100deg, ${C.panel} 0%, ${C.panel} 55%, rgba(44,56,69,0) 100%)`,
          margin: '-10px 0 -10px -16px',
          padding: '0 56px 0 16px',
          borderRadius: '8px 0 0 8px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            flex: '0 0 auto',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SANS,
            fontSize: '24px',
            fontWeight: 700,
            background: medal.bg,
            color: medal.color,
            border: `2px solid ${medal.ring}`,
            boxShadow: isFirst ? '0 0 16px rgba(240,192,74,0.75)' : 'none'
          }}
        >
          {rank + 1}
        </div>

        <span
          style={{
            fontFamily: MONO,
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: nameColor,
            whiteSpace: 'nowrap'
          }}
        >
          {team.name}
        </span>

        <span style={{ marginLeft: 'auto', alignSelf: 'stretch', display: 'flex', gap: '6px' }}>
          <span style={{ width: '6px', background: nameColor, transform: 'skewX(-22deg)' }} />
          <span style={{ width: '7px', background: '#f2f4f7', transform: 'skewX(-22deg)' }} />
        </span>
      </div>

      <div style={{ ...statCell, color: C.food }}>{Number(team.food ?? 0)}</div>
      <div style={{ ...statCell, color: C.water }}>{Number(team.water ?? 0)}</div>
      <div style={{ ...statCell, color: C.cardboard }}>{Number(team.cardboard ?? 0)}</div>

      {/* Health bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            flex: 1,
            height: '14px',
            borderRadius: '3px',
            background: C.bg,
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${health}%`, backgroundColor: barColor }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: '3px' }}
          />
        </div>

        <HeartIcon fill={barColor} />

        <motion.div
          key={health}
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '62px',
            textAlign: 'right',
            fontFamily: MONO,
            fontSize: '28px',
            fontWeight: 700
          }}
        >
          {health}
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function LeaderboardPage() {
  const [teams, setTeams] = useState([])
  const [round, setRound] = useState(1)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'game', 'current'), snap => {
      setRound(Number(snap.data()?.round ?? 1))
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teams'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      data.sort((a, b) => {
        const aScore = Number(a.score ?? 0)
        const bScore = Number(b.score ?? 0)

        if (bScore !== aScore) return bScore - aScore

        const aResources =
          Number(a.food ?? 0) + Number(a.water ?? 0) + Number(a.cardboard ?? 0)
        const bResources =
          Number(b.food ?? 0) + Number(b.water ?? 0) + Number(b.cardboard ?? 0)

        if (bResources !== aResources) return bResources - aResources

        return String(a.name ?? '').localeCompare(String(b.name ?? ''))
      })

      setTeams(data)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: SANS,
        color: C.text,
        padding: '22px 32px 28px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '24px',
          borderBottom: `1px solid ${C.rowEdge}`,
          paddingBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px' }}>
          <span
            style={{
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}
          >
            Survival Leaderboard
          </span>

          <Link
            to="/admin"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.muted,
              textDecoration: 'none'
            }}
          >
            Admin Panel
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: MONO }}>
          <span
            style={{
              fontSize: '18px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: C.muted,
              marginRight: '12px'
            }}
          >
            Round
          </span>

          <motion.span
            key={round}
            initial={{ scale: 1.25, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              width: '112px',
              textAlign: 'left',
              fontSize: '42px',
              fontWeight: 700,
              color: C.round,
              lineHeight: 1
            }}
          >
            {round}
          </motion.span>
        </div>
      </div>

      <ColumnHeaders />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <AnimatePresence initial={false}>
          {teams.map((team, index) => (
            <TeamRow key={team.id} team={team} rank={index} />
          ))}
        </AnimatePresence>
      </div>

      {teams.length === 0 && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: '20px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.label,
            padding: '24px 16px'
          }}
        >
          Waiting for teams…
        </div>
      )}
    </div>
  )
}
