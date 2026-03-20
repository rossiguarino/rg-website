import { Mail, MessageCircle } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contacto" className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gray-light to-gray-200" />
      {/* Decorative monogram pattern overlay */}
      <img
        src="./elementos/pattern-teal.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
        <img
          src="./logos/rg-favicon.png"
          alt=""
          className="h-28 md:h-36 lg:h-44 w-auto mx-auto mb-8 opacity-20"
        />
        <h2 className="text-3xl md:text-4xl text-brand-black mb-4">
          Contactanos
        </h2>
        <p className="text-brand-gray max-w-3xl mx-auto mb-10 font-accent text-lg md:text-xl lg:text-2xl italic">
          Estamos para ayudarte a encontrar tu proxima inversion
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <a
            href="mailto:rossiguarino.prop@gmail.com"
            className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors"
          >
            <Mail size={16} />
            Escribinos
          </a>
          <a
            href="https://wa.me/541167521620"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle size={16} />
            11-6752-1620
          </a>
          <a
            href="https://wa.me/541140916878"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle size={16} />
            11-4091-6878
          </a>
        </div>
      </div>
    </section>
  )
}
