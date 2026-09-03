import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(location.state?.from || '/')
    } catch (e) {
      setError(e.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      heading="Welcome back"
      subheading="Sign in to continue improving your writing."
      footer={
        <span className="text-(--color-text-muted)">
          Don't have an account?{' '}
          <Link to="/sign-up" className="font-medium text-(--color-accent)">
            Sign up
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Enter your email" />
        <FormField
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          right={
            <Link to="/forgot-password" className="text-xs font-medium text-(--color-accent)">
              Forgot password?
            </Link>
          }
        />

        {error && <p className="text-sm text-(--color-grammar)">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-(--color-accent) py-3.5 font-serif text-base font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthCard>
  )
}
