import { Router } from 'express'
import { paraphrase } from '../utils/paraphraser.js'
import { paraphraseWithGemini } from '../utils/geminiAI.js'

const router = Router()

router.post('/', async (req, res) => {
  const { text, mode = 'Natural' } = req.body || {}

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide some text to paraphrase.' })
  }
  if (text.length > 8000) {
    return res.status(400).json({ error: 'Text is too long. Please limit paraphrasing to 8,000 characters.' })
  }

  let paraphrased = null
  try {
    paraphrased = await paraphraseWithGemini(text, mode)
  } catch (err) {
    console.warn('Gemini paraphrase failed:', err.message)
  }

  if (!paraphrased) {
    paraphrased = paraphrase(text, mode)
  }

  res.json({ paraphrased, mode })
})

export default router
