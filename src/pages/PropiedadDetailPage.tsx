import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, MapPin, BedDouble, Maximize2, Bath, CheckCircle2, DollarSign, Tag } from 'lucide-react'
import { usePropertyBySlug } from '../hooks/usePublicApi'
import PropertyGallery from '../components/PropertyGallery'

export default function PropiedadDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { property: p, loading, notFound } = usePropertyBySlug(slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
      </div>
    )
  }

  if (notFound || !p) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl text-brand-black mb-4">Propiedad no encontrada</h1>
        <Link to="/propiedades" className="text-brand-teal hover:underline">
          Volver a propiedades
        </Link>
      </div>
    )
  }

  const tipoLabel = p.tipo_propiedad ? p.tipo_propiedad.charAt(0).toUpperCase() + p.tipo_propiedad.slice(1) : ''

  const stats = [
    { icon: Tag, label: 'Tipo', value: tipoLabel },
    ...(p.ambientes > 0 ? [{ icon: BedDouble, label: 'Ambientes', value: `${p.ambientes}` }] : []),
    { icon: Maximize2, label: 'Superficie total', value: `${p.superficie_total} m²` },
    ...(p.superficie_cubierta !== p.superficie_total ? [{ icon: Maximize2, label: 'Sup. cubierta', value: `${p.superficie_cubierta} m²` }] : []),
    ...(p.banos > 0 ? [{ icon: Bath, label: 'Baños', value: `${p.banos}` }] : []),
  ]

  return (
    <div>
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link
          to="/propiedades"
          className="inline-flex items-center gap-2 text-sm text-brand-gray hover:text-brand-teal transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="uppercase tracking-brand-wide">Volver a propiedades</span>
        </Link>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <PropertyGallery images={p.images} name={p.title} />
      </div>

      {/* Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        {/* Title + operation badge */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full font-display tracking-wider text-white ${
              p.operacion === 'venta' ? 'bg-brand-teal' : 'bg-brand-teal-light'
            }`}>
              {p.operacion === 'venta' ? 'Venta' : 'Alquiler'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-3">
            {p.title}
          </h1>
          <div className="flex items-center gap-2 text-brand-gray">
            <MapPin size={18} className="text-brand-teal" />
            <span className="text-base md:text-lg">{p.address}</span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-6 mb-10">
          <div className="flex items-center gap-3">
            <DollarSign size={24} className="text-brand-teal" />
            <div>
              <p className="text-2xl md:text-3xl font-display text-brand-teal">
                {p.price_display}
              </p>
              {p.expensas_display && (
                <p className="text-brand-gray text-sm mt-1">
                  + {p.expensas_display} de expensas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-brand-gray-light rounded-xl p-4 text-center hover:bg-brand-teal/5 transition-colors"
            >
              <stat.icon size={20} className="text-brand-teal mx-auto mb-2" />
              <p className="text-xs text-brand-gray uppercase tracking-brand mb-1">{stat.label}</p>
              <p className="text-sm font-display text-brand-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {p.description && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 bg-brand-teal rounded" />
              <h2 className="text-2xl text-brand-black">Descripcion</h2>
            </div>
            <p className="text-brand-gray leading-relaxed max-w-3xl">
              {p.description}
            </p>
          </div>
        )}

        {/* Features */}
        {p.features && p.features.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 bg-brand-teal rounded" />
              <h2 className="text-2xl text-brand-black">Detalles de la propiedad</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 bg-brand-gray-light rounded-lg px-4 py-3">
                  <CheckCircle2 size={16} className="text-brand-teal flex-shrink-0" />
                  <span className="text-brand-gray text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location map */}
        {p.address && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 bg-brand-teal rounded" />
              <MapPin size={22} className="text-brand-teal" />
              <h2 className="text-2xl text-brand-black">Ubicacion</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <iframe
                title={`Mapa - ${p.title}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(p.address + ', Buenos Aires, Argentina')}&z=16&output=embed`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-display tracking-brand text-white mb-2">
            ¿Te interesa esta propiedad?
          </h3>
          <p className="text-white/80 text-sm mb-4">Proximamente nuestros canales de contacto</p>
          <div className="inline-block bg-white text-brand-teal px-8 py-3 rounded-lg text-sm uppercase tracking-brand-wide cursor-default font-display">
            Consultar
          </div>
        </div>
      </div>
    </div>
  )
}
