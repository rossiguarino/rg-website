import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const goToNosotros = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    navigate('/nosotros')
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  /** Navigates to contact section. If not on home, goes to home first. */
  const goToContacto = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname === '/') {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigate('/')
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
          }}
          className="cursor-pointer"
        >
          <img
            src="./logos/rg-favicon.png"
            alt="RG"
            className="h-16 md:h-20 w-auto"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen(false)
              navigate('/')
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
            }}
            className={`text-sm tracking-brand-wide uppercase transition-colors cursor-pointer ${
              isActive('/') ? 'text-brand-teal' : 'text-brand-black hover:text-brand-teal'
            }`}
          >
            Inicio
          </a>
          <Link
            to="/propiedades"
            className={`text-sm tracking-brand-wide uppercase transition-colors ${
              location.pathname.startsWith('/propiedades') ? 'text-brand-teal' : 'text-brand-black hover:text-brand-teal'
            }`}
          >
            Propiedades
          </Link>
          <Link
            to="/emprendimientos"
            className={`text-sm tracking-brand-wide uppercase transition-colors ${
              location.pathname.startsWith('/emprendimientos') ? 'text-brand-teal' : 'text-brand-black hover:text-brand-teal'
            }`}
          >
            Emprendimientos
          </Link>
          <a
            href="/nosotros"
            onClick={goToNosotros}
            className={`text-sm tracking-brand-wide uppercase transition-colors cursor-pointer ${
              isActive('/nosotros') ? 'text-brand-teal' : 'text-brand-black hover:text-brand-teal'
            }`}
          >
            Nosotros
          </a>
          <a
            href="#contacto"
            onClick={goToContacto}
            className="text-sm tracking-brand-wide uppercase text-white bg-brand-teal px-5 py-2 rounded hover:bg-brand-teal-dark transition-colors"
          >
            Contacto
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-brand-black"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                setMenuOpen(false)
                navigate('/')
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
              }}
              className={`text-sm tracking-brand-wide uppercase transition-colors cursor-pointer ${
                isActive('/') ? 'text-brand-teal' : 'text-brand-black'
              }`}
            >
              Inicio
            </a>
            <Link
              to="/propiedades"
              onClick={() => setMenuOpen(false)}
              className={`text-sm tracking-brand-wide uppercase transition-colors ${
                location.pathname.startsWith('/propiedades') ? 'text-brand-teal' : 'text-brand-black'
              }`}
            >
              Propiedades
            </Link>
            <Link
              to="/emprendimientos"
              onClick={() => setMenuOpen(false)}
              className={`text-sm tracking-brand-wide uppercase transition-colors ${
                location.pathname.startsWith('/emprendimientos') ? 'text-brand-teal' : 'text-brand-black'
              }`}
            >
              Emprendimientos
            </Link>
            <a
              href="/nosotros"
              onClick={goToNosotros}
              className={`text-sm tracking-brand-wide uppercase transition-colors ${
                isActive('/nosotros') ? 'text-brand-teal' : 'text-brand-black'
              }`}
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              onClick={goToContacto}
              className="text-sm tracking-brand-wide uppercase text-white bg-brand-teal px-4 py-2 rounded text-center hover:bg-brand-teal-dark transition-colors mt-2"
            >
              Contacto
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
