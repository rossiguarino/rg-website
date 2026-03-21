import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropiedadCard from '../components/PropiedadCard'
import PropiedadesFilters from '../components/PropiedadesFilters'
import PropiedadesEmptyState from '../components/PropiedadesEmptyState'
import { usePropiedades, type PublicProperty } from '../hooks/usePublicApi'
import type { Propiedad } from '../types/propiedad'

/** Maps a public API property to the Propiedad type used by card components. */
function toPropiedad(p: PublicProperty): Propiedad {
  return {
    id: p.uuid,
    slug: p.slug,
    title: p.title,
    operacion: p.operacion as 'venta' | 'alquiler',
    tipoPropiedad: p.tipo_propiedad,
    ambientes: p.ambientes,
    dormitorios: p.dormitorios,
    banos: p.banos,
    superficieTotal: p.superficie_total,
    superficieCubierta: p.superficie_cubierta,
    address: p.address,
    location: p.location,
    price: p.price,
    currency: p.currency,
    priceDisplay: p.price_display,
    expensas: p.expensas || null,
    expensasDisplay: p.expensas_display || null,
    description: p.description,
    features: p.features,
    images: p.images,
    destacada: !!p.destacada,
    disponible: !!p.disponible,
  }
}

export default function PropiedadesPage() {
  const [searchParams] = useSearchParams()
  const { properties: rawProperties, loading } = usePropiedades()

  // Read initial values from URL search params (set by the SearchBar)
  const urlOperacion = searchParams.get('operacion') as 'venta' | 'alquiler' | null
  const urlTipo = searchParams.get('tipo') || ''
  const urlAmbientes = searchParams.get('ambientes') || ''
  const urlLocalidad = searchParams.get('localidad') || ''

  const [operacion, setOperacion] = useState<'venta' | 'alquiler'>(urlOperacion || 'venta')
  const [tipoPropiedad, setTipoPropiedad] = useState(urlTipo)
  const [ambientes, setAmbientes] = useState<number[]>(
    urlAmbientes ? [parseInt(urlAmbientes, 10)] : []
  )
  const [localidad, setLocalidad] = useState(urlLocalidad)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Update filters when URL params change (navigating back from search)
  useEffect(() => {
    if (urlOperacion) setOperacion(urlOperacion)
    if (urlTipo) setTipoPropiedad(urlTipo)
    if (urlAmbientes) setAmbientes([parseInt(urlAmbientes, 10)])
    if (urlLocalidad) setLocalidad(urlLocalidad)
  }, [urlOperacion, urlTipo, urlAmbientes, urlLocalidad])

  // Filter out emprendimientos
  const propiedades = useMemo(
    () => rawProperties.filter((p) => !p.is_emprendimiento).map(toPropiedad),
    [rawProperties]
  )

  // Get unique locations for filter dropdown
  const locations = useMemo(
    () => [...new Set(propiedades.map((p) => p.location).filter(Boolean))].sort(),
    [propiedades]
  )

  // Get available property types from current data
  const availableTipos = useMemo(
    () => [...new Set(propiedades.map((p) => p.tipoPropiedad).filter(Boolean))],
    [propiedades]
  )

  const filtered = useMemo(() => {
    let result = propiedades.filter((p) => p.operacion === operacion)

    if (tipoPropiedad) {
      result = result.filter((p) => p.tipoPropiedad === tipoPropiedad)
    }

    if (localidad) {
      result = result.filter((p) => p.location === localidad)
    }

    if (ambientes.length > 0) {
      result = result.filter((p) =>
        ambientes.some((a) => a === 4 ? p.ambientes >= 4 : p.ambientes === a)
      )
    }

    result.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    )

    return result
  }, [propiedades, operacion, tipoPropiedad, localidad, ambientes, sortOrder])

  const hasFilters = ambientes.length > 0 || !!tipoPropiedad || !!localidad
  const hasAnyData = propiedades.length > 0

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
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
            Propiedades
          </h1>
          <div className="w-12 h-px bg-brand-teal mx-auto mb-4" />
          <p className="text-brand-gray max-w-lg mx-auto">
            Encontra tu proximo hogar o tu mejor inversion inmobiliaria
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">

      {hasAnyData && (
        <PropiedadesFilters
          operacion={operacion}
          onOperacionChange={setOperacion}
          tipoPropiedad={tipoPropiedad}
          onTipoPropiedadChange={setTipoPropiedad}
          availableTipos={availableTipos}
          ambientes={ambientes}
          onAmbientesChange={setAmbientes}
          localidad={localidad}
          onLocalidadChange={setLocalidad}
          locations={locations}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          totalResults={filtered.length}
        />
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((propiedad) => (
            <PropiedadCard key={propiedad.id} propiedad={propiedad} />
          ))}
        </div>
      ) : (
        <PropiedadesEmptyState hasFilters={hasAnyData && hasFilters} />
      )}
      </div>
    </div>
  )
}
