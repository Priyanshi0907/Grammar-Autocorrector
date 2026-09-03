import { nanoid } from 'nanoid'
import { checkGrammarWithGemini } from './geminiAI.js'

// ---------------------------------------------------------------------------
// Language mapping for LanguageTool API
// ---------------------------------------------------------------------------
const LANGUAGE_CODES = {
  'English (US)': 'en-US',
  'English (UK)': 'en-GB',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de-DE',
}

// ---------------------------------------------------------------------------
// Dictionaries & Irregular Verbs
// ---------------------------------------------------------------------------

const IRREGULAR_PAST_FORMS = {
  write: 'wrote', go: 'went', eat: 'ate', see: 'saw', buy: 'bought', run: 'ran',
  take: 'took', make: 'made', give: 'gave', come: 'came', say: 'said', think: 'thought',
  know: 'knew', get: 'got', find: 'found', leave: 'left', tell: 'told', feel: 'felt',
  break: 'broke', meet: 'met', sing: 'sang', swim: 'swam', drive: 'drove', ride: 'rode',
  drink: 'drank', fall: 'fell', fly: 'flew', grow: 'grew', hear: 'heard', keep: 'kept',
  let: 'let', lose: 'lost', pay: 'paid', read: 'read', send: 'sent', sit: 'sat',
  sleep: 'slept', speak: 'spoke', spend: 'spent', stand: 'stood', teach: 'taught',
  wear: 'wore', win: 'won', wake: 'woke', choose: 'chose', bring: 'brought', build: 'built',
  catch: 'caught', hide: 'hid', hold: 'held', ring: 'rang', shake: 'shook', shoot: 'shot',
  begin: 'began', blow: 'blew', draw: 'drew', freeze: 'froze', rise: 'rose', steal: 'stole',
  throw: 'threw', understand: 'understood', become: 'became', forget: 'forgot',
}

const IRREGULAR_FIXES = {
  buyed: 'bought', goed: 'went', eated: 'ate', drinked: 'drank', thinked: 'thought',
  catched: 'caught', teached: 'taught', bringed: 'brought', feeled: 'felt', telled: 'told',
  sended: 'sent', spended: 'spent', breaked: 'broke', choosed: 'chose', doed: 'did',
  seed: 'saw', runned: 'ran', swimmed: 'swam', singed: 'sang', writed: 'wrote',
  ringed: 'rang', flyed: 'flew', growed: 'grew', knowed: 'knew', throwed: 'threw',
  blowed: 'blew', drawed: 'drew', weared: 'wore', teared: 'tore', stealed: 'stole',
  speaked: 'spoke', wakeed: 'woke', hided: 'hid', slided: 'slid', rided: 'rode',
  bited: 'bit', hitted: 'hit', cutted: 'cut', putted: 'put', letted: 'let',
  setted: 'set', hurted: 'hurt', costed: 'cost', standed: 'stood', understanded: 'understood',
  buyied: 'bought', maked: 'made', taked: 'took', gived: 'gave', comed: 'came',
  falled: 'fell', findedout: 'found out', losed: 'lost', meaned: 'meant', payed: 'paid',
  reaked: 'wrecked', sleeped: 'slept', builded: 'built', keeped: 'kept', leaved: 'left',
  sayed: 'said', selled: 'sold', shooted: 'shot', winned: 'won', gooder: 'better',
  badder: 'worse',
}

const AUX_MISUSE_VERBS = {
  went: 'gone', ate: 'eaten', drank: 'drunk', did: 'done', saw: 'seen', ran: 'run',
  swam: 'swum', sang: 'sung', wrote: 'written', rang: 'rung', flew: 'flown',
  grew: 'grown', knew: 'known', threw: 'thrown', blew: 'blown', drew: 'drawn',
  wore: 'worn', tore: 'torn', stole: 'stolen', spoke: 'spoken', woke: 'woken',
  hid: 'hidden', rode: 'ridden', bit: 'bitten', took: 'taken', gave: 'given',
  came: 'come', fell: 'fallen', broke: 'broken', chose: 'chosen', began: 'begun',
}

