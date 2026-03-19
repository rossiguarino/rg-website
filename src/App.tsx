import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import NosotrosPage from './pages/NosotrosPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/propiedad/:slug" element={<PropertyPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
