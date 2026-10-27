import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import { FaqPage } from './pages/FaqPage.jsx'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { JournalArticlePage } from './pages/JournalArticlePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'
import { ShippingReturnsPage } from './pages/ShippingReturnsPage.jsx'
import { UnsubscribePage } from './pages/UnsubscribePage.jsx'
import { VerifyEmailPage } from './pages/VerifyEmailPage.jsx'

// The admin panel is a separate chunk: storefront visitors never download it.
const named = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })))
const AdminRoot = named(() => import('./components/admin/AdminLayout.jsx'), 'AdminRoot')
const AdminReviewsPage = named(() => import('./pages/AdminReviewsPage.jsx'), 'AdminReviewsPage')
const AdminProductsPage = named(() => import('./pages/AdminProductsPage.jsx'), 'AdminProductsPage')
const EditorialAdminPage = named(() => import('./pages/EditorialAdminPage.jsx'), 'EditorialAdminPage')

function AdminFallback() {
  return <div role="status" aria-label="Yüklənir" className="min-h-svh bg-linen-50" />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/mehsul/:slug" element={<ProductDetailPage />} />
        <Route path="/sebet" element={<CartPage />} />
        <Route path="/odeme" element={<CheckoutPage />} />
        <Route path="/journal/:slug" element={<JournalArticlePage />} />
        <Route path="/haqqimizda" element={<AboutPage />} />
        <Route path="/tez-tez-verilen-suallar" element={<FaqPage />} />
        <Route path="/catdirilma-ve-iade" element={<ShippingReturnsPage />} />
        <Route path="/elaqe" element={<ContactPage />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/qeydiyyat" element={<RegisterPage />} />
        <Route path="/e-poct-tesdiqi" element={<VerifyEmailPage />} />
        <Route path="/sifremi-unutdum" element={<ForgotPasswordPage />} />
        <Route path="/sifre-yenile" element={<ResetPasswordPage />} />
        <Route path="/abunelikden-cix" element={<UnsubscribePage />} />
      </Route>

      {/* Admin has its own shell (sidebar, no storefront header or cart) and providers. */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminRoot />
          </Suspense>
        }
      >
        <Route index element={<Navigate to="reyler" replace />} />
        <Route path="reyler" element={<AdminReviewsPage />} />
        <Route path="mehsullar" element={<AdminProductsPage />} />
        <Route path="editorial" element={<EditorialAdminPage />} />
      </Route>
    </Routes>
  )
}
