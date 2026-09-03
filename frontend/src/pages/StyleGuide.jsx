import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../lib/api'

const METRIC_LABELS = {
  clarity: 'Clarity',
  sentenceLength: 'Sentence length',
  repeatedWords: 'Repeated words',
  passiveVoice: 'Passive voice',
  tone: 'Tone',
  formality: 'Formality',
  readability: 'Readability',
  wordChoice: 'Word choice',
}

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? 'var(--color-good)' : score >= 55 ? 'var(--color-style)' : 'var(--color-grammar)'

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-serif text-3xl font-semibold">{score}</span>
        <span className="text-xs text-(--color-text-faint)">Writing Score</span>
      </div>
    </div>
  )
}

function MetricRow({ label, value, note }) {
  const pct = Math.round(value)
  const color = pct >= 80 ? 'bg-(--color-good)' : pct >= 55 ? 'bg-(--color-style)' : 'bg-(--color-grammar)'
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-(--color-text)">{label}</span>
        <span className="text-(--color-text-faint)">{pct}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-3)">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {note && <p className="mt-1.5 text-xs text-(--color-text-faint)">{note}</p>}
    </div>
  )
}

export default function StyleGuide() {
  const [text, setText] = useState(
    'The report was written by the team. It was submitted very very late and it was, honestly, kind of hard to read because it was long and it was repetitive and it was not clear about what the actual point was.',
  )
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.styleAnalyze({ text })
      setAnalysis(data)
    } catch (e) {
      setError(e.message || 'Something went wrong while analyzing your text.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">Style Guide</h1>
        <p className="mt-1.5 text-sm text-(--color-text-muted)">
          Go beyond grammar — see how clear, concise and well-toned your writing is.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-(--color-grammar)/40 bg-(--color-grammar)/10 px-4 py-3 text-sm text-(--color-grammar)">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        <section className="flex min-h-[420px] flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a paragraph or two to analyze its style…"
            className="font-editor min-h-[320px] flex-1 resize-none bg-transparent text-[1.05rem] leading-8 text-(--color-text) outline-none placeholder:text-(--color-text-faint)"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="mt-4 flex w-fit items-center gap-2 self-end rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? 'Analyzing…' : 'Analyze Style'}
          </button>
        </section>

        <aside className="flex min-h-[420px] flex-col items-center rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
          {analysis ? (
            <>
              <ScoreRing score={analysis.score} />
              <div className="mt-6 w-full space-y-4">
                {Object.entries(analysis.metrics).map(([key, m]) => (
                  <MetricRow key={key} label={METRIC_LABELS[key] || key} value={m.value} note={m.note} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-(--color-text-faint)">
              Run Analyze Style to see your Writing Score and metrics.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
