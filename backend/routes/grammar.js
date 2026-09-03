import { Router } from 'express'
import { nanoid } from 'nanoid'
import multer from 'multer'
import { checkGrammar, applyAllCorrections } from '../utils/grammarEngine.js'
import { extractTextFromFile } from '../utils/fileExtractor.js'
import { optionalAuth } from '../middleware/auth.js'
import { db } from '../utils/db.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
})

router.post('/check', optionalAuth, async (req, res) => {
  try {
    const { text, language = 'English (US)', mode = 'Standard' } = req.body || {}

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide some text to check.' })
    }
    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text is too long. Please limit checks to 50,000 characters.' })
    }

    const corrections = await checkGrammar(text, { language, mode })

    if (req.userId) {
      const correctedText = applyAllCorrections(text, corrections)
      db.addHistory({
        id: nanoid(12),
        userId: req.userId,
        originalText: text,
        correctedText,
        errorCount: corrections.length,
        correctionCount: corrections.length,
        mode,
        createdAt: new Date().toISOString(),
      })
    }

    res.json({ corrections })
  } catch (err) {
    console.error('Error in /api/grammar/check:', err)
    res.status(500).json({ error: 'An error occurred while checking grammar. Please try again.' })
  }
})

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' })
    }

    const text = await extractTextFromFile(req.file)
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

    res.json({
      text,
      filename: req.file.originalname,
      wordCount,
    })
  } catch (err) {
    console.error('Error in /api/grammar/upload:', err)
    res.status(400).json({ error: err.message || 'Failed to extract text from file.' })
  }
})

export default router