const COMMON_MISSPELLINGS = {
  recieve: 'receive', definately: 'definitely', occured: 'occurred', seperate: 'separate',
  untill: 'until', tommorrow: 'tomorrow', becuase: 'because', wich: 'which',
  thier: 'their', freind: 'friend', goverment: 'government', enviroment: 'environment',
  existance: 'existence', arguement: 'argument', calender: 'calendar', embarass: 'embarrass',
  acheive: 'achieve', beleive: 'believe', concious: 'conscious', definitly: 'definitely',
  dissapear: 'disappear', faciliate: 'facilitate', neccessary: 'necessary',
  occassion: 'occasion', priviledge: 'privilege', publically: 'publicly',
  reccommend: 'recommend', wierd: 'weird', accomodate: 'accommodate', adress: 'address',
  alot: 'a lot', apparant: 'apparent', collegue: 'colleague',
  comming: 'coming', comitted: 'committed', concensus: 'consensus', decieve: 'deceive',
  dependant: 'dependent', diffrent: 'different', excelent: 'excellent',
  familar: 'familiar', finaly: 'finally', foriegn: 'foreign', fourty: 'forty',
  gratefull: 'grateful', hight: 'height', immediatly: 'immediately', independant: 'independent',
  intrest: 'interest', knowlege: 'knowledge', libary: 'library', maintainance: 'maintenance',
  managable: 'manageable', mispell: 'misspell', noticable: 'noticeable', ocasion: 'occasion',
  parliment: 'parliament', posession: 'possession', prefered: 'preferred', profesional: 'professional',
  promiss: 'promise', pronounciation: 'pronunciation', publicaly: 'publicly', questionaire: 'questionnaire',
  recomend: 'recommend', rythm: 'rhythm', succesful: 'successful', suprise: 'surprise',
  tommorow: 'tomorrow', truely: 'truly', unfortunatly: 'unfortunately',
  vaccum: 'vacuum', writting: 'writing', youre: "you're",
}

const HOMOPHONE_RULES = [
  { wrong: /\btheir\b(?=\s+(is|are|was|were)\b)/i, right: 'there', explanation: "Use 'there' to describe existence or location, not the possessive 'their'." },
  { wrong: /\bthere\b(?=\s+(house|car|dog|cat|book|phone|idea|plan|team|family)\b)/i, right: 'their', explanation: "Use the possessive 'their' before a noun that belongs to someone." },
  { wrong: /\byour\b(?=\s+(going|coming|doing|being|going to|welcome)\b)/i, right: "you're", explanation: "Use 'you're' (you are) before a verb, not the possessive 'your'." },
  { wrong: /\bits\b(?=\s+(a|an|the|been|going|very|not)\b)/i, right: "it's", explanation: "Use 'it's' (it is/has) here, not the possessive 'its'." },
  { wrong: /\bthen\b(?=\s+\w+\s+(is|was|are|were)\b)/i, right: 'than', explanation: "Use 'than' for comparisons, not 'then' (which refers to time or sequence)." },
]

const CONTRACTION_EXPANSIONS = {
  "don't": 'do not', "can't": 'cannot', "won't": 'will not', "isn't": 'is not',
  "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "didn't": 'did not',
  "doesn't": 'does not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
  "i'm": 'I am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
  "it's": 'it is', "i've": 'I have', "we've": 'we have', "they've": 'they have',
  "i'll": 'I will', "we'll": 'we will', "they'll": 'they will', "gonna": 'going to',
  "wanna": 'want to', "kinda": 'kind of', "gotta": 'have to',
}

