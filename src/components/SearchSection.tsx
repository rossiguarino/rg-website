import SearchBar from './SearchBar'

export default function SearchSection() {
  return (
    <section
      id="buscador"
      className="scroll-mt-20 bg-gray-100 py-12 md:py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-brand-teal text-xs uppercase tracking-brand-wide mb-3 font-display">
            Encontra lo que buscas
          </p>
          <h2 className="text-3xl md:text-4xl text-brand-black mb-3">
            Busca tu proxima inversion
          </h2>
          <div className="w-12 h-px bg-brand-teal mx-auto mb-2" />
        </div>
        <SearchBar />
      </div>
    </section>
  )
}
