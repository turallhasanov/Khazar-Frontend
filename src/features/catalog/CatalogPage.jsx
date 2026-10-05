import { ProductList } from './ProductList.jsx'
import { products } from './products.js'

export function CatalogPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <h1 className="text-2xl font-medium tracking-tight">Kataloq</h1>
      <ProductList products={products} />
    </main>
  )
}
