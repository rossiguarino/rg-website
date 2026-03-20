const TIPOS_PROPIEDAD = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local comercial' },
]

interface Props {
  operacion: 'venta' | 'alquiler'
  onOperacionChange: (op: 'venta' | 'alquiler') => void
  tipoPropiedad: string
  onTipoPropiedadChange: (tipo: string) => void
  availableTipos: string[]
  ambientes: number[]
  onAmbientesChange: (amb: number[]) => void
  localidad: string
  onLocalidadChange: (loc: string) => void
  locations: string[]
  sortOrder: 'asc' | 'desc'
  onSortChange: (sort: 'asc' | 'desc') => void
  totalResults: number
}

export default function PropiedadesFilters({
  operacion,
  onOperacionChange,
  tipoPropiedad,
  onTipoPropiedadChange,
  availableTipos,
  ambientes,
  onAmbientesChange,
  localidad,
  onLocalidadChange,
  locations,
  sortOrder,
  onSortChange,
  totalResults,
}: Props) {
  const ambientesOptions = [1, 2, 3, 4]

  const toggleAmbiente = (value: number) => {
    if (ambientes.includes(value)) {
      onAmbientesChange(ambientes.filter((a) => a !== value))
    } else {
      onAmbientesChange([...ambientes, value])
    }
  }

  const hasActiveFilters = tipoPropiedad || localidad || ambientes.length > 0

  const clearFilters = () => {
    onTipoPropiedadChange('')
    onLocalidadChange('')
    onAmbientesChange([])
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Operation toggle + results */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onOperacionChange('venta')}
            className={`px-4 py-1.5 text-xs font-display tracking-brand-wide uppercase transition-colors ${
              operacion === 'venta'
                ? 'bg-gray-500 text-white'
                : 'bg-white text-brand-gray hover:bg-brand-gray-light'
            }`}
          >
            Venta
          </button>
          <button
            onClick={() => onOperacionChange('alquiler')}
            className={`px-4 py-1.5 text-xs font-display tracking-brand-wide uppercase transition-colors ${
              operacion === 'alquiler'
                ? 'bg-gray-500 text-white'
                : 'bg-white text-brand-gray hover:bg-brand-gray-light'
            }`}
          >
            Alquiler
          </button>
        </div>

        {/* Results count */}
        <span className="text-brand-gray text-sm">
          {totalResults} {totalResults === 1 ? 'propiedad' : 'propiedades'}
        </span>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-brand-teal text-xs uppercase tracking-brand-wide font-display hover:text-brand-teal-dark transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Tipo de propiedad */}
        <div className="flex items-center gap-2">
          <span className="text-brand-gray text-xs uppercase tracking-brand-wide font-display">Tipo:</span>
          <select
            value={tipoPropiedad}
            onChange={(e) => onTipoPropiedadChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30 cursor-pointer"
          >
            <option value="">Todos</option>
            {TIPOS_PROPIEDAD
              .filter((tipo) => availableTipos.includes(tipo.value))
              .map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
          </select>
        </div>

        {/* Localidad */}
        {locations.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-brand-gray text-xs uppercase tracking-brand-wide font-display">Localidad:</span>
            <select
              value={localidad}
              onChange={(e) => onLocalidadChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30 cursor-pointer"
            >
              <option value="">Todas</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ambientes filter */}
        <div className="flex items-center gap-2">
          <span className="text-brand-gray text-xs uppercase tracking-brand-wide font-display">Ambientes:</span>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onAmbientesChange([])}
              className={`px-3 py-1.5 text-xs font-display tracking-brand transition-colors ${
                ambientes.length === 0
                  ? 'bg-gray-500 text-white'
                  : 'bg-white text-brand-gray hover:bg-brand-gray-light'
              }`}
            >
              Todos
            </button>
            {ambientesOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => toggleAmbiente(opt)}
                className={`px-3 py-1.5 text-xs font-display tracking-brand transition-colors ${
                  ambientes.includes(opt)
                    ? 'bg-gray-500 text-white'
                    : 'bg-white text-brand-gray hover:bg-brand-gray-light'
                }`}
              >
                {opt === 4 ? '4+' : opt}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-brand-gray text-xs uppercase tracking-brand-wide font-display">Ordenar:</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30 cursor-pointer"
          >
            <option value="asc">Menor precio</option>
            <option value="desc">Mayor precio</option>
          </select>
        </div>
      </div>
    </div>
  )
}
