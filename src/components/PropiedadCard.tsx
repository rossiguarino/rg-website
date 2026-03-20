import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Maximize2, Bath } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import { getPublicImageUrl } from '../hooks/usePublicApi'
import type { Propiedad } from '../types/propiedad'

/** Resolves an image path — supports both static and API (uploads/) paths. */
function resolveImageSrc(path: string): string {
  if (path.startsWith('uploads/')) return getPublicImageUrl(path)
  if (path.startsWith('http')) return path
  return `./${path}`
}

export default function PropiedadCard({ propiedad }: { propiedad: Propiedad }) {
  const hasImages = propiedad.images.length > 0

  return (
    <Link
      to={`/propiedades/${propiedad.slug}`}
      className="group block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative">
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
        <span className={`absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full font-display tracking-wider backdrop-blur-sm text-white ${
          propiedad.operacion === 'venta' ? 'bg-brand-teal/90' : 'bg-brand-teal-light/90'
        }`}>
          {propiedad.operacion === 'venta' ? 'Venta' : 'Alquiler'}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-display tracking-brand text-brand-black mb-2 line-clamp-2">
          {propiedad.title}
        </h3>

        <div className="flex items-center gap-1.5 text-brand-gray text-sm mb-1">
          <MapPin size={14} className="flex-shrink-0 text-brand-teal" />
          <span>{propiedad.address}</span>
        </div>
        <p className="text-brand-gray/70 text-xs mb-3 ml-5">{propiedad.location}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-brand-gray text-sm mb-4">
          {propiedad.ambientes > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble size={14} className="text-brand-teal" />
              <span>{propiedad.ambientes} amb.</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Maximize2 size={14} className="text-brand-teal" />
            <span>{propiedad.superficieTotal} m²</span>
          </div>
          {propiedad.banos > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={14} className="text-brand-teal" />
              <span>{propiedad.banos}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-lg font-display text-brand-teal">
            {propiedad.priceDisplay}
          </span>
          {propiedad.expensasDisplay && (
            <span className="text-xs text-brand-gray ml-2">
              + {propiedad.expensasDisplay} expensas
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
