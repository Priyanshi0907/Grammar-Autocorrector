export function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]*/g) || [text])
    .map((s) => s.trim())
    .filter(Boolean)
}

export function words(text) {
  return (text.match(/[A-Za-z']+/g) || [])
}

export function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  let stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  const matches = stripped.match(/[aeiouy]{1,2}/g)
  return matches ? Math.max(1, matches.length) : 1
}

export function fleschReadingEase(text) {
  const sentences = splitSentences(text)
  const w = words(text)
  if (sentences.length === 0 || w.length === 0) return 100
  const syllables = w.reduce((sum, word) => sum + countSyllables(word), 0)
  const score =
    206.835 - 1.015 * (w.length / sentences.length) - 84.6 * (syllables / w.length)
  return Math.max(0, Math.min(100, Math.round(score)))
}

export const STOPWORDS = new Set(
  'a an the and or but if then than so because of to in on at for with without by from as is are was were be been being this that these those it its it\'s i you he she we they my your his her our their'.split(
    ' ',
  ),
)
