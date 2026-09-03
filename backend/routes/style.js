import { Router } from 'express'
import { analyzeStyle } from '../utils/styleAnalyzer.js'
import { analyzeStyleWithGemini } from '../utils/geminiAI.js'

const router = Router()

router.post('/analyze', async (req, res) => {
  const { text } = req.body || {}

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide some text to analyze.' })
  }

  let result = null
  try {
    result = await analyzeStyleWithGemini(text)
  } catch (err) {
    console.warn('Gemini style analysis failed:', err.message)
  }

  if (!result || !result.metrics) {
    result = analyzeStyle(text)
  }

  res.json(result)
})

export default router
