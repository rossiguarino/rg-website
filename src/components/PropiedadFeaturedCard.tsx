import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Maximize2, Bath, ArrowRight } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import { getPublicImageUrl } from '../hooks/usePublicApi'
import type { Propiedad } from '../types/propiedad'

/** Resolves an image path — supports both static and API (uploads/) paths. */
function resolveImageSrc(path: string): string {
  if (path.startsWith('uploads/')) return getPublicImageUrl(path)
  if (path.startsWith('http')) return path
  return `./${path}`
}

/**
 * Featured horizontal property card for homepage preview.
 * Used when there are few properties (1–2) to fill the space better
 * than a standard grid card.
 */
export default function PropiedadFeaturedCard({ propiedad }: { propiedad: Propiedad }) {
  const hasImages = propiedad.images.length > 0

  return (
    <Link
      to={`/propiedades/${propiedad.slug}`}
      className="group block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image — left side on desktop */}
        <div className="md:w-1/2 lg:w-[45%] h-64 sm:h-72 md:h-80 overflow-hidden relative">
          {hasImages ? (
            <img
              src={resolveImageSrc(propiedad.images[0])}
              alt={propiedad.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder name={propiedad.title} className="w-full h-full" />
          )}
          {/* Operation badge */}
          <span className={`absolute top-4 right-4 text-xs px-4 py-2 rounded-full font-display tracking-wider backdrop-blur-sm text-white ${
            propiedad.operacion === 'venta' ? 'bg-brand-teal/90' : 'bg-brand-teal-light/90'
          }`}>
            {propiedad.operacion === 'venta' ? 'Venta' : 'Alquiler'}
          </span>
        </div>

        {/* Content — right side on desktop */}
        <div className="md:w-1/2 lg:w-[55%] p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <h3 className="text-2xl md:text-3xl font-display tracking-brand text-brand-black mb-4">
            {propiedad.title}
          </h3>

          <div className="flex items-center gap-1.5 text-brand-gray mb-1">
            <MapPin size={16} className="flex-shrink-0 text-brand-teal" />
            <span>{propiedad.address}</span>
          </div>
          <p className="text-brand-gray/70 text-sm mb-5 ml-6">{propiedad.location}</p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-5 text-brand-gray mb-6">
            {propiedad.ambientes > 0 && (
              <div className="flex items-center gap-2">
                <BedDouble size={16} className="text-brand-teal" />
                <span>{propiedad.ambientes} amb.</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Maximize2 size={16} className="text-brand-teal" />
              <span>{propiedad.superficieTotal} m²</span>
            </div>
            {propiedad.banos > 0 && (
              <div className="flex items-center gap-2">
                <Bath size={16} className="text-brand-teal" />
                <span>{propiedad.banos} baño{propiedad.banos !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Description excerpt */}
          {propiedad.description && (
            <p className="text-brand-gray/80 text-sm leading-relaxed mb-6 line-clamp-3">
              {propiedad.description}
            </p>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-2xl font-display text-brand-teal">
                {propiedad.priceDisplay}
              </span>
              {propiedad.expensasDisplay && (
                <span className="text-sm text-brand-gray ml-2">
                  + {propiedad.expensasDisplay} expensas
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-display uppercase tracking-brand-wide text-brand-teal group-hover:translate-x-1 transition-transform">
              Ver detalle
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
