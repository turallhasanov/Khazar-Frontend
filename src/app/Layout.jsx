import { Footer } from '../shared/ui/Footer.jsx'
import { Header } from '../shared/ui/Header.jsx'

export function Layout({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-white text-neutral-900">
      <Header />
      {children}
      <Footer />
    </div>
  )
}
