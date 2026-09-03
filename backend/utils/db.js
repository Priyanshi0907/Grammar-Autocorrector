import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify({ users: [], history: [] }, null, 2))
  }
}

function readAll() {
  ensure()
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
}

function writeAll(data) {
  ensure()
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

export const db = {
  getUsers() {
    return readAll().users
  },
  findUserByEmail(email) {
    return readAll().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  },
  findUserById(id) {
    return readAll().users.find((u) => u.id === id)
  },
  createUser(user) {
    const data = readAll()
    data.users.push(user)
    writeAll(data)
    return user
  },
  getHistoryForUser(userId) {
    const data = readAll()
    return data.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  addHistory(item) {
    const data = readAll()
    data.history.push(item)
    writeAll(data)
    return item
  },
  deleteHistory(id, userId) {
    const data = readAll()
    data.history = data.history.filter((h) => !(h.id === id && h.userId === userId))
    writeAll(data)
  },
}
