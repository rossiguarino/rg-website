import SearchBar from './SearchBar'

export default function SearchSection() {
  return (
    <section
      id="buscador"
      className="scroll-mt-20 bg-brand-gray-light py-12 md:py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-brand-teal text-xs uppercase tracking-brand-wide mb-3 font-display">
            Encontra lo que buscas
          </p>
          <h2 className="text-2xl md:text-3xl text-brand-black mb-2">
            Busca tu proxima inversion
          </h2>
          <div className="w-10 h-px bg-brand-teal mx-auto mt-3 mb-2" />
        </div>
        <SearchBar />
      </div>
    </section>
  )
}
