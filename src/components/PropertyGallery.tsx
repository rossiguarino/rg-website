import { useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder'
import Lightbox from './Lightbox'

interface PropertyGalleryProps {
  images: string[]
  name: string
}

export default function PropertyGallery({ images, name }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return <ImagePlaceholder name={name} className="w-full aspect-[16/9] md:aspect-[21/9]" />
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <>
      <div className="relative">
        {/* Main image - clickable to open lightbox */}
        <div
          className="aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-brand-gray-light cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={`./${images[current]}`}
            alt={`${name} - Imagen ${current + 1}`}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
          />
          {/* Expand hint */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={14} />
            <span>Ver en grande</span>
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-brand-black" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} className="text-brand-black" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide px-1 py-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-all ${
                i === current ? 'border-brand-teal' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={`./${img}`}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          initialIndex={current}
          onClose={() => setLightboxOpen(false)}
          name={name}
        />
      )}
    </>
  )
}
