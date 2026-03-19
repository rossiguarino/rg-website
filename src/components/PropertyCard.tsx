import { Link } from 'react-router-dom'
import { MapPin, Building2 } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'

interface Property {
  id: string
  slug: string
  name: string
  fullName: string
  address: string
  location: string
  totalUnits: string
  availableApartments: number
  priceDisplay: string
  priceConfirmed: boolean
  constructionStatus: string
  statusConfirmed: boolean
  images: string[]
}

export default function PropertyCard({ property }: { property: Property }) {
  const hasImages = property.images.length > 0

  return (
    <Link
      to={`/propiedad/${property.slug}`}
      className="group block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative">
        {hasImages ? (
          <img
            src={`./${property.images[0]}`}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder name={property.name} className="w-full h-full" />
        )}
        {/* Status badge overlay */}
        <span className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full font-display tracking-wider backdrop-blur-sm bg-brand-teal/90 text-white">
          {property.constructionStatus}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-display tracking-brand text-brand-black mb-2">
          {property.name}
        </h3>

        <div className="flex items-center gap-1.5 text-brand-gray text-sm mb-1">
          <MapPin size={14} className="flex-shrink-0 text-brand-teal" />
          <span>{property.address}</span>
        </div>

        <div className="flex items-center gap-1.5 text-brand-gray text-sm mb-4">
          <Building2 size={14} className="flex-shrink-0 text-brand-teal" />
          <span>{property.totalUnits}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className={`text-base font-display ${
            property.priceConfirmed ? 'text-brand-black' : 'text-brand-gray'
          }`}>
            {property.priceDisplay}
          </span>
          <span className="text-xs text-brand-teal uppercase tracking-brand-wide font-display">
            {property.availableApartments} disponible{property.availableApartments !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
