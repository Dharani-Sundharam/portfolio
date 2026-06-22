'use client'

import { useEffect, useRef, useState } from 'react'

type GameId = 'menu' | 'snake' | 'ttt'

export default function Games() {
  const [game, setGame] = useState<GameId>('menu')
  const title = game === 'snake' ? 'Snake' : game === 'ttt' ? 'Tic-Tac-Toe' : 'DharaniOS Arcade'

  return (
    <div className="absolute inset-0 flex flex-col bg-[#11151c] text-slate-100 font-win7">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 border-b border-white/10 text-[12px]">
        {game !== 'menu' && (
          <button onClick={() => setGame('menu')} className="px-2 py-0.5 rounded hover:bg-white/10">
            ← Games
          </button>
        )}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {game === 'menu' && <Menu onPick={setGame} />}
        {game === 'snake' && <Snake />}
        {game === 'ttt' && <TicTacToe />}
      </div>
    </div>
  )
}

function Menu({ onPick }: { onPick: (g: GameId) => void }) {
  const games: { id: GameId; emoji: string; name: string; desc: string }[] = [
    { id: 'snake', emoji: '🐍', name: 'Snake', desc: 'Eat, grow, don’t bite yourself' },
    { id: 'ttt', emoji: '⭕', name: 'Tic-Tac-Toe', desc: 'Beat the computer' },
  ]
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {games.map((g) => (
        <button
          key={g.id}
          onClick={() => onPick(g.id)}
          className="flex flex-col items-center gap-1.5 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sky-400/40 transition"
        >
          <span className="text-4xl leading-none">{g.emoji}</span>
          <span className="text-[13px] font-semibold">{g.name}</span>
          <span className="text-[11px] text-slate-400 text-center">{g.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ── Snake ──────────────────────────────────────────────────────────────────
type Pt = { x: number; y: number }
const COLS = 20
const ROWS = 15
const CELL = 16

function Snake() {
  const cvs = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const g = useRef({
    snake: [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }] as Pt[],
    dir: { x: 1, y: 0 } as Pt,
    next: { x: 1, y: 0 } as Pt,
    food: { x: 14, y: 7 } as Pt,
  })

  const randFood = (snake: Pt[]): Pt => {
    let f: Pt
    do {
      f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
    } while (snake.some((s) => s.x === f.x && s.y === f.y))
    return f
  }

  const setDir = (d: Pt) => {
    const cur = g.current.dir
    if (d.x === -cur.x && d.y === -cur.y) return // can't reverse
    g.current.next = d
  }

  const reset = () => {
    g.current = {
      snake: [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: randFood([{ x: 8, y: 7 }]),
    }
    setScore(0)
    setOver(false)
  }

  const draw = () => {
    const c = cvs.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.fillStyle = '#0b132b'
    ctx.fillRect(0, 0, c.width, c.height)
    const s = g.current
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(s.food.x * CELL + 2, s.food.y * CELL + 2, CELL - 4, CELL - 4)
    s.snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#86efac' : '#22c55e'
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2)
    })
  }

  // keyboard
  useEffect(() => {
    const map: Record<string, Pt> = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    }
    const onKey = (e: KeyboardEvent) => {
      const d = map[e.key]
      if (d) {
        e.preventDefault()
        setDir(d)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // game loop
  useEffect(() => {
    draw()
    if (over) return
    const id = setInterval(() => {
      const s = g.current
      s.dir = s.next
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }
      if (
        head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        s.snake.some((p) => p.x === head.x && p.y === head.y)
      ) {
        setOver(true)
        return
      }
      s.snake.unshift(head)
      if (head.x === s.food.x && head.y === s.food.y) {
        setScore((v) => v + 1)
        s.food = randFood(s.snake)
      } else {
        s.snake.pop()
      }
      draw()
    }, 110)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over])

  // swipe
  const touch = useRef<Pt | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx > 0 ? 1 : -1, y: 0 })
    else setDir({ x: 0, y: dy > 0 ? 1 : -1 })
  }

  const Btn = ({ d, children }: { d?: Pt; children: React.ReactNode }) => (
    <button
      onClick={() => (d ? setDir(d) : reset())}
      className="grid place-items-center h-9 rounded bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10"
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col items-center gap-2.5 p-3">
      <div className="text-[12px] text-slate-300">
        Score: <span className="font-semibold text-emerald-400">{score}</span>
      </div>
      <div className="relative">
        <canvas
          ref={cvs}
          width={COLS * CELL}
          height={ROWS * CELL}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="rounded border border-slate-700 touch-none max-w-full"
        />
        {over && (
          <div className="absolute inset-0 grid place-items-center bg-black/65 rounded">
            <div className="text-center">
              <div className="text-lg font-semibold">Game Over</div>
              <div className="text-[12px] text-slate-300 mb-2">Score {score}</div>
              <button
                onClick={reset}
                className="px-3 py-1 rounded text-[12px] bg-emerald-600 hover:bg-emerald-500"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="text-[11px] text-slate-500">Arrow keys / WASD · swipe · or use the pad</div>
      <div className="grid grid-cols-3 gap-1 w-36">
        <span />
        <Btn d={{ x: 0, y: -1 }}>▲</Btn>
        <span />
        <Btn d={{ x: -1, y: 0 }}>◀</Btn>
        <Btn>↻</Btn>
        <Btn d={{ x: 1, y: 0 }}>▶</Btn>
        <span />
        <Btn d={{ x: 0, y: 1 }}>▼</Btn>
        <span />
      </div>
    </div>
  )
}

// ── Tic-Tac-Toe ──────────────────────────────────────────────────────────────
type Cell = null | 'X' | 'O'
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

function winnerOf(b: Cell[]): Cell {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  return null
}

function aiMove(b: Cell[]): number {
  const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
  for (const i of free) {
    const t = b.slice()
    t[i] = 'O'
    if (winnerOf(t) === 'O') return i // win
  }
  for (const i of free) {
    const t = b.slice()
    t[i] = 'X'
    if (winnerOf(t) === 'X') return i // block
  }
  if (b[4] === null) return 4
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null)
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  return free[Math.floor(Math.random() * free.length)]
}

function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [status, setStatus] = useState<'play' | 'win' | 'lose' | 'draw'>('play')

  const reset = () => {
    setBoard(Array(9).fill(null))
    setStatus('play')
  }

  const play = (i: number) => {
    if (board[i] || status !== 'play') return
    const b = board.slice()
    b[i] = 'X'
    if (winnerOf(b) === 'X') return (setBoard(b), setStatus('win'))
    if (b.every(Boolean)) return (setBoard(b), setStatus('draw'))
    b[aiMove(b)] = 'O'
    setBoard(b)
    if (winnerOf(b) === 'O') setStatus('lose')
    else if (b.every(Boolean)) setStatus('draw')
  }

  const msg =
    status === 'win' ? '🎉 You win!' : status === 'lose' ? '🤖 Computer wins' : status === 'draw' ? '🤝 Draw' : 'Your move (X)'

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="text-[13px] text-slate-300">{msg}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="w-[68px] h-[68px] grid place-items-center text-3xl font-bold rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-100"
            style={{ color: c === 'X' ? '#67e8f9' : '#fca5a5' }}
          >
            {c}
          </button>
        ))}
      </div>
      <button onClick={reset} className="px-3 py-1 rounded text-[12px] bg-white/10 hover:bg-white/20 border border-white/10">
        New game
      </button>
    </div>
  )
}
