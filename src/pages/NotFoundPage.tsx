import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <img
        src="./logos/rg-favicon.png"
        alt="RG"
        className="h-20 w-auto mb-8 opacity-20"
      />
      <h1 className="text-6xl md:text-8xl font-display text-brand-teal mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl text-brand-black mb-4">
        Pagina no encontrada
      </h2>
      <p className="text-brand-gray max-w-md mb-8">
        La pagina que buscas no existe o fue movida. Te invitamos a explorar nuestras propiedades.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors"
        >
          <Home size={16} />
          Ir al inicio
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 bg-white text-brand-black px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display border border-gray-200 hover:border-brand-teal hover:text-brand-teal transition-colors"
        >
          <ArrowLeft size={16} />
          Volver atras
        </button>
      </div>
    </div>
  )
}
