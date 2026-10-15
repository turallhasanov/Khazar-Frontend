import { FeatureBand } from '../components/home/FeatureBand.jsx'
import { HeroSection } from '../components/home/HeroSection.jsx'

/** Mikro-Aşama 4: Ana səhifə — Hero Banner + Editoryal bantlar. */
export function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeatureBand />
    </main>
  )
}
