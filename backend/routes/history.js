import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { db } from '../utils/db.js'

const router = Router()

router.get('/', requireAuth, (req, res) => {
  const history = db.getHistoryForUser(req.userId)
  res.json({ history })
})

router.delete('/:id', requireAuth, (req, res) => {
  db.deleteHistory(req.params.id, req.userId)
  res.json({ ok: true })
})

export default router
