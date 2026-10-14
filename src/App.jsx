import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { CartPage } from './pages/CartPage.tsx'
import { CatalogPage } from './pages/CatalogPage.tsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/mehsul/:slug" element={<ProductDetailPage />} />
        <Route path="/sebet" element={<CartPage />} />
      </Route>
    </Routes>
  )
}