const PAST_TIME_MARKERS = /\b(yesterday|last\s+(?:night|week|month|year|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|ago|earlier today|in the past)\b/i
const FUTURE_TIME_MARKERS = /\b(tomorrow|next\s+(?:week|month|year|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|soon|in the future)\b/i

function makeCorrection({ type, original, suggestion, explanation, offset, length, confidence = 0.9 }) {
  return {
    id: nanoid(8),
    type,
    original,
    suggestion,
    explanation,
    offset,
    length: length || original.length,
    confidence,
  }
}

function overlaps(a, b) {
  return a.offset < b.offset + b.length && b.offset < a.offset + a.length
}

function addIfClear(list, correction) {
  if (list.some((c) => overlaps(c, correction))) return
  list.push(correction)
}

function mapLanguageToolIssueType(match) {
  const issueType = (match.rule?.issueType || '').toLowerCase()
  const catId = (match.rule?.category?.id || '').toLowerCase()
  const ruleId = (match.rule?.id || '').toLowerCase()

  if (issueType === 'misspelling' || catId === 'typos' || catId === 'spelling') {
    return 'spelling'
  }
  if (
    catId === 'punctuation' ||
    ruleId.includes('comma') ||
    ruleId.includes('quote') ||
    ruleId.includes('hyphen') ||
    ruleId.includes('period') ||
    ruleId.includes('punctuation') ||
    ruleId.includes('whitespace') ||
    ruleId.includes('space')
  ) {
    return 'punctuation'
  }
  if (
    catId === 'style' ||
    catId === 'redundancy' ||
    catId === 'clarity' ||
    issueType === 'style' ||
    ruleId.includes('style') ||
    ruleId.includes('redundancy') ||
    ruleId.includes('wordiness')
  ) {
    return 'style'
  }
  return 'grammar'
}

function isLikelyProperNounOrName(word) {
  if (!word || word.length < 2) return false
  const first = word[0]
  if (first !== first.toUpperCase() || first === first.toLowerCase()) return false
  const lower = word.toLowerCase()
  if (COMMON_MISSPELLINGS[lower]) return false
  return true
}

async function fetchLanguageToolCorrections(text, language = 'English (US)') {
  const langCode = LANGUAGE_CODES[language] || 'en-US'

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const params = new URLSearchParams({
      text,
      language: langCode,
      enabledOnly: 'false',
    })

    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Writely-Autocorrector/1.0',
      },
      body: params,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`LanguageTool responded with status ${response.status}`)
    }

    const data = await response.json()
    const matches = data.matches || []

    const corrections = []
    for (const match of matches) {
      const bestSuggestion = match.replacements?.[0]?.value
      if (bestSuggestion === undefined || bestSuggestion === null) continue

      const original = text.slice(match.offset, match.offset + match.length)
      if (!original) continue

      const type = mapLanguageToolIssueType(match)

      // Never correct proper nouns / personal names for spelling
      if (type === 'spelling' && isLikelyProperNounOrName(original)) {
        continue
      }

      let cleanExplanation = match.message || match.shortMessage || 'Grammar or spelling suggestion'
      cleanExplanation = cleanExplanation.replace(/\.\./g, '.')

      addIfClear(
        corrections,
        makeCorrection({
          type,
          original,
          suggestion: bestSuggestion,
          explanation: cleanExplanation,
          offset: match.offset,
          length: match.length,
          confidence: match.rule?.confidence || 0.95,
        }),
      )
    }

    return corrections
  } finally {
    clearTimeout(timeoutId)
  }
}

function checkTenseConsistency(text, corrections) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
  let currentOffset = 0

  for (const sentence of sentences) {
    if (PAST_TIME_MARKERS.test(sentence)) {
      const progRe = /\b(am|is|are)\s+([a-zA-Z]+ing)\b/gi
      let m
      while ((m = progRe.exec(sentence))) {
        const fullAuxVerb = m[1] + ' ' + m[2]
        const auxLower = m[1].toLowerCase()
        const suggestion = (auxLower === 'am' || auxLower === 'is') ? `was ${m[2]}` : `were ${m[2]}`
        const offset = currentOffset + m.index

        addIfClear(
          corrections,
          makeCorrection({
            type: 'grammar',
            original: fullAuxVerb,
            suggestion,
            explanation: `Use the past continuous '${suggestion}' or past tense with past time markers like 'yesterday'.`,
            offset,
            length: fullAuxVerb.length,
            confidence: 0.95,
          }),
        )
      }

      const willRe = /\b(will|shall)\s+([a-zA-Z]+)\b/gi
      while ((m = willRe.exec(sentence))) {
        const verb = m[2].toLowerCase()
        const pastVerb = IRREGULAR_PAST_FORMS[verb] || (verb.endsWith('e') ? verb + 'd' : verb + 'ed')
        const offset = currentOffset + m.index

        addIfClear(
          corrections,
          makeCorrection({
            type: 'grammar',
            original: m[0],
            suggestion: pastVerb,
            explanation: `Use past tense '${pastVerb}' instead of future modal '${m[1]}' with past time references.`,
            offset,
            length: m[0].length,
            confidence: 0.9,
          }),
        )
      }
    }

    if (FUTURE_TIME_MARKERS.test(sentence)) {
      const pastProgRe = /\b(was|were)\s+([a-zA-Z]+ing)\b/gi
      let m
      while ((m = pastProgRe.exec(sentence))) {
        const fullAuxVerb = m[1] + ' ' + m[2]
        const suggestion = `will be ${m[2]}`
        const offset = currentOffset + m.index
        addIfClear(
          corrections,
          makeCorrection({
            type: 'grammar',
            original: fullAuxVerb,
            suggestion,
            explanation: `Use future form '${suggestion}' with future time references.`,
            offset,
            length: fullAuxVerb.length,
            confidence: 0.9,
          }),
        )
      }
    }

    currentOffset += sentence.length
  }
}

