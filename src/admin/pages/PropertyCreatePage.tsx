import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, Plus, Trash2, GripVertical, ArrowLeft, ImagePlus } from "lucide-react"
import { api } from "../api/client"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Textarea } from "../components/ui/Textarea"
import { Switch } from "../components/ui/Switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
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

/**
 * Property creation page with the same form layout as the edit page.
 * Calls POST /api/properties and redirects to the edit page on success.
 */
export default function PropertyCreatePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver,
    defaultValues: {
      currency: "USD",
      disponible: true,
      contact_enabled: true,
      is_emprendimiento: false,
      is_new: false,
      is_coming_soon: false,
      destacada: false,
      features: [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "features",
  })

  const isEmprendimiento = watch("is_emprendimiento")

  /** Creates the property via API and redirects to edit page. */
  const onSubmit = async (data: PropertyFormData) => {
    setSaving(true)
    setSaveError("")
    try {
      // Convert features from form shape {feature: string}[] to string[]
      const payload = {
        ...data,
        features: data.features.map((f) => f.feature),
      }
      const result = await api.post<{ uuid: string }>("/properties", payload)
      navigate(`/admin/propiedades/${result.uuid}`, { replace: true })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al crear la propiedad")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/propiedades")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva propiedad</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input id="title" label="Título" error={errors.title?.message} {...register("title")} />
            <Input id="slug" label="Slug" error={errors.slug?.message} {...register("slug")} />
            <Input id="address" label="Dirección" {...register("address")} />
            <Input id="location" label="Localidad" {...register("location")} />
            <div className="md:col-span-2">
              <Textarea id="description" label="Descripción" rows={4} {...register("description")} />
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
              {errors.operacion && <p className="text-xs text-red-600">{errors.operacion.message}</p>}
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
            <Button type="button" variant="outline" size="sm" onClick={() => append({ feature: "" })}>
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
                      <Button type="button" variant="ghost" size="icon" onClick={() => move(index, index - 1)} title="Subir">
                        ↑
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images — info note */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
              <ImagePlus className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">
                Primero creá la propiedad, después vas a poder subir imágenes desde la página de edición.
              </p>
            </div>
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
            Crear propiedad
          </Button>
          {saveError && <span className="text-sm font-medium text-red-600">{saveError}</span>}
        </div>
      </form>
    </div>
  )
}
