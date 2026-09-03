import { useState } from 'react'
import { ChevronUp, ChevronDown, Copy, CheckCircle2, Sparkles, CheckCheck } from 'lucide-react'
import CorrectionItem from './CorrectionItem'

export default function CorrectionsPanel({
  corrections,
  appliedIds,
  onApply,
  onApplyAll,
  activeId,
  onFocus,
  hasChecked,
  checking,
}) {
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)
  const remaining = corrections.filter((c) => !appliedIds.has(c.id))

  const handleCopyAll = async () => {
    const report = corrections
      .map((c, i) => `${i + 1}. ${c.original} → ${c.suggestion} (${c.type})`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          {hasChecked ? corrections.length : 0} Corrections
          {corrections.length > 0 && <span className="h-2 w-2 rounded-full bg-(--color-spelling)" />}
        </h2>
        <button
          onClick={() => setHidden((h) => !h)}
          className="flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text)"
        >
          {hidden ? 'Show' : 'Hide'}
          {hidden ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </div>

      {!hidden && (
        <div className="mt-3 flex-1 min-h-0 space-y-2.5 overflow-y-auto pr-1">
          {checking && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-(--color-text-faint)">
              <Sparkles className="animate-pulse text-(--color-accent)" size={22} />
              Analyzing your writing…
            </div>
          )}

          {!checking && !hasChecked && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-(--color-text-faint)">
              Run Check Grammar to see corrections here.
            </div>
          )}

          {!checking &&
            hasChecked &&
            corrections.map((c, i) => (
              <CorrectionItem
                key={c.id}
                index={i + 1}
                correction={c}
                applied={appliedIds.has(c.id)}
                active={activeId === c.id}
                onApply={onApply}
                onFocus={() => onFocus(c.id)}
              />
            ))}

          {!checking && hasChecked && corrections.length > 0 && remaining.length === 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-(--color-good)/30 bg-(--color-good)/10 px-4 py-3.5">
              <CheckCircle2 size={20} className="shrink-0 text-(--color-good)" />
              <div>
                <p className="text-sm font-medium text-(--color-good)">All corrections applied</p>
                <p className="text-xs text-(--color-text-faint)">Your text looks great.</p>
              </div>
            </div>
          )}

          {!checking && hasChecked && corrections.length === 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-(--color-good)/30 bg-(--color-good)/10 px-4 py-3.5">
              <CheckCircle2 size={20} className="shrink-0 text-(--color-good)" />
              <div>
                <p className="text-sm font-medium text-(--color-good)">Looks good!</p>
                <p className="text-xs text-(--color-text-faint)">No grammar or spelling issues found.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {hasChecked && corrections.length > 0 && (
        <div className="mt-4 space-y-2">
          {remaining.length > 0 && onApplyAll && (
            <button
              onClick={onApplyAll}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-accent) py-2.5 text-sm font-semibold text-(--color-accent-ink) hover:brightness-105"
            >
              <CheckCheck size={16} />
              Accept All Corrections ({remaining.length})
            </button>
          )}

          <button
            onClick={handleCopyAll}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface-2) py-2.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-3)"
          >
            <Copy size={15} />
            {copied ? 'Copied!' : 'Copy All Corrections'}
          </button>
        </div>
      )}
    </aside>
  )
}