function checkSubjectVerbAgreement(text, corrections) {
  let re = /\b(how|what|why|where|when|who)\s+(is)\s+(you|they|we)\b/gi
  let m
  while ((m = re.exec(text))) {
    const isStart = m.index + m[1].length + 1
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'are',
        explanation: `Use 'are' with '${m[3].toLowerCase()}'.`,
        offset: isStart,
        length: m[2].length,
      }),
    )
  }

  re = /\b(you|they|we)\s+(is)\b/gi
  while ((m = re.exec(text))) {
    const isStart = m.index + m[1].length + 1
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'are',
        explanation: `Use 'are' with the subject '${m[1].toLowerCase()}'.`,
        offset: isStart,
        length: m[2].length,
      }),
    )
  }

  re = /\b(they|we|you)\s+(was)\b/gi
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'were',
        explanation: `Use 'were' with the plural subject '${m[1].toLowerCase()}'.`,
        offset: m.index + m[1].length + 1,
        length: m[2].length,
      }),
    )
  }

  re = /\b(he|she|it|this|that)\s+(were)\b/gi
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'was',
        explanation: `Use 'was' with the singular subject '${m[1].toLowerCase()}'.`,
        offset: m.index + m[1].length + 1,
        length: m[2].length,
      }),
    )
  }

  re = /\b(I)\s+(is|are)\b/g
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'am',
        explanation: `Use 'am' with 'I'.`,
        offset: m.index + m[1].length + 1,
        length: m[2].length,
      }),
    )
  }

  re = /\b(I|you|we|they)\s+(has)\b/gi
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: 'have',
        explanation: `Use 'have' with '${m[1]}'.`,
        offset: m.index + m[1].length + 1,
        length: m[2].length,
      }),
    )
  }

  re = /\b(he|she|it)\s+(don't)\b/gi
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[2],
        suggestion: "doesn't",
        explanation: `Use "doesn't" with singular subject '${m[1].toLowerCase()}'.`,
        offset: m.index + m[1].length + 1,
        length: m[2].length,
      }),
    )
  }
}

function checkAuxIrregularPast(text, corrections) {
  const re = /\b(has|have|had)\s+([a-zA-Z]+)\b/g
  let m
  while ((m = re.exec(text))) {
    const verb = m[2].toLowerCase()
    if (AUX_MISUSE_VERBS[verb]) {
      addIfClear(
        corrections,
        makeCorrection({
          type: 'grammar',
          original: m[2],
          suggestion: AUX_MISUSE_VERBS[verb],
          explanation: `Use the past participle '${AUX_MISUSE_VERBS[verb]}' after '${m[1]}'.`,
          offset: m.index + m[1].length + 1,
          length: m[2].length,
        }),
      )
    }
  }
}

function checkRegularizedIrregulars(text, corrections) {
  const re = /\b([a-zA-Z]+)\b/g
  let m
  while ((m = re.exec(text))) {
    const word = m[1].toLowerCase()
    if (IRREGULAR_FIXES[word]) {
      addIfClear(
        corrections,
        makeCorrection({
          type: 'spelling',
          original: m[1],
          suggestion: IRREGULAR_FIXES[word],
          explanation: `The correct form is '${IRREGULAR_FIXES[word]}'.`,
          offset: m.index,
          length: m[1].length,
        }),
      )
    }
  }
}

function checkMisspellings(text, corrections) {
  const re = /\b([a-zA-Z']+)\b/g
  let m
  while ((m = re.exec(text))) {
    const word = m[1].toLowerCase()
    if (COMMON_MISSPELLINGS[word]) {
      addIfClear(
        corrections,
        makeCorrection({
          type: 'spelling',
          original: m[1],
          suggestion: COMMON_MISSPELLINGS[word],
          explanation: `The correct spelling is '${COMMON_MISSPELLINGS[word]}'.`,
          offset: m.index,
          length: m[1].length,
        }),
      )
    }
  }
}

function checkHomophones(text, corrections) {
  for (const rule of HOMOPHONE_RULES) {
    let m
    const re = new RegExp(rule.wrong.source, rule.wrong.flags.includes('g') ? rule.wrong.flags : rule.wrong.flags + 'g')
    while ((m = re.exec(text))) {
      addIfClear(
        corrections,
        makeCorrection({
          type: 'grammar',
          original: m[0],
          suggestion: rule.right,
          explanation: rule.explanation,
          offset: m.index,
          length: m[0].length,
          confidence: 0.8,
        }),
      )
    }
  }
}

function checkCapitalization(text, corrections) {
  const re = /(^|[.!?]\s+)([a-z])/g
  let m
  while ((m = re.exec(text))) {
    const letterIndex = m.index + m[1].length
    addIfClear(
      corrections,
      makeCorrection({
        type: 'punctuation',
        original: m[2],
        suggestion: m[2].toUpperCase(),
        explanation: 'Capitalize the first letter of a sentence.',
        offset: letterIndex,
        length: 1,
        confidence: 0.85,
      }),
    )
  }
}

function checkDoubleSpaces(text, corrections) {
  const re = / {2,}/g
  let m
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'punctuation',
        original: m[0],
        suggestion: ' ',
        explanation: 'Use a single space between words.',
        offset: m.index,
        length: m[0].length,
        confidence: 0.95,
      }),
    )
  }
}

