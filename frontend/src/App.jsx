import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import CheckGrammar from './pages/CheckGrammar'
import Paraphrase from './pages/Paraphrase'
import StyleGuide from './pages/StyleGuide'
import History from './pages/History'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'

function AppLayout({ children }) {
  const location = useLocation()
  const hideNavbar = ['/sign-in', '/sign-up'].includes(location.pathname)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-(--color-ink) text-(--color-text)">
      {!hideNavbar && <Navbar />}
      <main className="flex flex-1 min-h-0 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<CheckGrammar />} />
        <Route path="/paraphrase" element={<Paraphrase />} />
        <Route path="/style-guide" element={<StyleGuide />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </AppLayout>
  )
}
