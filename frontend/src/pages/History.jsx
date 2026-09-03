import { useEffect, useState } from 'react'
import { ChevronDown, Trash2, Clock } from 'lucide-react'
import { api } from '../lib/api'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listHistory()
      .then((res) => setItems(res.history))
      .catch((e) => setError(e.message || 'Could not load your history.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await api.deleteHistoryItem(id)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-8 md:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">History</h1>
        <p className="mt-1.5 text-sm text-(--color-text-muted)">Every grammar check you've run, saved to your account.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-(--color-grammar)/40 bg-(--color-grammar)/10 px-4 py-3 text-sm text-(--color-grammar)">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-faint)">Loading history…</p>}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) px-6 py-16 text-center text-sm text-(--color-text-faint)">
          You haven't checked any text yet. Run a check and it will show up here.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const open = openId === item.id
          return (
            <div key={item.id} className="rounded-3xl border border-(--color-border) bg-(--color-surface)">
              <button onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-(--color-text)">{item.originalText}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-faint)">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span>{item.errorCount} errors</span>
                    <span>{item.correctionCount} corrections</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className="shrink-0 text-(--color-text-faint) hover:text-(--color-grammar)"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronDown size={16} className={`shrink-0 text-(--color-text-faint) transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="space-y-4 border-t border-(--color-border) px-5 py-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-(--color-text-faint)">Original</p>
                    <p className="font-editor text-sm leading-7 text-(--color-text-muted)">{item.originalText}</p>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-(--color-text-faint)">Corrected</p>
                    <p className="font-editor text-sm leading-7 text-(--color-text)">{item.correctedText}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
