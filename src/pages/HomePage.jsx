import { BrandManifesto } from '../components/home/BrandManifesto.jsx'
import { CraftsmanshipSpotlight } from '../components/home/CraftsmanshipSpotlight.jsx'
import { EditorialJournal } from '../components/home/EditorialJournal.jsx'
import { EditorialLookbook } from '../components/home/EditorialLookbook.jsx'
import { FeatureBand } from '../components/home/FeatureBand.jsx'
import { HeroSection } from '../components/home/HeroSection.jsx'

/**
 * Ana səhifə — editoryal axın: Hero → Manifest → Lookbook → Slogan bandı +
 * vitrin blokları → Ustalıq → Jurnal. İçərik hamısı EditorialContext/CMS-dən.
 */
export function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <BrandManifesto />
      <EditorialLookbook />
      <FeatureBand />
      <CraftsmanshipSpotlight />
      <EditorialJournal />
    </main>
  )
}
