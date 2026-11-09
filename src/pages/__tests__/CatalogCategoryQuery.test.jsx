import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const mk = (id, category) => ({
  id, slug: id, name: `Prod ${id}`, category, basePrice: 50, sizes: ['M'], colors: [{ name: 'Qara', hex: '#000' }],
  fabric: { material: 'Pambıq' }, images: [], image: '', gallery: [],
})
const ctx = {
  status: 'ready',
  reload: () => {},
  products: [mk('h1', 'Hoodie'), mk('h2', 'Hoodie'), mk('s1', 'Sweatshirt')],
  categories: [
    { id: 1, name: 'Hoodie', slug: 'hoodie', label: 'Hoodie' },
    { id: 2, name: 'Sweatshirt', slug: 'sweatshirt', label: 'Sweatshirt' },
  ],
}
vi.mock('../../context/ProductsContext', () => ({ useProducts: () => ctx }))
vi.mock('../../context/SiteContentContext', () => ({ useContentSection: () => null }))
vi.mock('../../components/product/ProductCard', () => ({ ProductCard: ({ product }) => <div data-testid="card">{product.name}</div> }))
vi.mock('../../components/layout/NewsletterSignup', () => ({ NewsletterSignup: () => null }))

const { CatalogPage, resolveQueryCategory } = await import('../CatalogPage.jsx')
const { Footer } = await import('../../components/layout/Footer.jsx')

describe('resolveQueryCategory', () => {
  it('matches slugs case-insensitively and legacy aliases', () => {
    expect(resolveQueryCategory('HOODIE', ctx.categories)).toBe('Hoodie')
    expect(resolveQueryCategory('salvar', ctx.categories)).toBe('Pants')
    expect(resolveQueryCategory('nope', ctx.categories)).toBeNull()
    expect(resolveQueryCategory(null, ctx.categories)).toBeNull()
  })
})

describe('catalog category query', () => {
  it('filters on load and re-filters when a footer link changes the query on the same page', async () => {
    render(
      <MemoryRouter initialEntries={['/katalog?kateqoriya=hoodie']}>
        <CatalogPage />
        <Footer />
      </MemoryRouter>,
    )
    expect(screen.getAllByTestId('card')).toHaveLength(2)

    await userEvent.click(screen.getByRole('link', { name: 'Sweatshirt' }))
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('Prod s1')
  })
})
