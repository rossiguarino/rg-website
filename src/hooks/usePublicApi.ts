import { useState, useEffect } from 'react'
import propertiesJson from '../data/properties.json'
import propiedadesJson from '../data/propiedades.json'
import type { Propiedad } from '../types/propiedad'

/**
 * Base URL for public API endpoints.
 * In dev mode uses localhost:3001, in production uses relative path.
 */
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api/public' : '/api/public'

/**
 * Fetches data from the public API.
 * @param path - API path (e.g., '/properties', '/emprendimientos')
 * @returns Parsed JSON response
 */
export async function fetchPublicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json() as Promise<T>
}

/** Property shape as returned by the public API. */
export interface PublicProperty {
  uuid: string
  slug: string
  title: string
  address: string
  location: string
  description: string
  operacion: string
  tipo_propiedad: string
  is_emprendimiento: number
  ambientes: number
  dormitorios: number
  banos: number
  superficie_total: number
  superficie_cubierta: number
  price: number
  currency: string
  price_display: string
  expensas: number
  expensas_display: string
  developer: string
  total_units: string
  available_apartments: number
  construction_status: string
  price_from: number
  is_new: number
  is_coming_soon: number
  contact_enabled: number
  destacada: number
  disponible: number
  images: string[]
  features: string[]
}

/**
 * Converts a static emprendimiento JSON entry to PublicProperty shape.
 * Used as fallback when the API is unavailable.
 */
function emprendimientoToPublic(p: typeof propertiesJson[0]): PublicProperty {
  return {
    uuid: p.id,
    slug: p.slug,
    title: p.name,
    address: p.address,
    location: p.location,
    description: p.description,
    operacion: 'venta',
    tipo_propiedad: 'departamento',
    is_emprendimiento: 1,
    ambientes: 0,
    dormitorios: 0,
    banos: 0,
    superficie_total: 0,
    superficie_cubierta: 0,
    price: p.priceFrom,
    currency: 'USD',
    price_display: p.priceDisplay,
    expensas: 0,
    expensas_display: '',
    developer: p.developer,
    total_units: p.totalUnits,
    available_apartments: p.availableApartments,
    construction_status: p.constructionStatus,
    price_from: p.priceFrom,
    is_new: 0,
    is_coming_soon: 0,
    contact_enabled: 1,
    destacada: 0,
    disponible: 1,
    images: p.images,
    features: p.features,
  }
}

/**
 * Converts a static propiedad JSON entry to PublicProperty shape.
 * Used as fallback when the API is unavailable.
 */
function propiedadToPublic(p: Propiedad): PublicProperty {
  return {
    uuid: p.id,
    slug: p.slug,
    title: p.title,
    address: p.address,
    location: p.location,
    description: p.description,
    operacion: p.operacion,
    tipo_propiedad: p.tipoPropiedad,
    is_emprendimiento: 0,
    ambientes: p.ambientes,
    dormitorios: p.dormitorios,
    banos: p.banos,
    superficie_total: p.superficieTotal,
    superficie_cubierta: p.superficieCubierta,
    price: p.price,
    currency: p.currency,
    price_display: p.priceDisplay,
    expensas: p.expensas || 0,
    expensas_display: p.expensasDisplay || '',
    developer: '',
    total_units: '',
    available_apartments: 0,
    construction_status: '',
    price_from: 0,
    is_new: 0,
    is_coming_soon: 0,
    contact_enabled: 1,
    destacada: p.destacada ? 1 : 0,
    disponible: p.disponible ? 1 : 0,
    images: p.images,
    features: p.features,
  }
}

/**
 * Hook to fetch propiedades from the public API.
 * Falls back to static JSON if API is unavailable.
 */
export function usePropiedades(operacion?: string) {
  const [properties, setProperties] = useState<PublicProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ is_emprendimiento: 'false' })
    if (operacion) params.set('operacion', operacion)

    fetchPublicApi<{ properties: PublicProperty[] }>(`/properties?${params}`)
      .then((data) => setProperties(data.properties))
      .catch(() => {
        // Fallback to static JSON
        const fallback = (propiedadesJson as Propiedad[])
          .filter((p) => p.disponible)
          .map(propiedadToPublic)
        setProperties(fallback)
      })
      .finally(() => setLoading(false))
  }, [operacion])

  return { properties, loading }
}

/**
 * Hook to fetch emprendimientos from the public API.
 * Falls back to static JSON if API is unavailable.
 */
export function useEmprendimientos() {
  const [properties, setProperties] = useState<PublicProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicApi<{ properties: PublicProperty[] }>('/emprendimientos')
      .then((data) => setProperties(data.properties))
      .catch(() => {
        // Fallback to static JSON
        const fallback = propertiesJson.map(emprendimientoToPublic)
        setProperties(fallback)
      })
      .finally(() => setLoading(false))
  }, [])

  return { properties, loading }
}

/**
 * Hook to fetch a single property by slug from the public API.
 * Falls back to static JSON if API is unavailable.
 */
export function usePropertyBySlug(slug: string | undefined) {
  const [property, setProperty] = useState<PublicProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPublicApi<PublicProperty>(`/properties/${slug}`)
      .then((data) => setProperty(data))
      .catch(() => {
        // Fallback: try static JSON
        const fromPropiedades = (propiedadesJson as Propiedad[]).find((p) => p.slug === slug)
        if (fromPropiedades) {
          setProperty(propiedadToPublic(fromPropiedades))
        } else {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  return { property, loading, notFound }
}

/**
 * Gets the full image URL for a public property image path.
 * @param imagePath - Relative path like "uploads/properties/uuid/file.jpg"
 */
export function getPublicImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) return imagePath
  const base = import.meta.env.DEV ? 'http://localhost:3001' : ''
  return `${base}/${imagePath}`
}