function checkArticles(text, corrections) {
  let re = /\b(a)\s+(apple|orange|egg|elephant|hour|honest|honor|island|umbrella|idea|option|error|action|example)\b/gi
  let m
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[1],
        suggestion: m[1] === 'A' ? 'An' : 'an',
        explanation: `Use 'an' before vowel sounds ('${m[2]}').`,
        offset: m.index,
        length: m[1].length,
      }),
    )
  }

  re = /\b(an)\s+(university|uniform|unique|user|car|dog|cat|house|person|book)\b/gi
  while ((m = re.exec(text))) {
    addIfClear(
      corrections,
      makeCorrection({
        type: 'grammar',
        original: m[1],
        suggestion: m[1] === 'An' ? 'A' : 'a',
        explanation: `Use 'a' before consonant sounds ('${m[2]}').`,
        offset: m.index,
        length: m[1].length,
      }),
    )
  }
}

function checkInformalInFormalMode(text, corrections, mode) {
  if (mode !== 'Formal') return
  const re = /\b(don't|can't|won't|isn't|aren't|wasn't|weren't|didn't|doesn't|haven't|hasn't|hadn't|i'm|you're|we're|they're|it's|i've|we've|they've|i'll|we'll|they'll|gonna|wanna|kinda|gotta)\b/gi
  let m
  while ((m = re.exec(text))) {
    const key = m[1].toLowerCase()
    const expansion = CONTRACTION_EXPANSIONS[key]
    if (!expansion) continue
    addIfClear(
      corrections,
      makeCorrection({
        type: 'style',
        original: m[1],
        suggestion: expansion,
        explanation: 'Spell out contractions for a formal tone.',
        offset: m.index,
        length: m[1].length,
        confidence: 0.8,
      }),
    )
  }
}

function runAllLocalChecks(text, corrections, mode) {
  checkTenseConsistency(text, corrections)
  checkSubjectVerbAgreement(text, corrections)
  checkAuxIrregularPast(text, corrections)
  checkRegularizedIrregulars(text, corrections)
  checkArticles(text, corrections)
  checkMisspellings(text, corrections)
  checkHomophones(text, corrections)
  checkCapitalization(text, corrections)
  checkDoubleSpaces(text, corrections)
  checkInformalInFormalMode(text, corrections, mode)
}

// ---------------------------------------------------------------------------
// Main Grammar Checking Function (Gemini AI -> LanguageTool -> Local Fallback)
// ---------------------------------------------------------------------------

export async function checkGrammar(text, { language = 'English (US)', mode = 'Standard' } = {}) {
  // 1. Try Gemini AI first for state-of-the-art accuracy
  try {
    const geminiCorrections = await checkGrammarWithGemini(text, { language, mode })
    if (geminiCorrections && geminiCorrections.length > 0) {
      geminiCorrections.sort((a, b) => a.offset - b.offset)
      return geminiCorrections
    }
  } catch (err) {
    console.warn('Gemini check failed, falling back to LanguageTool + Engine:', err.message)
  }

  // 2. LanguageTool + Rule Engine
  let corrections = []
  try {
    corrections = await fetchLanguageToolCorrections(text, language)
  } catch (err) {
    console.warn('LanguageTool API unavailable:', err.message)
  }

  // 3. Augment with local rules
  runAllLocalChecks(text, corrections, mode)

  corrections.sort((a, b) => a.offset - b.offset)
  return corrections
}

export function applyAllCorrections(text, corrections) {
  const sorted = [...corrections].sort((a, b) => b.offset - a.offset)
  let result = text
  for (const c of sorted) {
    if (c.suggestion === undefined || c.suggestion === null) continue
    result = result.slice(0, c.offset) + c.suggestion + result.slice(c.offset + c.length)
  }
  return result
}
