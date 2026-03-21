import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contacto" className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gray-light to-gray-200" />
      <img
        src="./elementos/pattern-teal.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none"
      />

      <div className="relative max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl text-brand-black mb-3">
          Contactanos
        </h2>
        <div className="w-12 h-px bg-brand-teal mx-auto mb-4" />
        <p className="text-brand-gray max-w-xl mx-auto mb-8 text-base md:text-lg">
          Estamos para ayudarte a encontrar tu proxima inversion
        </p>

        <Link
          to="/contacto"
          className="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors group"
        >
          Hablemos
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
