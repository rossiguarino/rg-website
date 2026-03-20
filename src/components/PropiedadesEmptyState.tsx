import { Home, Search } from 'lucide-react'

interface Props {
  hasFilters: boolean
}

export default function PropiedadesEmptyState({ hasFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {hasFilters ? (
        <>
          <Search size={48} className="text-brand-gray/30 mb-6" />
          <h3 className="text-xl font-display text-brand-black mb-2">
            No se encontraron propiedades
          </h3>
          <p className="text-brand-gray text-sm max-w-md">
            No hay propiedades que coincidan con los filtros seleccionados. Proba ajustando los filtros para ver mas resultados.
          </p>
        </>
      ) : (
        <>
          <Home size={48} className="text-brand-gray/30 mb-6" />
          <h3 className="text-xl font-display text-brand-black mb-2">
            Proximamente
          </h3>
          <p className="text-brand-gray text-sm max-w-md">
            Estamos preparando nuestro catalogo de propiedades en venta y alquiler. Muy pronto vas a poder explorarlas desde aca.
          </p>
          <a
            href="#contacto"
            className="mt-6 inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-2.5 rounded-lg text-sm uppercase tracking-brand-wide hover:bg-brand-teal-dark transition-colors font-display"
          >
            Contactanos
          </a>
        </>
      )}
    </div>
  )
}
