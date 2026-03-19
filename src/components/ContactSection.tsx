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
        <p className="text-brand-gray max-w-3xl mx-auto mb-8 font-accent text-lg md:text-xl lg:text-2xl italic">
          Estamos para ayudarte a encontrar tu proxima inversion
        </p>
        <div className="inline-flex items-center gap-3 bg-brand-teal/10 rounded-lg px-8 py-4 border border-brand-teal/20">
          <p className="text-brand-gray text-sm tracking-brand">
            Proximamente nuestros canales de contacto
          </p>
        </div>
      </div>
    </section>
  )
}
