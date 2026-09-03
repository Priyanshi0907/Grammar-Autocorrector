// A small synonym bank tagged by register. `neutral` is always a safe choice;
// each mode prefers a different register when one is available.
const THESAURUS = {
  difficult: { neutral: 'difficult', simple: 'hard', professional: 'demanding', formal: 'challenging', concise: 'hard', natural: 'tough' },
  hard: { neutral: 'hard', simple: 'hard', professional: 'demanding', formal: 'challenging', concise: 'hard', natural: 'tough' },
  easy: { neutral: 'easy', simple: 'easy', professional: 'straightforward', formal: 'uncomplicated', concise: 'easy', natural: 'simple' },
  big: { neutral: 'large', simple: 'big', professional: 'substantial', formal: 'considerable', concise: 'large', natural: 'big' },
  small: { neutral: 'small', simple: 'small', professional: 'minor', formal: 'modest', concise: 'small', natural: 'little' },
  good: { neutral: 'good', simple: 'good', professional: 'effective', formal: 'favorable', concise: 'good', natural: 'solid' },
  bad: { neutral: 'poor', simple: 'bad', professional: 'suboptimal', formal: 'unfavorable', concise: 'weak', natural: 'rough' },
  fast: { neutral: 'quick', simple: 'fast', professional: 'rapid', formal: 'expeditious', concise: 'quick', natural: 'fast' },
  slow: { neutral: 'slow', simple: 'slow', professional: 'gradual', formal: 'unhurried', concise: 'slow', natural: 'slow' },
  important: { neutral: 'important', simple: 'key', professional: 'critical', formal: 'significant', concise: 'key', natural: 'important' },
  help: { neutral: 'help', simple: 'help', professional: 'assist', formal: 'facilitate', concise: 'help', natural: 'help out' },
  show: { neutral: 'show', simple: 'show', professional: 'demonstrate', formal: 'illustrate', concise: 'show', natural: 'show' },
  use: { neutral: 'use', simple: 'use', professional: 'utilize', formal: 'employ', concise: 'use', natural: 'use' },
  get: { neutral: 'get', simple: 'get', professional: 'obtain', formal: 'acquire', concise: 'get', natural: 'get' },
  start: { neutral: 'start', simple: 'start', professional: 'initiate', formal: 'commence', concise: 'start', natural: 'kick off' },
  end: { neutral: 'end', simple: 'end', professional: 'conclude', formal: 'terminate', concise: 'end', natural: 'wrap up' },
  make: { neutral: 'make', simple: 'make', professional: 'produce', formal: 'generate', concise: 'make', natural: 'make' },
  think: { neutral: 'think', simple: 'think', professional: 'believe', formal: 'consider', concise: 'think', natural: 'figure' },
  'a lot of': { neutral: 'many', simple: 'lots of', professional: 'a significant amount of', formal: 'a considerable amount of', concise: 'many', natural: 'a bunch of' },
  very: { neutral: 'quite', simple: 'really', professional: 'notably', formal: 'exceptionally', concise: '', natural: 'pretty' },
  really: { neutral: 'quite', simple: 'really', professional: 'genuinely', formal: 'truly', concise: '', natural: 'really' },
  problem: { neutral: 'issue', simple: 'problem', professional: 'challenge', formal: 'issue', concise: 'issue', natural: 'problem' },
  fix: { neutral: 'fix', simple: 'fix', professional: 'resolve', formal: 'rectify', concise: 'fix', natural: 'fix' },
  buy: { neutral: 'buy', simple: 'buy', professional: 'purchase', formal: 'procure', concise: 'buy', natural: 'buy' },
  complete: { neutral: 'complete', simple: 'finish', professional: 'complete', formal: 'accomplish', concise: 'finish', natural: 'wrap up' },
  finish: { neutral: 'finish', simple: 'finish', professional: 'complete', formal: 'conclude', concise: 'finish', natural: 'wrap up' },
  said: { neutral: 'said', simple: 'said', professional: 'stated', formal: 'stated', concise: 'said', natural: 'said' },
  happy: { neutral: 'happy', simple: 'happy', professional: 'pleased', formal: 'delighted', concise: 'happy', natural: 'glad' },
  sad: { neutral: 'sad', simple: 'sad', professional: 'disappointed', formal: 'regretful', concise: 'sad', natural: 'down' },
  soon: { neutral: 'soon', simple: 'soon', professional: 'shortly', formal: 'in due course', concise: 'soon', natural: 'soon' },
  because: { neutral: 'because', simple: 'because', professional: 'since', formal: 'given that', concise: 'since', natural: 'because' },
}

