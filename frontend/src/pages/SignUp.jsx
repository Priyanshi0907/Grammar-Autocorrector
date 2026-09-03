import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await signUp(name, email, password)
      navigate('/')
    } catch (e) {
      setError(e.message || 'Unable to create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      heading="Create your account"
      subheading="Join us and write with confidence."
      footer={
        <span className="text-(--color-text-muted)">
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-(--color-accent)">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Full name" icon={User} value={name} onChange={setName} placeholder="Enter your full name" />
        <FormField label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Enter your email" />
        <FormField
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          hint="Use 8 or more characters with a mix of letters, numbers & symbols."
        />

        {error && <p className="text-sm text-(--color-grammar)">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-(--color-accent) py-3.5 font-serif text-base font-semibold text-(--color-accent-ink) transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </AuthCard>
  )
}
