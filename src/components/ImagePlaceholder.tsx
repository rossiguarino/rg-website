interface ImagePlaceholderProps {
  name: string
  className?: string
}

export default function ImagePlaceholder({ name, className = '' }: ImagePlaceholderProps) {
  return (
    <div className={`bg-brand-gray-light flex flex-col items-center justify-center ${className}`}>
      <img
        src="./logos/rg-favicon.png"
        alt=""
        className="h-16 w-16 opacity-20 mb-4"
      />
      <p className="text-brand-gray text-sm tracking-brand uppercase">{name}</p>
      <p className="text-brand-gray/60 text-xs mt-1">Imagenes proximamente</p>
    </div>
  )
}
