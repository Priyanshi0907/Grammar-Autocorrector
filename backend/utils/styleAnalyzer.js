import { splitSentences, words, fleschReadingEase, STOPWORDS } from './textStats.js'

const WEAK_WORDS = new Set(['very', 'really', 'just', 'basically', 'actually', 'thing', 'stuff', 'nice', 'good', 'bad', 'get', 'got', 'kind of', 'sort of', 'literally', 'honestly'])
const CONTRACTIONS_RE = /\b(don't|can't|won't|isn't|aren't|wasn't|weren't|didn't|doesn't|haven't|hasn't|hadn't|i'm|you're|we're|they're|it's|i've|we've|they've|i'll|we'll|they'll|gonna|wanna|kinda|gotta)\b/gi
const PASSIVE_RE = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi
const POSITIVE_WORDS = new Set(['great', 'good', 'excellent', 'happy', 'love', 'best', 'wonderful', 'positive', 'success', 'improve'])
const NEGATIVE_WORDS = new Set(['bad', 'terrible', 'hate', 'worst', 'sad', 'negative', 'fail', 'problem', 'difficult', 'hard'])

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function sentenceLengthScore(text) {
  const sentences = splitSentences(text)
  if (sentences.length === 0) return { value: 100, note: 'No sentences detected yet.' }
  const lengths = sentences.map((s) => words(s).length)
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  // Ideal average sentence length ~ 14-20 words.
  const distance = Math.max(0, Math.abs(avg - 17) - 3)
  const score = clamp(100 - distance * 4)
  return { value: score, note: `Average sentence length is ${avg.toFixed(1)} words.` }
}

function repeatedWordsScore(text) {
  const w = words(text).map((x) => x.toLowerCase())
  const counts = {}
  for (const word of w) {
    if (STOPWORDS.has(word) || word.length < 4) continue
    counts[word] = (counts[word] || 0) + 1
  }
  const total = w.length || 1
  const repeats = Object.values(counts).filter((c) => c > 2)
  const repeatRatio = repeats.reduce((a, b) => a + b, 0) / total
  const score = clamp(100 - repeatRatio * 220)
  const worst = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const note = worst && worst[1] > 2 ? `'${worst[0]}' appears ${worst[1]} times.` : 'No heavily repeated words found.'
  return { value: score, note }
}

function passiveVoiceScore(text) {
  const sentences = splitSentences(text)
  if (sentences.length === 0) return { value: 100, note: 'No sentences detected yet.' }
  const passiveCount = sentences.filter((s) => PASSIVE_RE.test(s)).length
  PASSIVE_RE.lastIndex = 0
  const ratio = passiveCount / sentences.length
  const score = clamp(100 - ratio * 100)
  return { value: score, note: `${passiveCount} of ${sentences.length} sentences use passive voice.` }
}

function formalityScore(text, contractionMatches) {
  const w = words(text).length || 1
  const ratio = contractionMatches / w
  const score = clamp(100 - ratio * 400)
  return { value: score, note: contractionMatches ? `${contractionMatches} contraction(s) found.` : 'No contractions found.' }
}

function toneScore(text) {
  const w = words(text).map((x) => x.toLowerCase())
  let pos = 0
  let neg = 0
  for (const word of w) {
    if (POSITIVE_WORDS.has(word)) pos++
    if (NEGATIVE_WORDS.has(word)) neg++
  }
  const total = pos + neg
  if (total === 0) return { value: 75, note: 'Neutral tone — no strongly positive or negative language.' }
  const balance = Math.abs(pos - neg) / total
  const score = clamp(100 - balance * 40)
  const lean = pos > neg ? 'positive' : neg > pos ? 'negative' : 'balanced'
  return { value: score, note: `Tone leans ${lean}.` }
}

function wordChoiceScore(text) {
  const w = words(text).map((x) => x.toLowerCase())
  const weakCount = w.filter((word) => WEAK_WORDS.has(word)).length
  const total = w.length || 1
  const ratio = weakCount / total
  const score = clamp(100 - ratio * 500)
  return { value: score, note: weakCount ? `${weakCount} vague or filler word(s) found.` : 'Word choice looks precise.' }
}

function readabilityScore(text) {
  const flesch = fleschReadingEase(text)
  return { value: clamp(flesch), note: `Flesch reading ease score: ${flesch}/100.` }
}

export function analyzeStyle(text) {
  const contractionMatches = (text.match(CONTRACTIONS_RE) || []).length

  const metrics = {
    clarity: null, // computed below from other metrics
    sentenceLength: sentenceLengthScore(text),
    repeatedWords: repeatedWordsScore(text),
    passiveVoice: passiveVoiceScore(text),
    tone: toneScore(text),
    formality: formalityScore(text, contractionMatches),
    readability: readabilityScore(text),
    wordChoice: wordChoiceScore(text),
  }

  const clarityValue = clamp(
    (metrics.sentenceLength.value + metrics.passiveVoice.value + metrics.wordChoice.value + metrics.readability.value) / 4,
  )
  metrics.clarity = { value: clarityValue, note: 'A composite of sentence length, passive voice and word choice.' }

  const weights = {
    clarity: 0.25,
    sentenceLength: 0.1,
    repeatedWords: 0.1,
    passiveVoice: 0.15,
    tone: 0.05,
    formality: 0.05,
    readability: 0.2,
    wordChoice: 0.1,
  }

  const score = clamp(
    Object.entries(weights).reduce((sum, [key, weight]) => sum + metrics[key].value * weight, 0),
  )

  return { score, metrics }
}
