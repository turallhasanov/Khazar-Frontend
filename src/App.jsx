import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import { EditorialAdminPage } from './pages/EditorialAdminPage.jsx'
import { FaqPage } from './pages/FaqPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { ShippingReturnsPage } from './pages/ShippingReturnsPage.jsx'
import { VerifyEmailPage } from './pages/VerifyEmailPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/mehsul/:slug" element={<ProductDetailPage />} />
        <Route path="/sebet" element={<CartPage />} />
        <Route path="/odeme" element={<CheckoutPage />} />
        <Route path="/haqqimizda" element={<AboutPage />} />
        <Route path="/tez-tez-verilen-suallar" element={<FaqPage />} />
        <Route path="/catdirilma-ve-iade" element={<ShippingReturnsPage />} />
        <Route path="/elaqe" element={<ContactPage />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/qeydiyyat" element={<RegisterPage />} />
        <Route path="/e-poct-tesdiqi" element={<VerifyEmailPage />} />
        <Route path="/admin/editorial" element={<EditorialAdminPage />} />
      </Route>
    </Routes>
  )
}
