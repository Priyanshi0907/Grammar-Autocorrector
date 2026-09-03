import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { db } from '../utils/db.js'
import { requireAuth, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

function sign(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' })
}

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {}

  if (!name || !name.trim()) return res.status(400).json({ error: 'Please enter your full name.' })
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = db.createUser({
    id: nanoid(12),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  })

  res.status(201).json({ token: sign(user), user: toPublicUser(user) })
})

router.post('/signin', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Please enter your email and password.' })

  const user = db.findUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' })

  res.json({ token: sign(user), user: toPublicUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  const user = db.findUserById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ user: toPublicUser(user) })
})

export default router
