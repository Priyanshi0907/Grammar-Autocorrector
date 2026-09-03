import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const TYPE_STYLES = {
  grammar: { bg: 'bg-(--color-grammar)', label: 'Grammar' },
  spelling: { bg: 'bg-(--color-spelling)', label: 'Spelling' },
  style: { bg: 'bg-(--color-style)', label: 'Style' },
  punctuation: { bg: 'bg-(--color-punctuation)', label: 'Punctuation' },
}

export default function CorrectionItem({ correction, index, onApply, applied, active, onFocus }) {
  const [open, setOpen] = useState(false)
  const style = TYPE_STYLES[correction.type] || TYPE_STYLES.grammar

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        active ? 'border-(--color-accent)/60 bg-(--color-surface-3)' : 'border-(--color-border) bg-(--color-surface-2)'
      }`}
    >
      <button
        onClick={() => {
          setOpen((o) => !o)
          onFocus?.()
        }}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-(--color-ink) ${style.bg}`}
        >
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-1.5 text-sm">
            <span className={`line-through decoration-2 ${applied ? 'text-(--color-text-faint)' : 'text-(--color-grammar)'}`}>
              {correction.original}
            </span>
            <span className="text-(--color-text-faint)">&rarr;</span>
            <span className={applied ? 'text-(--color-good) font-medium' : 'font-medium text-(--color-good)'}>
              {correction.suggestion}
            </span>
          </span>
          {!open && (
            <span className="mt-1 block truncate text-xs text-(--color-text-faint)">{correction.explanation}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`mt-1 shrink-0 text-(--color-text-faint) transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-(--color-border) px-4 py-3.5">
          <p className="text-sm leading-relaxed text-(--color-text-muted)">{correction.explanation}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-text-faint)">
            <span className="rounded-full border border-(--color-border) px-2.5 py-1">{style.label}</span>
            <span className="rounded-full border border-(--color-border) px-2.5 py-1">
              Confidence {Math.round((correction.confidence ?? 0.85) * 100)}%
            </span>
          </div>
          <button
            onClick={() => onApply(correction)}
            disabled={applied}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              applied
                ? 'cursor-default bg-(--color-surface-3) text-(--color-text-faint)'
                : 'bg-(--color-accent) text-(--color-accent-ink) hover:brightness-105'
            }`}
          >
            {applied ? (
              <>
                <Check size={13} /> Applied
              </>
            ) : (
              'Apply correction'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
