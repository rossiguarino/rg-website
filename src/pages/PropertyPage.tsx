import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import properties from '../data/properties.json'
import PropertyGallery from '../components/PropertyGallery'
import PropertyDetails from '../components/PropertyDetails'

export default function PropertyPage() {
  const { slug } = useParams<{ slug: string }>()
  const property = properties.find((p) => p.slug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl text-brand-black mb-4">Emprendimiento no encontrado</h1>
        <Link to="/" className="text-brand-teal hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-brand-gray hover:text-brand-teal transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="uppercase tracking-brand-wide">Volver a emprendimientos</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <PropertyGallery images={property.images} name={property.name} />
      </div>

      <PropertyDetails property={property} />
    </div>
  )
}
