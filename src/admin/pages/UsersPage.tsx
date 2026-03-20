import { useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { api } from "../api/client"
import { useAuth } from "../context/AuthContext"
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select"
import { Spinner } from "../components/ui/Spinner"

const userSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().default(""),
  password: z.string().default(""),
  role: z.string().min(1, "El rol es requerido"),
})

type UserFormData = z.infer<typeof userSchema>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userResolver = zodResolver(userSchema) as any

/** User from the API. */
interface User {
  uuid: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
}

/**
 * Users management page with table, create/edit dialog, and delete confirmation.
 * Only accessible to admin role users.
 */
export default function UsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState("")

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: userResolver,
    defaultValues: { role: "collaborator" },
  })

  /** Fetches the list of users from the API. */
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: User[]; total: number }>("/users")
      setUsers(data.users || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  /** Opens the dialog to create a new user. */
  const handleCreate = () => {
    setEditingUser(null)
    setFormError("")
    reset({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role: "collaborator",
    })
    setDialogOpen(true)
  }

  /** Opens the dialog to edit an existing user. */
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormError("")
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
    })
    setDialogOpen(true)
  }

  /** Submits the user create/edit form. */
  const onSubmit = async (data: UserFormData) => {
    setSubmitting(true)
    setFormError("")
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = { ...data }
        if (!data.password) delete payload.password
        await api.put(`/users/${editingUser.uuid}`, payload)
      } else {
        if (!data.password) {
          setFormError("La contraseña es requerida para usuarios nuevos")
          setSubmitting(false)
          return
        }
        await api.post("/users", data)
      }
      setDialogOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  /** Deletes a user after confirmation. */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteTarget.uuid}`)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
    } finally {
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No tenés permisos para acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-500">
              No hay usuarios registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uuid}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "Colaborador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(user)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar usuario" : "Nuevo usuario"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="Nombre"
                error={errors.first_name?.message}
                {...register("first_name")}
              />
              <Input
                id="last_name"
                label="Apellido"
                error={errors.last_name?.message}
                {...register("last_name")}
              />
            </div>
            <Input
              id="email"
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="phone"
              label="Teléfono (opcional)"
              {...register("phone")}
            />
            <Input
              id="password"
              label={editingUser ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {formError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{formError}</div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" className="mr-2" /> : null}
                {editingUser ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que querés eliminar al usuario{" "}
            <strong>
              {deleteTarget?.first_name} {deleteTarget?.last_name}
            </strong>
            ?
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
