import { ShieldCheck, Leaf } from 'lucide-react'

export default function TrustBar({ className = '' }) {
  return (
    <div className={`mx-auto max-w-2xl px-2 ${className || 'mt-3 mb-1'}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-full border border-(--color-border) bg-(--color-surface)/80 px-4 py-1.5 text-xs text-(--color-text-muted) backdrop-blur">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-(--color-accent)" />
          Private by design
        </div>
        <span className="hidden h-3 w-px bg-(--color-border) sm:block" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-(--color-accent)" />
          Secure processing
        </div>
        <span className="hidden h-3 w-px bg-(--color-border) sm:block" />
        <div className="flex items-center gap-1.5">
          <Leaf size={13} className="text-(--color-accent)" />
          Built for clarity
        </div>
      </div>
    </div>
  )
}
