import { ContentGate } from '../components/content/ContentGate.jsx'
import { BrandManifesto } from '../components/home/BrandManifesto.jsx'
import { CraftsmanshipSpotlight } from '../components/home/CraftsmanshipSpotlight.jsx'
import { EditorialJournal } from '../components/home/EditorialJournal.jsx'
import { EditorialLookbook } from '../components/home/EditorialLookbook.jsx'
import { FeatureBand } from '../components/home/FeatureBand.jsx'
import { HeroSection } from '../components/home/HeroSection.jsx'
import { NewArrivals } from '../components/home/NewArrivals.jsx'

/**
 * Ana səhifə — editoryal axın: Hero → Yeni gələnlər → Manifest → Lookbook → Slogan bandı +
 * vitrin blokları → Ustalıq → Jurnal. Zemin ritmi: krem → krem-2 → krem → mürəkkəb → krem-2 → krem.
 * Editoryal içərik admin panelindən (GET /api/content), vitrin canlı API kataloqundan. Admin panelində saxlanmamış
 * və ya boş qalan bölmə göstərilmir.
 */
export function HomePage() {
  return (
    <ContentGate>
      <main className="flex-1">
        <HeroSection />
        <NewArrivals />
        <BrandManifesto />
        <EditorialLookbook />
        <FeatureBand />
        <CraftsmanshipSpotlight />
        <EditorialJournal />
      </main>
    </ContentGate>
  )
}
