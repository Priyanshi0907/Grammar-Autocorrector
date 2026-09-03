import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormField({ label, icon: Icon, type = 'text', value, onChange, placeholder, hint, right }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm text-(--color-text-muted)">{label}</label>
        {right}
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface-2) px-4 py-3 focus-within:border-(--color-accent)/60">
        {Icon && <Icon size={16} className="shrink-0 text-(--color-text-faint)" />}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-(--color-text) placeholder:text-(--color-text-faint) outline-none"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} className="shrink-0 text-(--color-text-faint)">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-(--color-text-faint)">{hint}</p>}
    </div>
  )
}
