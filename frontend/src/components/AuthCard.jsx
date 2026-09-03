import { Feather } from 'lucide-react'

export default function AuthCard({ heading, subheading, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-(--color-border) bg-(--color-surface) p-10">
        <div className="flex flex-col items-center text-center">
          <Feather size={30} className="text-(--color-accent)" strokeWidth={1.5} />
          <h1 className="font-serif mt-3 text-2xl font-semibold tracking-wide">WRITELY</h1>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.2em] text-(--color-accent)">
            Grammar Autocorrector
          </p>

          <h2 className="font-serif mt-8 text-2xl font-semibold">{heading}</h2>
          <p className="mt-1.5 text-sm text-(--color-text-muted)">{subheading}</p>
        </div>

        <div className="mt-8 space-y-5">{children}</div>

        {footer && <div className="mt-7 border-t border-(--color-border-soft) pt-5 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}
