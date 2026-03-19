import { DollarSign, CreditCard, Info, Tag } from 'lucide-react'

interface Unidad {
  uf: string
  piso: string
  tipo: string
  m2Cub: number
  m2Balcon: number
  m2Total: number
  precioUSD: number | null
  estado: string
}

interface Opcion {
  nombre: string
  detalle: string
}

interface Extra {
  item: string
  precio: string
}

interface FormaPago {
  descripcion: string
  opciones?: Opcion[]
  nota?: string
  extras?: Extra[]
}

interface PricingSectionProps {
  unidades?: Unidad[]
  formaPago?: FormaPago
}

function formatUSD(n: number | null): string {
  if (n === null) return 'A confirmar'
  return 'USD ' + n.toLocaleString('es-AR')
}

export default function PricingSection({ unidades, formaPago }: PricingSectionProps) {
  if (!unidades || unidades.length === 0) return null

  const disponibles = unidades.filter(u => u.estado === 'Disponible')
  const vendidos = unidades.filter(u => u.estado !== 'Disponible')

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-1 bg-brand-teal rounded" />
        <DollarSign size={22} className="text-brand-teal" />
        <h2 className="text-2xl text-brand-black">Precios y unidades</h2>
      </div>

      {/* Units table */}
      {disponibles.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-brand-teal text-sm uppercase tracking-brand mb-3">
            Unidades disponibles ({disponibles.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-gray-light">
                  <th className="text-left px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">Unidad</th>
                  <th className="text-left px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">Piso</th>
                  <th className="text-left px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">Tipo</th>
                  <th className="text-right px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">m² Cub.</th>
                  <th className="text-right px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand hidden sm:table-cell">m² Balcon</th>
                  <th className="text-right px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">m² Total</th>
                  <th className="text-right px-4 py-3 font-display text-brand-black text-xs uppercase tracking-brand">Precio</th>
                </tr>
              </thead>
              <tbody>
                {disponibles.map((u, i) => (
                  <tr key={i} className={`border-t border-gray-100 hover:bg-brand-teal/5 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-display text-brand-black">{u.uf}</td>
                    <td className="px-4 py-3 text-brand-gray">{u.piso}</td>
                    <td className="px-4 py-3 text-brand-gray">{u.tipo}</td>
                    <td className="px-4 py-3 text-brand-gray text-right">{u.m2Cub}</td>
                    <td className="px-4 py-3 text-brand-gray text-right hidden sm:table-cell">{u.m2Balcon}</td>
                    <td className="px-4 py-3 text-brand-black text-right font-display">{u.m2Total}</td>
                    <td className="px-4 py-3 text-right font-display">
                      <span className={u.precioUSD ? 'text-brand-teal' : 'text-brand-gray'}>
                        {formatUSD(u.precioUSD)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sold units summary */}
      {vendidos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-brand-gray text-sm uppercase tracking-brand mb-3">
            Unidades vendidas / reservadas ({vendidos.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 opacity-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-2 text-brand-gray text-xs uppercase tracking-brand">Unidad</th>
                  <th className="text-left px-4 py-2 text-brand-gray text-xs uppercase tracking-brand">Tipo</th>
                  <th className="text-right px-4 py-2 text-brand-gray text-xs uppercase tracking-brand">m² Total</th>
                  <th className="text-right px-4 py-2 text-brand-gray text-xs uppercase tracking-brand">Precio ref.</th>
                </tr>
              </thead>
              <tbody>
                {vendidos.map((u, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-brand-gray">{u.uf}</td>
                    <td className="px-4 py-2 text-brand-gray">{u.tipo}</td>
                    <td className="px-4 py-2 text-brand-gray text-right">{u.m2Total}</td>
                    <td className="px-4 py-2 text-brand-gray text-right line-through">{formatUSD(u.precioUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment info */}
      {formaPago && (
        <div className="space-y-4">
          {/* Main payment description */}
          <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CreditCard size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-brand-black text-sm mb-1">Forma de pago</h3>
                <p className="text-brand-gray text-sm">{formaPago.descripcion}</p>
              </div>
            </div>
          </div>

          {/* Payment options */}
          {formaPago.opciones && formaPago.opciones.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formaPago.opciones.map((opc, i) => (
                <div key={i} className="bg-brand-gray-light rounded-xl p-4">
                  <h4 className="font-display text-brand-teal text-xs uppercase tracking-brand mb-2">{opc.nombre}</h4>
                  <p className="text-brand-gray text-sm leading-relaxed">{opc.detalle}</p>
                </div>
              ))}
            </div>
          )}

          {/* Extras */}
          {formaPago.extras && formaPago.extras.length > 0 && (
            <div className="bg-brand-gray-light rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-brand-teal" />
                <h4 className="font-display text-brand-black text-sm">Adicionales</h4>
              </div>
              <div className="space-y-2">
                {formaPago.extras.map((extra, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-brand-gray">{extra.item}</span>
                    <span className="font-display text-brand-teal ml-4 whitespace-nowrap">{extra.precio}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {formaPago.nota && (
            <div className="flex items-start gap-2 text-xs text-brand-gray">
              <Info size={14} className="text-brand-teal flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{formaPago.nota}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
