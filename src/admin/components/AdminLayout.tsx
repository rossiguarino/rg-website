import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { BarChart3, Building2, Users, History, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Badge } from "./ui/Badge"
import { Button } from "./ui/Button"
import { cn } from "@/lib/utils"

/** Navigation item definition. */
interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: <BarChart3 className="h-5 w-5" /> },
  { label: "Propiedades", to: "/admin/propiedades", icon: <Building2 className="h-5 w-5" /> },
  { label: "Usuarios", to: "/admin/usuarios", icon: <Users className="h-5 w-5" />, adminOnly: true },
  { label: "Historial", to: "/admin/historial", icon: <History className="h-5 w-5" /> },
]

/**
 * Main admin layout with collapsible sidebar, header bar, and content area.
 * Renders nested routes via Outlet.
 */
export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <span className="text-xl font-bold text-[#3D6B7E]">RG Admin</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#3D6B7E]/10 text-[#3D6B7E]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-gray-500" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {user?.first_name} {user?.last_name}
              </span>
              <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                {user?.role === "admin" ? "Admin" : "Colaborador"}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
