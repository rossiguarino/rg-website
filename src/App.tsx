import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import PropiedadesPage from './pages/PropiedadesPage'
import PropiedadDetailPage from './pages/PropiedadDetailPage'
import EmprendimientosPage from './pages/EmprendimientosPage'
import NosotrosPage from './pages/NosotrosPage'

// Admin imports
import { AuthProvider } from './admin/context/AuthContext'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import LoginPage from './admin/pages/LoginPage'
import DashboardPage from './admin/pages/DashboardPage'
import PropertiesPage from './admin/pages/PropertiesPage'
import PropertyCreatePage from './admin/pages/PropertyCreatePage'
import PropertyEditPage from './admin/pages/PropertyEditPage'
import UsersPage from './admin/pages/UsersPage'
import AuditLogPage from './admin/pages/AuditLogPage'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/propiedad/:slug" element={<Layout><PropertyPage /></Layout>} />
          <Route path="/propiedades" element={<Layout><PropiedadesPage /></Layout>} />
          <Route path="/propiedades/:slug" element={<Layout><PropiedadDetailPage /></Layout>} />
          <Route path="/emprendimientos" element={<Layout><EmprendimientosPage /></Layout>} />
          <Route path="/nosotros" element={<Layout><NosotrosPage /></Layout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="propiedades" element={<PropertiesPage />} />
            <Route path="propiedades/nueva" element={<PropertyCreatePage />} />
            <Route path="propiedades/:uuid" element={<PropertyEditPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="historial" element={<AuditLogPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
