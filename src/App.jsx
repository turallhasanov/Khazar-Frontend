import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { EditorialAdminPage } from './pages/EditorialAdminPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/mehsul/:slug" element={<ProductDetailPage />} />
        <Route path="/sebet" element={<CartPage />} />
        <Route path="/odeme" element={<CheckoutPage />} />
        <Route path="/admin/editorial" element={<EditorialAdminPage />} />
      </Route>
    </Routes>
  )
}
