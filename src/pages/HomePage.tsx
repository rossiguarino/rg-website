import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import EmprendimientosPreview from '../components/EmprendimientosPreview'
import PropiedadesPreview from '../components/PropiedadesPreview'
import ContactSection from '../components/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchSection />
      <EmprendimientosPreview />
      <PropiedadesPreview />
      <ContactSection />
    </>
  )
}
