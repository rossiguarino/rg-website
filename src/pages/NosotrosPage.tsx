import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NosotrosPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-gray-light to-white py-20 md:py-32 px-6 overflow-hidden">
        {/* Decorative element 01 - ring */}
        <img
          src="./elementos/rg-element-01.png"
          alt=""
          className="absolute -right-28 top-0 w-72 md:w-[24rem] opacity-[0.04] pointer-events-none select-none"
        />
        {/* Decorative element 14 - RG fragments */}
        <img
          src="./elementos/rg-element-14.png"
          alt=""
          className="absolute -left-16 -bottom-8 w-80 md:w-[22rem] opacity-[0.7] pointer-events-none select-none"
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <img
            src="./logos/rg-favicon.png"
            alt="RG"
            className="h-20 md:h-28 w-auto mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-brand-black mb-6">
            Nosotros
          </h1>
          <div className="w-16 h-px bg-brand-teal mx-auto" />
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <p className="text-brand-teal text-sm uppercase tracking-brand-wide mb-3 font-display">Nuestra historia</p>
            <h2 className="text-2xl md:text-3xl text-brand-black mb-6">
              Dos miradas, un emprendimiento
            </h2>
            <div className="w-10 h-px bg-brand-teal mb-6" />
          </div>
          <div className="space-y-5 text-brand-gray leading-relaxed">
            <p>
              <strong className="text-brand-black">Tiago Guarino</strong>, arquitecto, y <strong className="text-brand-black">Octavio Rossi</strong>, martillero, son dos amigos vinculados al mundo de la construccion desde diferentes perspectivas.
            </p>
            <p>
              A partir de sus recorridos profesionales y de una vision compartida sobre el potencial del sector, decidieron unir sus conocimientos para dar origen a un emprendimiento propio.
            </p>
            <p>
              Asi nace <strong className="text-brand-teal">Rossi Guarino Propiedades</strong>, orientada a potenciar el rubro tanto desde la comercializacion como desde el desarrollo, combinando experiencia tecnica y mirada estrategica.
            </p>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative overflow-hidden py-16 md:py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gray-light to-gray-200" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="font-accent text-2xl md:text-3xl lg:text-4xl italic leading-relaxed mb-8 text-brand-gray">
            "Una inmobiliaria joven, moderna y confiable, comprometida con acompañar cada proceso con profesionalismo y cercania."
          </p>
          <div className="w-16 h-px bg-brand-teal/30 mx-auto" />
        </div>
      </section>

      {/* Values */}
      <section className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
        {/* Decorative element 05 - light pattern */}
        <img
          src="./elementos/rg-element-05.png"
          alt=""
          className="absolute -right-20 top-1/3 w-64 md:w-80 opacity-[0.04] pointer-events-none select-none"
        />
        <div className="text-center mb-12">
          <p className="text-brand-teal text-sm uppercase tracking-brand-wide mb-3 font-display">Lo que nos define</p>
          <h2 className="text-2xl md:text-3xl text-brand-black">Nuestros Valores</h2>
          <div className="w-10 h-px bg-brand-teal mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Profesionalismo',
              desc: 'Experiencia tecnica y mirada estrategica en cada emprendimiento que desarrollamos.',
            },
            {
              title: 'Confianza',
              desc: 'Transparencia y compromiso en el acompañamiento de cada proceso inmobiliario.',
            },
            {
              title: 'Innovacion',
              desc: 'Vision moderna del desarrollo inmobiliario, con foco en calidad y diseño.',
            },
            {
              title: 'Cercania',
              desc: 'Relacion directa y personalizada con cada cliente, desde el primer contacto.',
            },
            {
              title: 'Calidad',
              desc: 'Terminaciones de primera categoria y materiales seleccionados en cada obra.',
            },
            {
              title: 'Vision',
              desc: 'Identificamos oportunidades y desarrollamos emprendimientos con potencial de crecimiento.',
            },
          ].map((value) => (
            <div key={value.title} className="bg-brand-gray-light rounded-xl p-6 hover:bg-brand-teal/5 transition-colors">
              <div className="w-8 h-1 bg-brand-teal rounded mb-4" />
              <h3 className="text-lg font-display tracking-brand text-brand-black mb-2">{value.title}</h3>
              <p className="text-brand-gray text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-gray-light py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-brand-black mb-4">Conoce nuestros emprendimientos</h2>
          <p className="text-brand-gray mb-8">Explora nuestra cartera de emprendimientos inmobiliarios en Merlo y alrededores.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-3 rounded-lg text-sm uppercase tracking-brand-wide hover:bg-brand-teal-dark transition-colors font-display"
          >
            Ver emprendimientos
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
