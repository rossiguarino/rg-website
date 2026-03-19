import { MapPin, Building2, Car, DollarSign, HardHat, Users, CheckCircle2, Layers, ClipboardList } from 'lucide-react'
import PricingSection from './PricingSection'

interface Property {
  id: string
  name: string
  fullName: string
  address: string
  location: string
  developer: string
  totalUnits: string
  availableApartments: number
  availableParking: number
  parkingNote: string | null
  priceDisplay: string
  priceConfirmed: boolean
  constructionStatus: string
  statusConfirmed: boolean
  description: string
  features: string[]
  detallesCategoria?: string[]
  plantas?: Record<string, string>
  mapCoords?: string
  unidades?: any[]
  formaPago?: any
}

export default function PropertyDetails({ property }: { property: Property }) {
  const stats = [
    {
      icon: Building2,
      label: 'Unidades totales',
      value: property.totalUnits,
    },
    {
      icon: Users,
      label: 'Disponibles',
      value: `${property.availableApartments} unidad${property.availableApartments !== 1 ? 'es' : ''}`,
    },
    {
      icon: Car,
      label: 'Cocheras',
      value: property.parkingNote || `${property.availableParking} disponible${property.availableParking !== 1 ? 's' : ''}`,
    },
    {
      icon: DollarSign,
      label: 'Precio desde',
      value: property.priceDisplay,
    },
    {
      icon: HardHat,
      label: 'Estado de obra',
      value: property.constructionStatus,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      {/* Title section */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-3">
          {property.fullName}
        </h1>
        <div className="flex items-center gap-2 text-brand-gray">
          <MapPin size={18} className="text-brand-teal" />
          <span className="text-base md:text-lg">{property.address}</span>
        </div>
        {property.developer !== 'A confirmar' && (
          <p className="text-brand-gray text-sm mt-2">
            Desarrolla: <span className="text-brand-teal">{property.developer}</span>
          </p>
        )}
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
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-1 bg-brand-teal rounded" />
          <h2 className="text-2xl text-brand-black">Descripcion del emprendimiento</h2>
        </div>
        <p className="text-brand-gray leading-relaxed max-w-3xl">
          {property.description}
        </p>
      </div>

      {/* Features */}
      {property.features.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 bg-brand-teal rounded" />
            <h2 className="text-2xl text-brand-black">Caracteristicas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 bg-brand-gray-light rounded-lg px-4 py-3">
                <CheckCircle2 size={16} className="text-brand-teal flex-shrink-0" />
                <span className="text-brand-gray text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalles de Categoria */}
      {property.detallesCategoria && property.detallesCategoria.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 bg-brand-teal rounded" />
            <ClipboardList size={22} className="text-brand-teal" />
            <h2 className="text-2xl text-brand-black">Detalles de categoria</h2>
          </div>
          <div className="bg-brand-gray-light rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
              {property.detallesCategoria.map((detalle, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 flex-shrink-0" />
                  <span className="text-brand-gray text-sm leading-relaxed">{detalle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plantas / Distribucion */}
      {property.plantas && Object.keys(property.plantas).length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 bg-brand-teal rounded" />
            <Layers size={22} className="text-brand-teal" />
            <h2 className="text-2xl text-brand-black">Distribucion por pisos</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(property.plantas).map(([piso, desc]) => (
              <div key={piso} className="bg-brand-gray-light rounded-xl p-5 hover:bg-brand-teal/5 transition-colors">
                <h3 className="font-display text-brand-teal text-sm uppercase tracking-brand mb-1.5">{piso}</h3>
                <p className="text-brand-gray text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <PricingSection unidades={property.unidades} formaPago={property.formaPago} />

      {/* Google Maps */}
      {property.mapCoords && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 bg-brand-teal rounded" />
            <MapPin size={22} className="text-brand-teal" />
            <h2 className="text-2xl text-brand-black">Ubicacion</h2>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <iframe
              title={`Mapa - ${property.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + ', Buenos Aires, Argentina')}&z=16&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-brand-gray text-xs mt-2 flex items-center gap-1.5">
            <MapPin size={12} className="text-brand-teal" />
            {property.address}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-xl p-8 text-center text-white">
        <h3 className="text-xl font-display tracking-brand text-white mb-2">¿Te interesa este emprendimiento?</h3>
        <p className="text-white/80 text-sm mb-4">Proximamente nuestros canales de contacto</p>
        <div className="inline-block bg-white text-brand-teal px-8 py-3 rounded-lg text-sm uppercase tracking-brand-wide cursor-default font-display">
          Consultar
        </div>
      </div>
    </div>
  )
}
