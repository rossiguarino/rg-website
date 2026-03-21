import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-brand-black text-white overflow-hidden">
      {/* Decorative monogram pattern */}
      <img
        src="./elementos/pattern-dark.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.3] pointer-events-none select-none"
      />
      {/* Decorative element 16 - RG fragments accent */}
      <img
        src="./elementos/rg-element-16.png"
        alt=""
        className="absolute -right-10 -bottom-10 w-80 md:w-[26rem] opacity-[0.5] pointer-events-none select-none"
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo + description */}
          <div>
            <img
              src="./logos/rg-submarca-white.png"
              alt="Rossi Guarino Propiedades"
              className="h-28 md:h-36 w-auto mb-6"
            />
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Emprendimientos inmobiliarios de calidad en Merlo y alrededores.
              Una inmobiliaria joven, moderna y confiable.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white uppercase tracking-brand-wide text-xs mb-4 font-display">Navegacion</p>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-gray-400 text-sm hover:text-brand-teal transition-colors">Inicio</Link>
              <Link to="/propiedades" className="text-gray-400 text-sm hover:text-brand-teal transition-colors">Propiedades</Link>
              <Link to="/emprendimientos" className="text-gray-400 text-sm hover:text-brand-teal transition-colors">Emprendimientos</Link>
              <Link to="/nosotros" className="text-gray-400 text-sm hover:text-brand-teal transition-colors">Nosotros</Link>
              <Link to="/contacto" className="text-gray-400 text-sm hover:text-brand-teal transition-colors">Contacto</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white uppercase tracking-brand-wide text-xs mb-4 font-display">Contacto</p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:rossiguarino.prop@gmail.com"
                className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-brand-teal transition-colors"
              >
                <Mail size={14} />
                rossiguarino.prop@gmail.com
              </a>
              <a
                href="tel:+541167521620"
                className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-brand-teal transition-colors"
              >
                <Phone size={14} />
                11-6752-1620
              </a>
              <a
                href="tel:+541140916878"
                className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-brand-teal transition-colors"
              >
                <Phone size={14} />
                11-4091-6878
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs tracking-brand">
            &copy; {new Date().getFullYear()} Rossi Guarino Propiedades. Todos los derechos reservados.
          </p>
          <img
            src="./logos/rg-submarca-white.png"
            alt="Rossi Guarino"
            className="h-6 opacity-50"
          />
        </div>
      </div>
    </footer>
  )
}
