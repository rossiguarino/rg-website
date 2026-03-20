import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PropiedadCard from './PropiedadCard'
import PropiedadFeaturedCard from './PropiedadFeaturedCard'
import { usePropiedades, type PublicProperty } from '../hooks/usePublicApi'
import type { Propiedad } from '../types/propiedad'

/** Max number of properties to show in the preview. */
const MAX_PREVIEW = 6

/** Threshold: if we have this many or fewer, use featured (horizontal) cards. */
const FEATURED_THRESHOLD = 2

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

/**
 * Propiedades preview for the homepage.
 * Fetches from public API. Adapts layout based on count.
 */
export default function PropiedadesPreview() {
  const { properties: rawProperties, loading } = usePropiedades()

  if (loading) {
    return (
      <section className="bg-brand-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </section>
    )
  }

  // Filter out emprendimientos — only show regular propiedades
  const disponibles = rawProperties.filter((p) => !p.is_emprendimiento)
  const preview = disponibles.slice(0, MAX_PREVIEW)

  const ventaCount = disponibles.filter((p) => p.operacion === 'venta').length
  const alquilerCount = disponibles.filter((p) => p.operacion === 'alquiler').length

  if (preview.length === 0) return null

  const useFeatured = preview.length <= FEATURED_THRESHOLD
  const propiedades = preview.map(toPropiedad)

  return (
    <section className="bg-brand-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-3">
              Propiedades
            </h2>
            <div className="w-12 h-px bg-brand-teal mb-3" />
            <p className="text-brand-gray max-w-md">
              {ventaCount > 0 && alquilerCount > 0
                ? `${ventaCount} en venta · ${alquilerCount} en alquiler`
                : ventaCount > 0
                  ? `${ventaCount} propiedad${ventaCount !== 1 ? 'es' : ''} en venta`
                  : `${alquilerCount} propiedad${alquilerCount !== 1 ? 'es' : ''} en alquiler`}
            </p>
          </div>
          <Link
            to="/propiedades"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-display uppercase tracking-brand-wide text-brand-teal hover:text-brand-teal-dark transition-colors"
          >
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>

        {useFeatured ? (
          <div className="space-y-6">
            {propiedades.map((propiedad) => (
              <PropiedadFeaturedCard key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {propiedades.map((propiedad) => (
              <PropiedadCard key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/propiedades"
            className="inline-flex items-center gap-2 text-sm font-display uppercase tracking-brand-wide text-brand-teal hover:text-brand-teal-dark transition-colors"
          >
            Ver todas las propiedades
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
