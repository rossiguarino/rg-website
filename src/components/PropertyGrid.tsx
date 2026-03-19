import PropertyCard from './PropertyCard'
import properties from '../data/properties.json'

export default function PropertyGrid() {
  return (
    <section id="emprendimientos" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-4">
          Nuestros Emprendimientos
        </h2>
        <div className="w-12 h-px bg-brand-teal mx-auto mb-4" />
        <p className="text-brand-gray max-w-lg mx-auto">
          Explora nuestra cartera y encuentra tu proxima inversion
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
