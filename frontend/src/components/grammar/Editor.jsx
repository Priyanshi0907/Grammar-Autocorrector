import { useMemo, useRef, useState } from 'react'
import { ChevronDown, Upload, Sparkles, Loader2, Copy, Check, Download } from 'lucide-react'
import { api } from '../../lib/api'

const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German']

const TYPE_UNDERLINE = {
  grammar: 'underline-grammar',
  spelling: 'underline-spelling',
  style: 'underline-style',
  punctuation: 'underline-punctuation',
}

export default function Editor({
  text,
  onTextChange,
  language,
  setLanguage,
  corrections,
  activeId,
  onFocusCorrection,
  onCheck,
  onClear,
  checking,
  hasChecked,
}) {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)

  const wordCount = useMemo(
    () => (text.trim().length ? text.trim().split(/\s+/).length : 0),
    [text],
  )

  const segments = useMemo(() => {
    if (!hasChecked || corrections.length === 0) return null
    const sorted = [...corrections].sort((a, b) => a.offset - b.offset)
    const parts = []
    let cursor = 0
    sorted.forEach((c) => {
      if (c.offset < cursor) return
      if (c.offset > cursor) parts.push({ text: text.slice(cursor, c.offset), plain: true })
      parts.push({
        text: text.slice(c.offset, c.offset + c.length),
        plain: false,
        id: c.id,
        type: c.type,
      })
      cursor = c.offset + c.length
    })
    if (cursor < text.length) parts.push({ text: text.slice(cursor), plain: true })
    return parts
  }, [text, corrections, hasChecked])

  const processFile = async (file) => {
    if (!file) return
    setIsUploading(true)
    setUploadError('')

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['txt', 'md', 'json', 'csv', 'rtf'].includes(ext) || file.type.startsWith('text/')) {
        const content = await file.text()
        if (!content.trim()) throw new Error('Uploaded text file is empty.')
        onTextChange(content)
      } else {
        const result = await api.uploadDocument(file)
        if (!result.text?.trim()) throw new Error('No readable text could be extracted from this file.')
        onTextChange(result.text)
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to read document.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleCopyText = async () => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  const handleExportText = () => {
    if (!text.trim()) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'writely-final-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex h-full flex-col rounded-3xl border transition-colors bg-(--color-surface) p-5 ${
        isDragging ? 'border-(--color-accent) bg-(--color-surface-2)' : 'border-(--color-border)'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none rounded-full border border-(--color-border) bg-(--color-surface-2) py-2 pl-4 pr-9 text-sm text-(--color-text) outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-faint)" />
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-(--color-text-faint)">
          <span>{wordCount} words</span>

          {text.trim() && (
            <div className="flex items-center gap-1.5 border-l border-(--color-border) pl-3">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface-2) px-2.5 py-1 text-xs font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface-3) hover:text-(--color-text)"
                title="Copy final text"
              >
                {copied ? <Check size={13} className="text-(--color-good)" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleExportText}
                className="flex items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface-2) px-2.5 py-1 text-xs font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface-3) hover:text-(--color-text)"
                title="Export as text file"
              >
                <Download size={13} />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-3 rounded-xl border border-(--color-grammar)/40 bg-(--color-grammar)/10 px-3.5 py-2 text-xs text-(--color-grammar)">
          {uploadError}
        </div>
      )}

      <div className="relative mt-3 flex-1 min-h-0 overflow-hidden rounded-2xl">
        {isUploading ? (
          <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 text-(--color-text-muted)">
            <Loader2 className="animate-spin text-(--color-accent)" size={32} />
            <p className="text-sm font-medium">Extracting text from document…</p>
            <p className="text-xs text-(--color-text-faint)">Supports PDF, DOCX, DOC, TXT, RTF, and Markdown</p>
          </div>
        ) : segments ? (
          <div className="font-editor h-full min-h-0 overflow-y-auto whitespace-pre-wrap break-words px-1 py-1 text-[1.05rem] leading-8 text-(--color-text)">
            {segments.map((seg, i) =>
              seg.plain ? (
                <span key={i}>{seg.text}</span>
              ) : (
                <span
                  key={i}
                  onClick={() => onFocusCorrection(seg.id)}
                  className={`cursor-pointer ${TYPE_UNDERLINE[seg.type]} ${
                    activeId === seg.id ? 'bg-(--color-surface-3) rounded px-0.5' : ''
                  }`}
                >
                  {seg.text}
                </span>
              ),
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Start writing, paste text, or upload a PDF / Word document to check for grammar, spelling and style issues…"
            className="font-editor h-full min-h-0 w-full resize-none bg-transparent px-1 py-1 text-[1.05rem] leading-8 text-(--color-text) placeholder:text-(--color-text-faint) outline-none"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface-2) px-4 py-2.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-3) disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Upload Document (.pdf, .docx, .txt)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
            className="hidden"
            onChange={handleFileChange}
          />
          <button onClick={onClear} className="text-sm font-medium text-(--color-text-muted) hover:text-(--color-text)">
            Clear
          </button>
        </div>

        <button
          onClick={onCheck}
          disabled={checking || !text.trim() || isUploading}
          className="flex items-center gap-2 rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {checking ? 'Checking…' : 'Check Grammar'}
        </button>
      </div>
    </section>
  )
}
