import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, Eye, EyeOff, Trash2, Plus, Search, RotateCcw, ArrowUpDown } from "lucide-react"
import { api } from "../api/client"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/Dialog"
import { Spinner } from "../components/ui/Spinner"

/** Property list item from the API. */
interface Property {
  uuid: string
  title: string
  slug: string
  tipo_propiedad: string
  operacion: string
  location: string
  price: number
  currency: string
  price_display: string
  disponible: number
  is_emprendimiento: number
  deleted_at?: string | null
  images?: { uuid: string; file_path: string; sort_order: number }[]
}

/** Paginated API response for properties. */
interface PropertiesResponse {
  properties: Property[]
  total: number
  page: number
  totalPages: number
}

/**
 * Admin properties list page with search, sort, pagination, tabs for
 * active and deleted properties, and action buttons per row.
 */
export default function PropertiesPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"active" | "deleted">("active")

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)

  const limit = 15

  /** Fetches properties from the API with current filters. */
  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === "deleted") {
        const data = await api.get<{ properties: Property[]; total: number }>("/properties/deleted")
        setProperties(data.properties || [])
        setTotal(data.total || 0)
        setTotalPages(1)
      } else {
        const offset = (page - 1) * limit
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
          orderBy: `${sortBy} ${order}`,
        })
        if (search) params.set("search", search)
        const data = await api.get<{ properties: Property[]; total: number }>(`/properties?${params}`)
        setProperties(data.properties || [])
        setTotal(data.total || 0)
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / limit)))
      }
    } catch (err) {
      console.error("Error fetching properties:", err)
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, order, tab])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  /** Toggles sort direction for a given column. */
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setOrder("asc")
    }
    setPage(1)
  }

  /** Toggles the disponible state of a property. */
  const handlePause = async (property: Property) => {
    try {
      await api.put(`/properties/${property.uuid}/pause`, {
        disponible: !property.disponible,
      })
      fetchProperties()
    } catch (err) {
      console.error("Error toggling pause:", err)
    }
  }

  /** Soft-deletes a property after confirmation. */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/properties/${deleteTarget.uuid}`)
      setDeleteTarget(null)
      fetchProperties()
    } catch (err) {
      console.error("Error deleting property:", err)
    } finally {
      setDeleting(false)
    }
  }

  /** Restores a soft-deleted property. */
  const handleRestore = async (uuid: string) => {
    try {
      await api.post(`/properties/${uuid}/restore`)
      fetchProperties()
    } catch (err) {
      console.error("Error restoring property:", err)
    }
  }

  /** Returns the image URL for a property thumbnail. */
  const getImageUrl = (property: Property): string | null => {
    const imgs = property.images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const img = imgs?.[0]
    if (!img) return null
    if (img.file_path.startsWith("http")) return img.file_path
    return `/${img.file_path}`
  }

  /** Renders a sortable column header. */
  const SortableHead = ({ column, label }: { column: string; label: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-gray-700"
      onClick={() => handleSort(column)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
        <Button onClick={() => navigate("/admin/propiedades/nueva")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva propiedad
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "active"
              ? "border-b-2 border-[#3D6B7E] text-[#3D6B7E]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => { setTab("active"); setPage(1) }}
        >
          Activas ({tab === "active" ? total : "..."})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "deleted"
              ? "border-b-2 border-[#3D6B7E] text-[#3D6B7E]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => { setTab("deleted"); setPage(1) }}
        >
          Eliminadas
        </button>
      </div>

      {/* Search (only for active tab) */}
      {tab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por título o dirección..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-500">
              No se encontraron propiedades
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Imagen</TableHead>
                    <SortableHead column="title" label="Título" />
                    <SortableHead column="tipo_propiedad" label="Tipo" />
                    <SortableHead column="operacion" label="Operación" />
                    <SortableHead column="location" label="Localidad" />
                    <SortableHead column="price" label="Precio" />
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((prop) => {
                    const imgUrl = getImageUrl(prop)
                    return (
                      <TableRow key={prop.uuid}>
                        <TableCell>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-10 w-14 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                              Sin img
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {prop.title}
                        </TableCell>
                        <TableCell className="capitalize">{prop.tipo_propiedad}</TableCell>
                        <TableCell className="capitalize">{prop.operacion}</TableCell>
                        <TableCell>{prop.location || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{prop.price_display || `${prop.currency} ${prop.price?.toLocaleString("es-AR")}`}</TableCell>
                        <TableCell>
                          {tab === "deleted" ? (
                            <Badge variant="destructive">Eliminada</Badge>
                          ) : prop.disponible ? (
                            <Badge variant="success">Activa</Badge>
                          ) : (
                            <Badge variant="warning">Pausada</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {tab === "deleted" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(prop.uuid)}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Recuperar
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Editar"
                                  onClick={() => navigate(`/admin/propiedades/${prop.uuid}`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={prop.disponible ? "Pausar" : "Activar"}
                                  onClick={() => handlePause(prop)}
                                >
                                  {prop.disponible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Eliminar"
                                  onClick={() => setDeleteTarget(prop)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination (active tab only) */}
      {tab === "active" && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} ({total} propiedades)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que querés eliminar la propiedad{" "}
            <strong>{deleteTarget?.title}</strong>? Esta acción se puede revertir desde la
            pestaña "Eliminadas".
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner size="sm" className="mr-2" /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
