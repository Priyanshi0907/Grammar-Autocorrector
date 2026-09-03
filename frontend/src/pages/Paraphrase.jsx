import { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { api } from '../lib/api'

const MODES = ['Simple', 'Professional', 'Formal', 'Concise', 'Natural']

export default function Paraphrase() {
  const [text, setText] = useState('The project was very difficult to complete.')
  const [mode, setMode] = useState('Professional')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleParaphrase = async () => {
    setLoading(true)
    setError('')
    try {
      const { paraphrased } = await api.paraphrase({ text, mode })
      setResult(paraphrased)
    } catch (e) {
      setError(e.message || 'Something went wrong while paraphrasing.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">Paraphrase</h1>
        <p className="mt-1.5 text-sm text-(--color-text-muted)">Rewrite your text while keeping its original meaning.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface) p-1 w-fit">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? 'bg-(--color-accent) text-(--color-accent-ink)' : 'text-(--color-text-muted) hover:text-(--color-text)'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-(--color-grammar)/40 bg-(--color-grammar)/10 px-4 py-3 text-sm text-(--color-grammar)">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="flex min-h-[420px] flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
          <h3 className="mb-3 text-sm font-medium text-(--color-text-muted)">Original</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text you'd like to rewrite…"
            className="font-editor min-h-[300px] flex-1 resize-none bg-transparent text-[1.05rem] leading-8 text-(--color-text) outline-none placeholder:text-(--color-text-faint)"
          />
          <button
            onClick={handleParaphrase}
            disabled={loading || !text.trim()}
            className="mt-4 flex w-fit items-center gap-2 self-end rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? 'Rewriting…' : 'Paraphrase'}
          </button>
        </section>

        <section className="flex min-h-[420px] flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-(--color-text-muted)">{mode} rewrite</h3>
            {result && (
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium text-(--color-text-muted) hover:text-(--color-text)">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className="font-editor min-h-[300px] flex-1 whitespace-pre-wrap text-[1.05rem] leading-8 text-(--color-text)">
            {result || <span className="text-(--color-text-faint)">Your paraphrased text will appear here.</span>}
          </div>
        </section>
      </div>
    </div>
  )
}