// Sentence-level templates matched before word-level substitution.
const TEMPLATES = [
  {
    // "The X was very Y to Z." -> "Z-ing the X was quite Y."
    re: /\bthe ([a-z][a-z\s]*?) was (?:very|really) (\w+) to (\w+)\b/i,
    build: (m, mode) => {
      const [, subject, adj, verb] = m
      const ing = toGerund(verb)
      const synAdj = synonym(adj, mode)
      const intensifier = mode === 'formal' ? 'quite' : mode === 'concise' ? '' : 'quite'
      return `${capitalize(ing)} the ${subject} was ${intensifier ? intensifier + ' ' : ''}${synAdj}`.trim()
    },
  },
  {
    re: /\bin order to\b/gi,
    build: () => 'to',
  },
  {
    re: /\bdue to the fact that\b/gi,
    build: () => 'because',
  },
  {
    re: /\bat this point in time\b/gi,
    build: () => 'now',
  },
  {
    re: /\bit is important to note that\b/gi,
    build: () => 'notably,',
  },
]

function toGerund(verb) {
  const v = verb.toLowerCase()
  if (v.endsWith('e') && v !== 'be') return v.slice(0, -1) + 'ing'
  return v + 'ing'
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function synonym(word, mode) {
  const entry = THESAURUS[word.toLowerCase()]
  if (!entry) return word
  const key = mode.toLowerCase()
  return entry[key] ?? entry.neutral ?? word
}

function applyTemplates(text, mode) {
  let result = text
  for (const tpl of TEMPLATES) {
    if (tpl.re.global) {
      result = result.replace(tpl.re, () => tpl.build([], mode.toLowerCase()))
    } else {
      const m = result.match(tpl.re)
      if (m) {
        const replacement = tpl.build(m, mode.toLowerCase())
        result = result.slice(0, m.index) + replacement + result.slice(m.index + m[0].length)
      }
    }
  }
  return result
}

function substituteWords(text, mode) {
  const key = mode.toLowerCase()
  // Multi-word phrases first.
  let result = text.replace(/\ba lot of\b/gi, () => synonym('a lot of', key))

  result = result.replace(/\b([A-Za-z']+)\b/g, (word) => {
    const lower = word.toLowerCase()
    const entry = THESAURUS[lower]
    if (!entry) return word
    let replacement = entry[key] ?? entry.neutral
    if (replacement === '') return '' // concise mode drops filler words
    if (word[0] === word[0].toUpperCase()) replacement = capitalize(replacement)
    return replacement
  })

  return result.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1')
}

function applyConciseTrims(text) {
  return text
    .replace(/\bthat\s+(is|are|was|were)\b/gi, '$1')
    .replace(/\bjust\b/gi, '')
    .replace(/\bbasically\b/gi, '')
    .replace(/\bactually\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function applyNaturalContractions(text) {
  return text
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bthey are\b/gi, "they're")
    .replace(/\bwe are\b/gi, "we're")
}

export function paraphrase(text, mode = 'Natural') {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]

  const out = sentences.map((sentence) => {
    let s = applyTemplates(sentence, mode)
    s = substituteWords(s, mode)

    if (mode === 'Concise') s = applyConciseTrims(s)
    if (mode === 'Natural') s = applyNaturalContractions(s)

    // Make sure the sentence still ends with terminal punctuation and starts
    // with a capital letter.
    s = s.trim()
    if (s && !/[.!?]$/.test(s)) s += '.'
    if (s) s = s.charAt(0).toUpperCase() + s.slice(1)
    return s
  })

  return out.join(' ').replace(/\s{2,}/g, ' ').trim()
}
