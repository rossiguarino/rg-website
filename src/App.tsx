import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// Eager-load the home page for fast initial render
import HomePage from './pages/HomePage'

// Lazy-load other pages for code splitting
const PropertyPage = lazy(() => import('./pages/PropertyPage'))
const PropiedadesPage = lazy(() => import('./pages/PropiedadesPage'))
const PropiedadDetailPage = lazy(() => import('./pages/PropiedadDetailPage'))
const EmprendimientosPage = lazy(() => import('./pages/EmprendimientosPage'))
const NosotrosPage = lazy(() => import('./pages/NosotrosPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Admin imports (lazy-loaded - separate chunk)
const LoginPage = lazy(() => import('./admin/pages/LoginPage'))
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'))
const PropertiesPage = lazy(() => import('./admin/pages/PropertiesPage'))
const PropertyCreatePage = lazy(() => import('./admin/pages/PropertyCreatePage'))
const PropertyEditPage = lazy(() => import('./admin/pages/PropertyEditPage'))
const UsersPage = lazy(() => import('./admin/pages/UsersPage'))
const AuditLogPage = lazy(() => import('./admin/pages/AuditLogPage'))

// Admin context & components (eager - small)
import { AuthProvider } from './admin/context/AuthContext'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'

/** Loading fallback for lazy routes */
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-gray text-sm">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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

              {/* 404 catch-all */}
              <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  )
}
