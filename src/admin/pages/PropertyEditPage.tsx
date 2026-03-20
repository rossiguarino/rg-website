import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, Plus, Trash2, GripVertical, ArrowLeft, Upload, ImagePlus } from "lucide-react"
import { api } from "../api/client"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Textarea } from "../components/ui/Textarea"
import { Switch } from "../components/ui/Switch"
import { Badge } from "../components/ui/Badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table"
import { Spinner } from "../components/ui/Spinner"

/** Zod schema matching the API field names exactly. */
const propertySchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  address: z.string().default(""),
  location: z.string().default(""),
  description: z.string().default(""),
  operacion: z.string().min(1, "La operación es requerida"),
  tipo_propiedad: z.string().min(1, "El tipo es requerido"),
  is_emprendimiento: z.boolean().default(false),
  ambientes: z.coerce.number().int().min(0).default(0),
  dormitorios: z.coerce.number().int().min(0).default(0),
  banos: z.coerce.number().int().min(0).default(0),
  superficie_total: z.coerce.number().min(0).default(0),
  superficie_cubierta: z.coerce.number().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().default("USD"),
  price_display: z.string().default(""),
  expensas: z.coerce.number().min(0).default(0),
  expensas_display: z.string().default(""),
  developer: z.string().default(""),
  total_units: z.string().default(""),
  available_apartments: z.coerce.number().int().min(0).default(0),
  construction_status: z.string().default(""),
  price_from: z.coerce.number().min(0).default(0),
  is_new: z.boolean().default(false),
  is_coming_soon: z.boolean().default(false),
  contact_enabled: z.boolean().default(true),
  destacada: z.boolean().default(false),
  disponible: z.boolean().default(true),
  features: z.array(
    z.object({ feature: z.string().min(1, "El texto es requerido") })
  ).default([]),
})

type PropertyFormData = z.infer<typeof propertySchema>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolver = zodResolver(propertySchema) as any

/** Image from the API. */
interface PropertyImage {
  uuid: string
  file_path: string
  sort_order: number
}

/** Audit log entry from the property history endpoint. */
interface AuditEntry {
  id: number
  user_uuid: string
  user_name: string
  action: string
  entity_type: string
  entity_uuid: string
  entity_name: string
  details: string
  created_at: string
}

/**
 * Property edit page with full form organized in sections,
 * features management, image display, and audit history.
 */
