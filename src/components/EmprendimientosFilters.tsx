interface Props {
  selectedLocations: string[]
  onLocationsChange: (locs: string[]) => void
  sortOrder: 'asc' | 'desc'
  onSortChange: (sort: 'asc' | 'desc') => void
  locations: string[]
  totalResults: number
}

export default function EmprendimientosFilters({
  selectedLocations,
  onLocationsChange,
  sortOrder,
  onSortChange,
  locations,
  totalResults,
}: Props) {
  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      onLocationsChange(selectedLocations.filter((l) => l !== loc))
    } else {
      onLocationsChange([...selectedLocations, loc])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {/* Location filter */}
      <div className="flex items-center gap-2">
        <span className="text-brand-gray text-xs uppercase tracking-brand-wide font-display">Localidad:</span>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onLocationsChange([])}
            className={`px-3 py-1.5 text-xs font-display tracking-brand transition-colors ${
              selectedLocations.length === 0
                ? 'bg-gray-500 text-white'
                : 'bg-white text-brand-gray hover:bg-brand-gray-light'
            }`}
          >
            Todas
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => toggleLocation(loc)}
              className={`px-3 py-1.5 text-xs font-display tracking-brand transition-colors ${
                selectedLocations.includes(loc)
                  ? 'bg-gray-500 text-white'
                  : 'bg-white text-brand-gray hover:bg-brand-gray-light'
              }`}
            >
              {loc}
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

      {/* Results count */}
      <span className="text-brand-gray text-sm">
        {totalResults} {totalResults === 1 ? 'emprendimiento' : 'emprendimientos'}
      </span>
    </div>
  )
}
