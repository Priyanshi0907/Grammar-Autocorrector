import { useState } from 'react'
import Editor from '../components/grammar/Editor'
import CorrectionsPanel from '../components/grammar/CorrectionsPanel'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const SAMPLE =
  'I has went to the market yesterday and buyed some fruits. They was very fresh and tasty. I also met with my old friend, we had a great time together.\n\nIt was a good day.'

export default function CheckGrammar() {
  const { user } = useAuth()
  const [text, setText] = useState(SAMPLE)
  const [language, setLanguage] = useState('English (US)')
  const [corrections, setCorrections] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [checking, setChecking] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [error, setError] = useState('')

  const handleTextChange = (value) => {
    setText(value)
    if (hasChecked) {
      setHasChecked(false)
      setCorrections([])
      setAppliedIds(new Set())
      setActiveId(null)
    }
  }

  const handleCheck = async () => {
    if (!text.trim()) return
    setChecking(true)
    setError('')
    try {
      const result = await api.checkGrammar({ text, language })
      setCorrections(result.corrections || [])
      setAppliedIds(new Set())
      setActiveId(null)
      setHasChecked(true)
    } catch (e) {
      setError(e.message || 'Something went wrong while checking your text.')
    } finally {
      setChecking(false)
    }
  }

  const handleApply = (correction) => {
    setText((prev) => prev.slice(0, correction.offset) + correction.suggestion + prev.slice(correction.offset + correction.length))
    const delta = correction.suggestion.length - correction.length
    setCorrections((prev) =>
      prev.map((c) =>
        c.offset > correction.offset
          ? { ...c, offset: c.offset + delta }
          : c,
      ),
    )
    setAppliedIds((prev) => new Set(prev).add(correction.id))
  }

  const handleApplyAll = () => {
    const unapplied = corrections
      .filter((c) => !appliedIds.has(c.id))
      .sort((a, b) => b.offset - a.offset)

    let current = text
    for (const c of unapplied) {
      if (c.suggestion === undefined || c.suggestion === null) continue
      current = current.slice(0, c.offset) + c.suggestion + current.slice(c.offset + c.length)
    }

    setText(current)
    setAppliedIds(new Set(corrections.map((c) => c.id)))
  }

  const handleClear = () => {
    setText('')
    setCorrections([])
    setAppliedIds(new Set())
    setHasChecked(false)
    setActiveId(null)
    setError('')
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden px-4 pb-4 pt-3 md:px-6">
      {/* Header section with spacious, comfortable breathing room */}
      <div className="mb-3 shrink-0">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-(--color-text) md:text-3xl">Check Grammar</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          Paste or write your text, then let Writely catch grammar, spelling, style and punctuation issues.
        </p>
      </div>

      {error && (
        <div className="mb-2 shrink-0 rounded-xl border border-(--color-grammar)/40 bg-(--color-grammar)/10 px-4 py-2 text-xs text-(--color-grammar)">
          {error}
        </div>
      )}

      {/* Main 2-column workspace */}
      <div className="grid flex-1 min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flex h-full min-h-0 flex-col">
          <Editor
            text={text}
            onTextChange={handleTextChange}
            language={language}
            setLanguage={setLanguage}
            corrections={corrections}
            activeId={activeId}
            onFocusCorrection={setActiveId}
            onCheck={handleCheck}
            onClear={handleClear}
            checking={checking}
            hasChecked={hasChecked}
          />
        </div>
        <div className="flex h-full min-h-0 flex-col">
          <CorrectionsPanel
            corrections={corrections}
            appliedIds={appliedIds}
            onApply={handleApply}
            onApplyAll={handleApplyAll}
            activeId={activeId}
            onFocus={setActiveId}
            hasChecked={hasChecked}
            checking={checking}
          />
        </div>
      </div>

      {!user && (
        <p className="mt-2 shrink-0 text-center text-[11px] text-(--color-text-faint)">
          Sign in to save every check to your History.
        </p>
      )}
    </div>
  )
}
