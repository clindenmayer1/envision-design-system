/*
 * RoomSelector — a "Kitchen" dropdown that lists every room of the house. Each row shows the
 * room title (left) and a simple completion status (right). Selecting a room updates the
 * trigger label. Purely front-end for now (rooms other than the kitchen aren't wired to the
 * scene yet), but structured so a room→scene switch can hang off `onSelect` later.
 */
import { useEffect, useRef, useState } from 'react'
import './RoomSelector.css'

type Status = 'complete' | 'in-progress' | 'not-started'
interface Room {
  name: string
  status: Status
}

// The rooms of the house + a simple completion status each. Kitchen is the one in progress.
const ROOMS: Room[] = [
  { name: 'Kitchen', status: 'in-progress' },
  { name: 'Living Room', status: 'complete' },
  { name: 'Dining Room', status: 'not-started' },
  { name: 'Primary Bedroom', status: 'not-started' },
  { name: 'Primary Bath', status: 'not-started' },
  { name: 'Guest Bedroom', status: 'not-started' },
  { name: 'Guest Bath', status: 'not-started' },
  { name: 'Home Office', status: 'not-started' },
  { name: 'Powder Room', status: 'not-started' },
  { name: 'Laundry Room', status: 'not-started' },
  { name: 'Entryway', status: 'not-started' },
  { name: 'Garage', status: 'not-started' },
]

const STATUS_LABEL: Record<Status, string> = {
  complete: 'Complete',
  'in-progress': 'In Progress',
  'not-started': 'Not Started',
}

export default function RoomSelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('Kitchen')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="roomsel" ref={ref}>
      <button
        type="button"
        className="roomsel__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="roomsel__trigger-label">{selected}</span>
        <span className={`roomsel__caret${open ? ' roomsel__caret--up' : ''}`} aria-hidden>
          ›
        </span>
      </button>
      {open && (
        <ul className="roomsel__menu" role="listbox" aria-label="Rooms">
          {ROOMS.map((room) => (
            <li key={room.name}>
              <button
                type="button"
                role="option"
                aria-selected={room.name === selected}
                className={`roomsel__row${room.name === selected ? ' roomsel__row--active' : ''}`}
                onClick={() => {
                  setSelected(room.name)
                  setOpen(false)
                }}
              >
                <span className="roomsel__room">{room.name}</span>
                <span className={`roomsel__status roomsel__status--${room.status}`}>
                  {STATUS_LABEL[room.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