export default function PropertyEditPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver,
    defaultValues: {
      features: [],
      currency: "USD",
      disponible: true,
      contact_enabled: true,
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "features",
  })

  const isEmprendimiento = watch("is_emprendimiento")

  useEffect(() => {
    if (!uuid) return
    async function fetchProperty() {
      try {
        const prop = await api.get<Record<string, unknown>>(`/properties/${uuid}`)

        // Features come as string[] from API — map to form shape
        const featuresArr = Array.isArray(prop.features)
          ? (prop.features as string[]).map((f) => ({ feature: f }))
          : []

        reset({
          title: (prop.title as string) || "",
          slug: (prop.slug as string) || "",
          address: (prop.address as string) || "",
          location: (prop.location as string) || "",
          description: (prop.description as string) || "",
          operacion: (prop.operacion as string) || "",
          tipo_propiedad: (prop.tipo_propiedad as string) || "",
          is_emprendimiento: !!prop.is_emprendimiento,
          ambientes: (prop.ambientes as number) || 0,
          dormitorios: (prop.dormitorios as number) || 0,
          banos: (prop.banos as number) || 0,
          superficie_total: (prop.superficie_total as number) || 0,
          superficie_cubierta: (prop.superficie_cubierta as number) || 0,
          price: (prop.price as number) || 0,
          currency: (prop.currency as string) || "USD",
          price_display: (prop.price_display as string) || "",
          expensas: (prop.expensas as number) || 0,
          expensas_display: (prop.expensas_display as string) || "",
          developer: (prop.developer as string) || "",
          total_units: (prop.total_units as string) || "",
          available_apartments: (prop.available_apartments as number) || 0,
          construction_status: (prop.construction_status as string) || "",
          price_from: (prop.price_from as number) || 0,
          is_new: !!prop.is_new,
          is_coming_soon: !!prop.is_coming_soon,
          contact_enabled: prop.contact_enabled !== 0 && prop.contact_enabled !== false,
          destacada: !!prop.destacada,
          disponible: prop.disponible !== 0 && prop.disponible !== false,
          features: featuresArr,
        })

        if (Array.isArray(prop.images)) {
          setImages(
            (prop.images as PropertyImage[]).sort((a, b) => a.sort_order - b.sort_order)
          )
        }

        // Fetch audit log for this property
        try {
          const audit = await api.get<{ entries: AuditEntry[] }>(`/audit-log/property/${uuid}`)
          setAuditLog(Array.isArray(audit.entries) ? audit.entries : [])
        } catch {
          // audit log might not exist yet
        }
      } catch (err) {
        console.error("Error fetching property:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [uuid, reset])

  /** Saves the property data to the API. */
  const onSubmit = async (data: PropertyFormData) => {
    if (!uuid) return
    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)
    try {
      // Convert features from form shape {feature: string}[] to string[]
      const payload = {
        ...data,
        features: data.features.map((f) => f.feature),
      }
      await api.put(`/properties/${uuid}`, payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  /** Gets the full image URL for display. */
  const getImageUrl = (img: PropertyImage): string => {
    if (img.file_path.startsWith("http")) return img.file_path
    const base = import.meta.env.DEV ? "http://localhost:3001" : ""
    return `${base}/${img.file_path}`
  }

  /** Deletes a property image via API. */
  const handleDeleteImage = async (imageUuid: string) => {
    try {
      await api.delete(`/properties/${uuid}/images/${imageUuid}`)
      setImages((prev) => prev.filter((i) => i.uuid !== imageUuid))
    } catch (err) {
      console.error("Error deleting image:", err)
    }
  }

  /** Uploads selected files to the server. */
  const handleUploadImages = async (files: FileList | File[]) => {
    if (!uuid || files.length === 0) return
    setUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append("images", file))
      const result = await api.upload<{ images: PropertyImage[] }>(
        `/properties/${uuid}/images`,
        formData
      )
      setImages((prev) => [...prev, ...(result.images || [])])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imágenes")
    } finally {
      setUploading(false)
    }
  }

  /** Handles file input change. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadImages(e.target.files)
      e.target.value = "" // reset so same file can be re-selected
    }
  }

  /** Handles drag-and-drop. */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      handleUploadImages(e.dataTransfer.files)
    }
  }

  /** Formats a details string as pretty JSON if possible. */
  const formatDetails = (details: string): string => {
    try {
      return JSON.stringify(JSON.parse(details), null, 2)
    } catch {
      return details || "{}"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/propiedades")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Editar propiedad</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="title"
              label="Título"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              id="slug"
              label="Slug"
              error={errors.slug?.message}
              {...register("slug")}
            />
            <Input
              id="address"
              label="Dirección"
              {...register("address")}
            />
            <Input
              id="location"
              label="Localidad"
              {...register("location")}
            />
            <div className="md:col-span-2">
              <Textarea
                id="description"
                label="Descripción"
                rows={4}
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operation & type */}
        <Card>
          <CardHeader>
            <CardTitle>Operación y tipo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Operación</label>
              <Controller
                control={control}
                name="operacion"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.operacion && (
                <p className="text-xs text-red-600">{errors.operacion.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tipo de propiedad</label>
              <Controller
                control={control}
                name="tipo_propiedad"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="ph">PH</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="cochera">Cochera</SelectItem>
                      <SelectItem value="galpon">Galpón</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Controller
                control={control}
                name="is_emprendimiento"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label className="text-sm font-medium text-gray-700">Es emprendimiento</label>
            </div>
          </CardContent>
        </Card>

        {/* Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Números</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Input id="ambientes" label="Ambientes" type="number" {...register("ambientes")} />
            <Input id="dormitorios" label="Dormitorios" type="number" {...register("dormitorios")} />
            <Input id="banos" label="Baños" type="number" {...register("banos")} />
            <Input id="superficie_total" label="Sup. total (m²)" type="number" {...register("superficie_total")} />
            <Input id="superficie_cubierta" label="Sup. cubierta (m²)" type="number" {...register("superficie_cubierta")} />
          </CardContent>
        </Card>

        {/* Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input id="price" label="Precio" type="number" {...register("price")} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Moneda</label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="ARS">ARS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Input id="price_display" label="Precio display" {...register("price_display")} />
            <Input id="expensas" label="Expensas" type="number" {...register("expensas")} />
            <Input id="expensas_display" label="Expensas display" {...register("expensas_display")} />
          </CardContent>
        </Card>

        {/* Emprendimiento (conditional) */}
        {isEmprendimiento && (
          <Card>
            <CardHeader>
              <CardTitle>Emprendimiento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input id="developer" label="Developer" {...register("developer")} />
              <Input id="total_units" label="Unidades totales" {...register("total_units")} />
              <Input id="available_apartments" label="Departamentos disponibles" type="number" {...register("available_apartments")} />
              <Input id="construction_status" label="Estado de obra" {...register("construction_status")} />
              <Input id="price_from" label="Precio desde" type="number" {...register("price_from")} />
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Características</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ feature: "" })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500">No hay características. Hacé click en "Agregar" para añadir una.</p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-400" />
                    <Input
                      placeholder="Ej: Piscina, SUM, Cochera..."
                      className="flex-1"
                      error={errors.features?.[index]?.feature?.message}
                      {...register(`features.${index}.feature`)}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => move(index, index - 1)}
                        title="Subir"
                      >
                        ↑
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Imágenes ({images.length})</CardTitle>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <Upload className="h-3.5 w-3.5" />
                Subir imágenes
              </span>
            </label>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-[#3D6B7E] hover:bg-gray-100"
            >
              <ImagePlus className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {uploading ? "Subiendo..." : "Arrastrá imágenes acá o usá el botón \"Subir imágenes\""}
              </p>
              <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP, AVIF, GIF — Máximo 10MB por archivo</p>
              {uploading && <Spinner size="sm" className="mt-2" />}
            </div>

            {uploadError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{uploadError}</div>
            )}

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((img) => (
                  <div key={img.uuid} className="group relative">
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="h-24 w-full rounded-md object-cover"
                    />
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs">
                        #{img.sort_order + 1}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.uuid)}
                      className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow group-hover:block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration switches */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(
                [
                  { name: "is_new" as const, label: "Es nueva" },
                  { name: "is_coming_soon" as const, label: "Próximamente" },
                  { name: "contact_enabled" as const, label: "Contacto habilitado" },
                  { name: "destacada" as const, label: "Destacada" },
                  { name: "disponible" as const, label: "Disponible" },
                ] as const
              ).map(({ name, label }) => (
                <div key={name} className="flex items-center gap-3">
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar cambios
          </Button>
          {saveSuccess && (
            <span className="text-sm font-medium text-green-600">Guardado correctamente</span>
          )}
          {saveError && <span className="text-sm font-medium text-red-600">{saveError}</span>}
        </div>
      </form>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de cambios</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-gray-500">Sin historial de cambios.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.user_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-500">
                      {formatDetails(entry.details || "{}")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
