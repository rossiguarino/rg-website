export interface Propiedad {
  id: string
  slug: string
  title: string
  operacion: 'venta' | 'alquiler'
  tipoPropiedad: string
  ambientes: number
  dormitorios: number
  banos: number
  superficieTotal: number
  superficieCubierta: number
  address: string
  location: string
  price: number
  currency: string
  priceDisplay: string
  expensas: number | null
  expensasDisplay: string | null
  description: string
  features: string[]
  images: string[]
  destacada: boolean
  disponible: boolean
}
