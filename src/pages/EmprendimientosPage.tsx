import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import EmprendimientosFilters from '../components/EmprendimientosFilters'
import { useEmprendimientos } from '../hooks/usePublicApi'

/**
 * Full emprendimientos page with filters and sorting.
 * Fetches data from the public API.
 */
export default function EmprendimientosPage() {
  const [searchParams] = useSearchParams()
  const { properties, loading } = useEmprendimientos()

  const urlLocalidad = searchParams.get('localidad') || ''
  const urlTipo = searchParams.get('tipo') || ''
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    urlLocalidad ? [urlLocalidad] : []
  )
  const [tipoFiltro, setTipoFiltro] = useState(urlTipo)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const locations = useMemo(
    () => [...new Set(properties.map((p) => p.location))].sort(),
    [properties]
  )

  /** Map API property to the shape PropertyCard expects. */
  const toCardProp = (p: typeof properties[0]) => ({
    id: p.uuid,
    slug: p.slug,
    name: p.title,
    fullName: p.title,
    address: p.address,
    location: p.location,
    totalUnits: p.total_units || '',
    availableApartments: p.available_apartments || 0,
    priceDisplay: p.price_display || (p.price_from ? `USD ${p.price_from.toLocaleString('es-AR')}` : 'A confirmar'),
    priceConfirmed: !!p.price_display || p.price_from > 0,
    constructionStatus: p.construction_status || 'Disponible',
    statusConfirmed: true,
    images: p.images,
    priceFrom: p.price_from || p.price || 0,
  })

  /** Maps a tipo_propiedad value to keywords to search in total_units text */
  const tipoKeywords: Record<string, string[]> = {
    departamento: ['departamento', 'depto', 'monoambiente'],
    casa: ['casa'],
    duplex: ['dúplex', 'duplex'],
    'local comercial': ['local', 'comercial'],
    terreno: ['terreno', 'lote'],
    oficina: ['oficina'],
    cochera: ['cochera'],
    ph: ['ph'],
  }

  const filtered = useMemo(() => {
    let result = [...properties]
    if (selectedLocations.length > 0) {
      result = result.filter((p) => selectedLocations.includes(p.location))
    }
    if (tipoFiltro) {
      const keywords = tipoKeywords[tipoFiltro] || [tipoFiltro]
      result = result.filter((p) => {
        const units = (p.total_units || '').toLowerCase()
        return keywords.some((kw) => units.includes(kw))
      })
    }
    result.sort((a, b) => {
      const priceA = a.price_from || a.price || 0
      const priceB = b.price_from || b.price || 0
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
    })
    return result
  }, [properties, selectedLocations, tipoFiltro, sortOrder])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-gray-light to-white py-16 md:py-24 px-6 overflow-hidden">
        <img
          src="./elementos/rg-element-01.png"
          alt=""
          className="absolute -right-28 top-0 w-72 md:w-[24rem] opacity-[0.04] pointer-events-none select-none"
        />
        <img
          src="./elementos/rg-element-14.png"
          alt=""
          className="absolute -left-16 -bottom-8 w-80 md:w-[22rem] opacity-[0.15] md:opacity-[0.7] pointer-events-none select-none"
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-4">
            Emprendimientos
          </h1>
          <div className="w-12 h-px bg-brand-teal mx-auto mb-4" />
          <p className="text-brand-gray max-w-lg mx-auto">
            Explora nuestra cartera y encontrá tu próxima inversión
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">

      {tipoFiltro && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-brand-gray text-sm">
            Filtrando por: <strong className="text-brand-black">
              {{ casa: 'Casas', departamento: 'Departamentos', duplex: 'Duplex', ph: 'PH', 'local comercial': 'Locales comerciales' }[tipoFiltro] || tipoFiltro}
            </strong>
          </span>
          <button
            onClick={() => setTipoFiltro('')}
            className="text-brand-teal text-xs uppercase tracking-brand-wide font-display hover:text-brand-teal-dark transition-colors"
          >
            Quitar filtro
          </button>
        </div>
      )}

      <EmprendimientosFilters
        selectedLocations={selectedLocations}
        onLocationsChange={setSelectedLocations}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        locations={locations}
        totalResults={filtered.length}
      />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((property) => (
            <PropertyCard key={property.uuid} property={toCardProp(property)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-brand-gray text-lg">
            No se encontraron emprendimientos con los filtros seleccionados.
          </p>
          <button
            onClick={() => { setSelectedLocations([]); setTipoFiltro('') }}
            className="mt-4 text-brand-teal hover:text-brand-teal-dark text-sm uppercase tracking-brand-wide transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
