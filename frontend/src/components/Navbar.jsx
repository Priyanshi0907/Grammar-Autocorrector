import { NavLink, useNavigate } from 'react-router-dom'
import { Feather, Sun, Moon, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Check Grammar' },
  { to: '/paraphrase', label: 'Paraphrase' },
  { to: '/style-guide', label: 'Style Guide' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleHistoryClick = (e, to) => {
    if (to === '/history' && !user) {
      e.preventDefault()
      navigate('/sign-in', { state: { from: '/history' } })
    }
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-surface)/90 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-6">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-3)">
            <Feather size={17} className="text-(--color-accent)" strokeWidth={1.75} />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={(e) => handleHistoryClick(e, link.to)}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-(--color-surface-3) text-(--color-text) border border-(--color-border)'
                      : 'text-(--color-text-muted) hover:text-(--color-text)'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) hover:text-(--color-text)"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-(--color-accent) py-1.5 pl-1.5 pr-3.5 font-semibold text-(--color-accent-ink)"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-accent-ink)/15">
                  <User size={13} />
                </span>
                <span className="text-sm">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface-2) py-1 shadow-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut()
                      navigate('/')
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-(--color-text-muted) hover:bg-(--color-surface-3) hover:text-(--color-text)"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/sign-in"
              className="rounded-full bg-(--color-accent) px-5 py-2 text-sm font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.02]"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
