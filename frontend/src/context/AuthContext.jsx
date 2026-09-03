import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('writely_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { user } = await api.me()
      setUser(user)
    } catch {
      localStorage.removeItem('writely_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const signIn = async (email, password) => {
    const { token, user } = await api.signIn({ email, password })
    localStorage.setItem('writely_token', token)
    setUser(user)
    return user
  }

  const signUp = async (name, email, password) => {
    const { token, user } = await api.signUp({ name, email, password })
    localStorage.setItem('writely_token', token)
    setUser(user)
    return user
  }

  const signOut = () => {
    localStorage.removeItem('writely_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
