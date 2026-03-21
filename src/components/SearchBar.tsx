import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { fetchPublicApi } from '../hooks/usePublicApi'

interface FilterOptions {
  locations: string[]
  tiposPropiedad: string[]
  ambientes: number[]
}

/** Fixed property types - always shown regardless of current data */
const TIPOS_PROPIEDAD = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'ph', label: 'PH' },
  { value: 'local comercial', label: 'Local comercial' },
]

export default function SearchBar() {
  const navigate = useNavigate()
  const [options, setOptions] = useState<FilterOptions>({
    locations: [],
    tiposPropiedad: [],
    ambientes: [],
  })

  const [operacion, setOperacion] = useState('')
  const [tipoPropiedad, setTipoPropiedad] = useState('')
  const [ambientes, setAmbientes] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    fetchPublicApi<FilterOptions>('/filter-options')
      .then(setOptions)
      .catch(() => {
        // Fallback: use defaults
        setOptions({
          locations: ['Merlo', 'Padua', 'Ituzaingo'],
          tiposPropiedad: ['departamento', 'casa', 'local'],
          ambientes: [1, 2, 3, 4],
        })
      })
  }, [])

  const handleSearch = () => {
    // "Venta en pozo" → emprendimientos page
    if (operacion === 'pozo') {
      const params = new URLSearchParams()
      if (tipoPropiedad) params.set('tipo', tipoPropiedad)
      if (location) params.set('localidad', location)
      const qs = params.toString()
      navigate(`/emprendimientos${qs ? `?${qs}` : ''}`)
      return
    }

    const params = new URLSearchParams()
    if (operacion) params.set('operacion', operacion)
    if (tipoPropiedad) params.set('tipo', tipoPropiedad)
    if (ambientes) params.set('ambientes', ambientes)
    if (location) params.set('localidad', location)

    navigate(`/propiedades?${params.toString()}`)
  }

  const selectClass =
    'w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-brand-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors'

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Operacion */}
          <div>
            <label className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
              Operacion
            </label>
            <select
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
              className={selectClass}
            >
              <option value="">Todas</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="pozo">Venta en pozo</option>
            </select>
          </div>

          {/* Tipo de propiedad */}
          <div>
            <label className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
              Tipo de propiedad
            </label>
            <select
              value={tipoPropiedad}
              onChange={(e) => setTipoPropiedad(e.target.value)}
              className={selectClass}
            >
              <option value="">Todas</option>
              {TIPOS_PROPIEDAD.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ambientes */}
          <div>
            <label className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
              Ambientes
            </label>
            <select
              value={ambientes}
              onChange={(e) => setAmbientes(e.target.value)}
              className={selectClass}
            >
              <option value="">Todos</option>
              <option value="1">1 ambiente</option>
              <option value="2">2 ambientes</option>
              <option value="3">3 ambientes</option>
              <option value="4">4+ ambientes</option>
            </select>
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
              Localidad
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectClass}
            >
              <option value="">Todas</option>
              {options.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-2.5 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}
