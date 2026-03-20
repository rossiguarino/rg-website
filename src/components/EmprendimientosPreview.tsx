import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import PropertyCard from './PropertyCard'
import { useEmprendimientos } from '../hooks/usePublicApi'

/**
 * Emprendimientos carousel for the homepage.
 * Fetches data from the public API.
 */
export default function EmprendimientosPreview() {
  const { properties, loading } = useEmprendimientos()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }, [])

  const [visibleCount, setVisibleCount] = useState(getVisibleCount)

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getVisibleCount])

  const maxIndex = Math.max(0, properties.length - visibleCount)

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  useEffect(() => {
    if (isHovered || properties.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(goNext, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [goNext, isHovered, properties.length])

  if (loading) {
    return (
      <section id="contenido" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 scroll-mt-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </section>
    )
  }

  if (properties.length === 0) return null

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

  return (
    <section id="contenido" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 scroll-mt-24">
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-3">
            Emprendimientos
          </h2>
          <div className="w-12 h-px bg-brand-teal mb-3" />
          <p className="text-brand-gray max-w-md">
            Explora nuestra cartera y encontrá tu próxima inversión
          </p>
        </div>
        <Link
          to="/emprendimientos"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-display uppercase tracking-brand-wide text-brand-teal hover:text-brand-teal-dark transition-colors"
        >
          Ver todos
          <ArrowRight size={16} />
        </Link>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {properties.length > visibleCount && (
          <>
            <button
              onClick={goPrev}
              className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-brand-black hover:text-brand-teal transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-brand-black hover:text-brand-teal transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {properties.map((property) => (
              <div
                key={property.uuid}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <PropertyCard property={toCardProp(property)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-6 bg-brand-teal'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          to="/emprendimientos"
          className="inline-flex items-center gap-2 text-sm font-display uppercase tracking-brand-wide text-brand-teal hover:text-brand-teal-dark transition-colors"
        >
          Ver todos los emprendimientos
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
