import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import grammarRoutes from './routes/grammar.js'
import paraphraseRoutes from './routes/paraphrase.js'
import styleRoutes from './routes/style.js'
import historyRoutes from './routes/history.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/grammar', grammarRoutes)
app.use('/api/paraphrase', paraphraseRoutes)
app.use('/api/style', styleRoutes)
app.use('/api/history', historyRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(PORT, () => {
  console.log(`Writely backend running at http://localhost:${PORT}`)
})
