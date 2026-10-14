import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { CartPage } from './features/cart/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.tsx'
import { HomePage } from './pages/HomePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/sebet" element={<CartPage />} />
      </Route>
    </Routes>
  )
}
