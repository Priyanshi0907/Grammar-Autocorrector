import { GoogleGenerativeAI } from '@google/generative-ai'
import { nanoid } from 'nanoid'

let genAI = null

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

async function generateWithFallback(prompt, options = {}) {
  const ai = getGenAI()
  if (!ai) return null

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: options.generationConfig || {},
      })
      const response = await model.generateContent(prompt)
      return response.response.text()
    } catch (err) {
      if (err.message && (err.message.includes('429') || err.message.includes('404') || err.message.includes('Quota'))) {
        continue // try next candidate model
      }
      throw err
    }
  }
  return null
}

const COMMON_MISSPELLINGS_SET = new Set([
  'recieve', 'definately', 'occured', 'seperate', 'untill', 'tommorrow', 'becuase',
  'wich', 'thier', 'freind', 'goverment', 'enviroment', 'existance', 'arguement',
  'calender', 'embarass', 'acheive', 'beleive', 'concious', 'definitly', 'dissapear',
  'faciliate', 'neccessary', 'occassion', 'priviledge', 'publically', 'reccommend',
  'wierd', 'accomodate', 'adress', 'alot', 'apparant', 'collegue', 'comming',
  'comitted', 'concensus', 'decieve', 'dependant', 'diffrent', 'excelent', 'familar',
  'finaly', 'foriegn', 'fourty', 'gratefull', 'hight', 'immediatly', 'independant',
  'intrest', 'knowlege', 'libary', 'maintainance', 'managable', 'mispell', 'noticable',
  'ocasion', 'parliment', 'posession', 'prefered', 'profesional', 'promiss',
  'pronounciation', 'publicaly', 'questionaire', 'recomend', 'rythm', 'succesful',
  'suprise', 'tommorow', 'truely', 'unfortunatly', 'vaccum', 'writting', 'youre'
])

function isLikelyProperNounOrName(word) {
  if (!word || word.length < 2) return false
  const first = word[0]
  if (first !== first.toUpperCase() || first === first.toLowerCase()) return false
  const lower = word.toLowerCase()
  if (COMMON_MISSPELLINGS_SET.has(lower)) return false
  return true
}

/**
 * Perform high-intelligence grammar check using Gemini AI.
 */
export async function checkGrammarWithGemini(text, { language = 'English (US)' } = {}) {
  const prompt = `You are a world-class professional writing coach and grammar correction AI.
Analyze the following text carefully for:
1. Grammatical errors, verb tense inconsistencies (e.g., "I am writing yesterday" -> "was writing" or "wrote"), subject-verb agreement mistakes, auxiliary verb errors.
2. Spelling mistakes and typographical errors (DO NOT flag or correct personal names, surnames, or proper nouns).
3. Punctuation errors (e.g., comma splices, misplaced commas, missing periods).
4. Awkward or unnatural phrasing and word choices that need improvement.

Language: ${language}

Input text:
"""
${text}
"""

Return a JSON array of issues found:
[
  {
    "original": "exact substring from input text that needs correction",
    "suggestion": "the proposed replacement text",
    "explanation": "clear, educational explanation of why this was corrected",
    "type": "grammar" | "spelling" | "style" | "punctuation"
  }
]

CRITICAL RULES:
1. "original" MUST be an exact substring present in the input text.
2. NEVER correct, alter, or flag personal names, surnames, proper nouns, cultural names (e.g., Priyanshi, Choudhary, Bharti, Rahul, Tanaka, etc.), brand names, or location names as spelling mistakes. Preserve all names as written.
3. If there are no issues, return [].
4. Output only the JSON array without backticks or markdown preamble.`

  try {
    const rawText = await generateWithFallback(prompt, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    })
    if (!rawText) return null

    const parsed = JSON.parse(rawText)
    if (!Array.isArray(parsed)) return null

    const corrections = []
    let searchCursor = 0

    for (const item of parsed) {
      if (!item.original || item.suggestion === undefined) continue
      const target = item.original

      // Do not correct proper nouns/names for spelling
      if (item.type === 'spelling' && isLikelyProperNounOrName(target)) {
        continue
      }

      let offset = text.indexOf(target, searchCursor)
      if (offset === -1) {
        offset = text.indexOf(target)
      }
      if (offset === -1) continue

      searchCursor = offset + target.length
      corrections.push({
        id: nanoid(8),
        type: ['grammar', 'spelling', 'style', 'punctuation'].includes(item.type) ? item.type : 'grammar',
        original: target,
        suggestion: item.suggestion,
        explanation: item.explanation || 'Grammar and phrasing improvement',
        offset,
        length: target.length,
        confidence: 0.98,
      })
    }

    return corrections
  } catch (err) {
    console.warn('Gemini grammar check failed:', err.message)
    return null
  }
}

/**
 * Paraphrase text using Gemini AI with target tone/mode.
 */
export async function paraphraseWithGemini(text, mode = 'Professional') {
  const prompt = `Rewrite the following text in a "${mode}" tone/style while completely preserving its original meaning and all personal names.
Mode definitions:
- Simple: Easy to understand, plain everyday words.
- Professional: Clear, polished, polite business communication.
- Formal: Academic, elegant, no colloquialisms or contractions.
- Concise: Direct, removes fluff and filler words.
- Natural: Smooth, conversational, fluent flow.

Return ONLY the rewritten text without explanations or quotation marks.

Original text:
${text}`

  try {
    const textOut = await generateWithFallback(prompt, {
      generationConfig: { temperature: 0.3 },
    })
    return textOut ? textOut.trim() : null
  } catch (err) {
    console.warn('Gemini paraphrase failed:', err.message)
    return null
  }
}

/**
 * Style analysis with Gemini AI.
 */
export async function analyzeStyleWithGemini(text) {
  const prompt = `Analyze the writing style of the following text across 8 key writing metrics.
Text:
"""
${text}
"""

Return a JSON object with this exact structure:
{
  "score": number (0 to 100 overall writing quality score),
  "metrics": {
    "clarity": { "value": number (0-100), "note": "brief observation" },
    "sentenceLength": { "value": number (0-100), "note": "brief observation" },
    "repeatedWords": { "value": number (0-100), "note": "brief observation" },
    "passiveVoice": { "value": number (0-100), "note": "brief observation" },
    "tone": { "value": number (0-100), "note": "brief observation" },
    "formality": { "value": number (0-100), "note": "brief observation" },
    "readability": { "value": number (0-100), "note": "brief observation" },
    "wordChoice": { "value": number (0-100), "note": "brief observation" }
  }
}`

  try {
    const rawText = await generateWithFallback(prompt, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    })
    return rawText ? JSON.parse(rawText) : null
  } catch (err) {
    console.warn('Gemini style analysis failed:', err.message)
    return null
  }
}
