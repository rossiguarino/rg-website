import { useEffect, useState, useCallback } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { api } from "../api/client"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select"
import { Spinner } from "../components/ui/Spinner"

/** Audit log entry from the API. */
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

/** User for filter dropdown. */
interface User {
  uuid: string
  first_name: string
  last_name: string
}

/** Audit log API response. */
interface AuditLogResponse {
  entries: AuditEntry[]
  total: number
}

/**
 * Audit log page showing a paginated, filterable table of all system actions.
 * Supports expandable rows to view full details JSON.
 */
export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  // Filters
  const [filterUser, setFilterUser] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [filterEntity, setFilterEntity] = useState("")

  const limit = 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  /** Fetches audit log entries with current filters. */
  const fetchLog = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String((page - 1) * limit),
      })
      if (filterUser) params.set("user_uuid", filterUser)
      if (filterAction) params.set("action", filterAction)
      if (filterEntity) params.set("entity_type", filterEntity)

      const data = await api.get<AuditLogResponse>(`/audit-log?${params}`)
      setEntries(data.entries || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error("Error fetching audit log:", err)
    } finally {
      setLoading(false)
    }
  }, [page, filterUser, filterAction, filterEntity])

  /** Fetches users for the filter dropdown. */
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: User[]; total: number }>("/users")
      setUsers(data.users || [])
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  /** Formats a details string as pretty JSON if possible. */
  const formatDetails = (details: string): string => {
    try {
      return JSON.stringify(JSON.parse(details), null, 2)
    } catch {
      return details || "{}"
    }
  }

  /** Maps action strings to badge variants. */
  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
      create: "success",
      update: "default",
      delete: "destructive",
      restore: "warning",
      pause: "secondary",
      login: "secondary",
    }
    return variants[action] || "secondary"
  }

  /** Maps action strings to Spanish labels. */
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Crear",
      update: "Actualizar",
      delete: "Eliminar",
      restore: "Restaurar",
      pause: "Pausar",
      login: "Login",
    }
    return labels[action] || action
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Historial de actividad</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select value={filterUser || "all"} onValueChange={(v) => { setFilterUser(v === "all" ? "" : v); setPage(1) }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.uuid} value={u.uuid}>
                  {u.first_name} {u.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filterAction || "all"} onValueChange={(v) => { setFilterAction(v === "all" ? "" : v); setPage(1) }}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las acciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="create">Crear</SelectItem>
              <SelectItem value="update">Actualizar</SelectItem>
              <SelectItem value="delete">Eliminar</SelectItem>
              <SelectItem value="restore">Restaurar</SelectItem>
              <SelectItem value="pause">Pausar</SelectItem>
              <SelectItem value="login">Login</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filterEntity || "all"} onValueChange={(v) => { setFilterEntity(v === "all" ? "" : v); setPage(1) }}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las entidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las entidades</SelectItem>
              <SelectItem value="property">Propiedad</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-500">
              No se encontraron registros
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Nombre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="contents">
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setExpandedRow(expandedRow === entry.id ? null : entry.id)
                        }
                      >
                        <TableCell className="w-8">
                          {expandedRow === entry.id ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.user_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadge(entry.action)}>
                            {getActionLabel(entry.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {entry.entity_type}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-500">
                          {entry.entity_name || "-"}
                        </TableCell>
                      </TableRow>
                      {expandedRow === entry.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <pre className="max-h-64 overflow-auto rounded-md bg-gray-100 p-3 text-xs text-gray-700">
                              {formatDetails(entry.details || "{}")}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} ({total} registros)
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
    </div>
  )
}
