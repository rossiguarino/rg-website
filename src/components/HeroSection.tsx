import { ChevronDown } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 bg-gradient-to-b from-white via-white to-brand-gray-light overflow-hidden">
      {/* Decorative teal line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-brand-teal/30" />

      {/* Decorative element 01 - ring, top right */}
      <img
        src="./elementos/rg-element-01.png"
        alt=""
        className="absolute -right-32 -top-20 w-80 md:w-[28rem] lg:w-[32rem] opacity-[0.05] pointer-events-none select-none"
      />
      {/* Decorative element 08 - ring with geometry, left side */}
      <img
        src="./elementos/rg-element-08.png"
        alt=""
        className="absolute -left-36 -bottom-16 w-72 md:w-96 opacity-[0.04] pointer-events-none select-none"
      />
      {/* Decorative element 14 - RG fragments, top left */}
      <img
        src="./elementos/rg-element-14.png"
        alt=""
        className="absolute -left-10 -top-10 w-80 md:w-[24rem] lg:w-[28rem] opacity-[0.7] pointer-events-none select-none"
      />
      {/* Decorative element 16 - RG fragments, bottom right */}
      <img
        src="./elementos/rg-element-16.png"
        alt=""
        className="absolute -right-16 -bottom-20 w-80 md:w-[26rem] opacity-[0.7] pointer-events-none select-none"
      />

      <div className="text-center">
        <img
          src="./logos/rg-submarca-black.png"
          alt="Rossi Guarino Propiedades"
          className="h-28 md:h-44 lg:h-56 w-auto mx-auto mb-8"
        />
        <div className="w-12 h-px bg-brand-teal mx-auto mb-6" />
        <p className="font-accent text-lg md:text-xl lg:text-2xl text-brand-gray italic mx-auto leading-relaxed text-center">
          Te acompañamos en tu operacion desde el primer contacto<br className="hidden lg:inline" />{' '}
          hasta concretarla
        </p>
      </div>

      <a
        href="#emprendimientos"
        className="absolute bottom-12 animate-bounce text-brand-teal"
        aria-label="Ver emprendimientos"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  )
}
