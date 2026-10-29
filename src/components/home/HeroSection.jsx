import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useContentSection } from '../../context/SiteContentContext'
import { formatPrice } from '../../services/formatPrice'
import { hideBrokenImage } from '../../services/imageFallback.js'

/** Giriş koreografisi: her öğe kendi gecikmesini --d ile alır (index.css → .hero-*). */
const at = (ms) => ({ '--d': `${ms}ms` })

/**
 * Hero derinliği — kaydırma ilerlemesi (--hp, 0→1) ve imleç konumu (--hx/--hy, -1→1) bölüme CSS değişkeni
 * olarak yazılır; katmanlar bunları index.css'te farklı katsayılarla transform'a çevirir.
 * Tek rAF, yalnız bölüm görünürken; tablet altı, dokunmatik ve reduced-motion'da hiç bağlanmaz.
 */
function useHeroDepth(sectionRef) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !window.matchMedia || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wide = window.matchMedia('(min-width: 48rem)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
    let frame = 0
    let inView = true

    const render = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const progress = wide.matches ? Math.min(Math.max(-rect.top / rect.height, 0), 1) : 0
      // İmleç hedefine yumuşak yaklaşır; yerine oturana kadar kare istemeye devam eder.
      pointer.x += (pointer.targetX - pointer.x) * 0.08
      pointer.y += (pointer.targetY - pointer.y) * 0.08
      section.style.setProperty('--hp', progress.toFixed(4))
      section.style.setProperty('--hx', pointer.x.toFixed(4))
      section.style.setProperty('--hy', pointer.y.toFixed(4))
      if (Math.abs(pointer.targetX - pointer.x) > 0.001 || Math.abs(pointer.targetY - pointer.y) > 0.001) schedule()
    }

    const schedule = () => {
      if (!frame && inView) frame = requestAnimationFrame(render)
    }

    const onPointerMove = (event) => {
      if (!finePointer.matches || !wide.matches) return
      const rect = section.getBoundingClientRect()
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      schedule()
    }

    const onPointerLeave = () => {
      pointer.targetX = 0
      pointer.targetY = 0
      schedule()
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      schedule()
    })

    observer.observe(section)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)
    schedule()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
      for (const name of ['--hp', '--hx', '--hy']) section.style.removeProperty(name)
    }
  }, [sectionRef])
}

/** Mobil görsel şeridi: ekranda en çok görünen karenin sırasını bildirir (sayaç + ilerleme çizgisi). */
function useRailIndex(railRef, onChange) {
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onChange(Number(entry.target.dataset.index))
        }
      },
      { root: rail, threshold: 0.6 },
    )
    for (const slide of rail.children) observer.observe(slide)
    return () => observer.disconnect()
  }, [railRef, onChange])
}

/**
 * Hero — editoryal sahne.
 * Masaüstü: solda büyük serif başlık ve seçim paneli; sağda derinlik katmanlı portre + paspartulu ikinci kare,
 * başlık görsel alanına taşar. Kaydırmada katmanlar farklı hızda akar, imleçle hafif 3B eğilir.
 * Tablet: başlık tam genişlik, görseller kademeli üst üste, panel iki sütun.
 * Mobil: başlık önce, görseller kaydırmalı şerit (sayaçlı), seçim paneli ve tam genişlik CTA altta.
 * Mətnlər və görsellər admin panelindən ("hero" bölməsi); rəng, ölçü və qiymət bölmədə seçilmiş real məhsuldan
 * (productSlug) gəlir — stokda olmayan ölçü seçilmir. Məhsul tapılmasa seçim sahələri gizlənir.
 */
export function HeroSection() {
  const hero = useContentSection('hero')
  const { products } = useProducts()
  const product = hero?.productSlug ? products.find((entry) => entry.slug === hero.productSlug) : null
  const colors = product?.colors ?? []
  const sizes = product?.sizes ?? []

  const sectionRef = useRef(null)
  const railRef = useRef(null)
  const [pickedColor, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [slide, setSlide] = useState(0)
  const color = colors.some((option) => option.name === pickedColor) ? pickedColor : colors[0]?.name
  const sizeIndex = sizes.indexOf(size)

  useHeroDepth(sectionRef)
  useRailIndex(railRef, setSlide)

  if (!hero) return null

  const priceLabel = hero.priceLabel || (product ? formatPrice(product.basePrice) : '')
  const ctaTo = hero.ctaLink || (product ? `/mehsul/${product.slug}` : '/katalog')
  const slideCount = hero.sideImageUrl ? 2 : 1
  const inStock = (option) => (product?.stock[option] ?? 0) > 0

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-linen-50">
      <div className="shell relative grid pb-16 pt-6 md:pb-24 md:pt-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-12 lg:grid-rows-[1fr_1fr] lg:gap-x-8 lg:pb-14 lg:pt-8">
        {/* Başlık */}
        <div className="relative z-10 lg:col-span-6 lg:row-start-1 lg:self-end">
          <div className="flex items-center gap-4">
            <p className="eyebrow hero-rise" style={at(150)}>
              {hero.kicker}
            </p>
            <span aria-hidden="true" className="hero-rule h-px flex-1 bg-linen-200 lg:max-w-20" style={at(320)} />
          </div>

          <h1 id="hero-title" className="hero-depth-title mt-7 font-display font-light text-ink-900 md:mt-9">
            <span className="hero-line text-sm tracking-[0.24em] text-ink-500 md:text-base">
              <span style={at(260)}>{hero.titleTop}</span>
            </span>
            <span className="hero-line mt-3 text-[clamp(2.5rem,11.4vw,5.25rem)] leading-[0.92] tracking-[-0.03em] md:mt-4 lg:text-[clamp(4.25rem,0.75rem+5.4vw,7rem)]">
              <span style={at(360)}>{hero.titleLine1}</span>
            </span>
            <span className="hero-line text-[clamp(2.5rem,11.4vw,5.25rem)] italic leading-[0.98] tracking-[-0.03em] text-clay-600 md:pl-[9%] lg:pl-[14%] lg:text-[clamp(4.25rem,0.75rem+5.4vw,7rem)]">
              <span style={at(480)}>{hero.titleLine2}</span>
            </span>
          </h1>
        </div>

        {/* Görsel sahnesi */}
        <div className="hero-stage relative mt-10 md:mb-24 md:mt-14 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:my-0 lg:self-center">
          <div
            ref={railRef}
            className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] md:mx-0 md:block md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <figure data-index="0" className="hero-depth-main relative w-[82%] shrink-0 snap-start md:ml-auto md:w-[62%] lg:w-[min(100%,62svh)]">
              <div className="hero-unveil relative aspect-[3/4] overflow-hidden bg-linen-100 md:aspect-[4/5]" style={at(80)}>
                <div className="hero-depth-image h-full w-full">
                  <img
                    src={hero.imageUrl}
                    onError={hideBrokenImage}
                    alt={hero.imageAlt}
                    width="1024"
                    height="1536"
                    fetchPriority="high"
                    className="hero-settle h-full w-full object-cover object-[50%_34%]"
                    style={at(80)}
                  />
                </div>
              </div>
              {/* Tablette ikinci kare sol alt köşeyi örttüğü için künye sağa toplanır */}
              <figcaption
                className="hero-rise mt-3 flex justify-between gap-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500 md:justify-end lg:justify-between"
                style={at(1100)}
              >
                <span>{hero.captionLeft}</span>
                <span>{hero.captionRight}</span>
              </figcaption>
            </figure>

            {hero.sideImageUrl && (
              <figure
                data-index="1"
                className="hero-depth-side relative z-10 w-[82%] shrink-0 snap-start md:absolute md:-bottom-[10%] md:left-[4%] md:w-[38%] md:bg-white md:p-1.5 lg:-left-6 lg:bottom-[9%] lg:w-[34%] xl:-left-12"
              >
                <div className="hero-unveil-side aspect-[3/4] overflow-hidden bg-linen-100" style={at(700)}>
                  <img
                    src={hero.sideImageUrl}
                    onError={hideBrokenImage}
                    alt={hero.sideImageAlt}
                    width="1024"
                    height="1536"
                    className="hero-settle h-full w-full object-cover object-[50%_30%]"
                    style={at(700)}
                  />
                </div>
              </figure>
            )}
          </div>

          {/* Mobil şerit sayacı */}
          {slideCount > 1 && (
            <div className="mt-4 flex items-center gap-3 md:hidden" aria-hidden="true">
              <span className="w-5 text-[11px] font-medium tabular-nums tracking-[0.12em] text-ink-900">0{slide + 1}</span>
              <span className="relative h-px flex-1 overflow-hidden bg-linen-200">
                <span
                  className="absolute inset-y-0 left-0 bg-ink-900 transition-transform duration-700 ease-editorial"
                  style={{ width: `${100 / slideCount}%`, transform: `translateX(${slide * 100}%)` }}
                />
              </span>
              <span className="text-[11px] font-medium tabular-nums tracking-[0.12em] text-ink-500">0{slideCount}</span>
            </div>
          )}

          {/* Sağ kenar: dikey imza ve kaydırma işareti */}
          {hero.signature && (
            <p
              className="hero-rise absolute right-0 top-0 hidden text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500 [writing-mode:vertical-rl] lg:-right-8 lg:block"
              style={at(1200)}
            >
              {hero.signature}
            </p>
          )}
          <span aria-hidden="true" className="hero-cue absolute bottom-0 hidden h-16 w-px overflow-hidden bg-linen-200 lg:-right-[1.4rem] lg:block" />
        </div>

        {/* Seçim paneli */}
        <div
          className="hero-rise mt-6 md:mt-0 md:grid md:grid-cols-2 md:items-end md:gap-x-12 lg:col-span-5 lg:row-start-2 lg:mt-12 lg:block lg:self-start"
          style={at(820)}
        >
          <div>
            <div className="flex items-baseline justify-between border-t border-linen-200 pt-5">
              <p className="font-display text-[1.625rem] font-light leading-none text-ink-900">{priceLabel}</p>
              {color && (
                <p className="eyebrow">
                  Rəng —{' '}
                  <span key={color} className="inline-block animate-fade-up text-ink-900">
                    {color}
                  </span>
                </p>
              )}
            </div>

            {colors.length > 0 && (
            <fieldset className="mt-3">
              <legend className="sr-only">Rəng</legend>
              <div className="-ml-2.5 flex">
                {colors.map((option) => (
                  <label
                    key={option.name}
                    title={option.name}
                    className="group relative flex h-11 w-11 cursor-pointer items-center justify-center"
                  >
                    <input
                      type="radio"
                      name="hero-color"
                      value={option.name}
                      checked={color === option.name}
                      onChange={() => setColor(option.name)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 rounded-full ring-1 ring-inset ring-ink-900/15 transition-transform duration-500 ease-editorial group-hover:scale-110 group-active:scale-95"
                      style={{ backgroundColor: option.hex }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-[6px] scale-75 rounded-full border border-ink-900 opacity-0 transition-[opacity,transform] duration-500 ease-editorial peer-checked:scale-100 peer-checked:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay-500"
                    />
                    <span className="sr-only">{option.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            )}

            {sizes.length > 0 && (
            <fieldset className="mt-4">
              <legend className="sr-only">Ölçü</legend>
              <div className="mb-3 flex items-baseline justify-between">
                <span aria-hidden="true" className="eyebrow">
                  Ölçü
                </span>
                <span aria-live="polite" className="text-[12px] text-ink-500">
                  {size ? `Seçiminiz: ${color} · ${size}` : 'Ölçü seçilməyib'}
                </span>
              </div>
              <div
                className="relative grid border border-linen-200"
                style={{ gridTemplateColumns: `repeat(${sizes.length}, minmax(0, 1fr))` }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 bg-ink-900 transition-[transform,opacity] duration-500 ease-editorial ${
                    size ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ width: `${100 / sizes.length}%`, transform: `translateX(${Math.max(sizeIndex, 0) * 100}%)` }}
                />
                {sizes.map((option) => (
                  <label key={option} className={`relative ${inStock(option) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input
                      type="radio"
                      name="hero-size"
                      value={option}
                      checked={size === option}
                      disabled={!inStock(option)}
                      onChange={() => setSize(option)}
                      className="peer sr-only"
                    />
                    <span className="flex h-12 select-none items-center justify-center text-[12px] font-medium tracking-[0.12em] text-ink-700 transition-colors duration-300 hover:text-clay-700 peer-checked:text-linen-50 peer-checked:hover:text-linen-50 peer-disabled:text-ink-400 peer-disabled:line-through peer-disabled:hover:text-ink-400 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-clay-500">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 md:mt-0 md:flex-col md:items-start lg:mt-9 lg:flex-row lg:items-center">
            {hero.ctaLabel && (
              <Link to={ctaTo} className="hero-cta w-full sm:w-auto">
                <span>{hero.ctaLabel}</span>
                <span className="hero-cta-arrow" aria-hidden="true">
                  <ArrowRight size={15} strokeWidth={1.5} />
                  <ArrowRight size={15} strokeWidth={1.5} />
                </span>
              </Link>
            )}
            {hero.secondaryLinkLabel && (
              <Link
                to={hero.secondaryLinkTo || '/katalog'}
                className="link-underline self-start text-ink-900 sm:self-auto md:self-start lg:self-auto"
              >
                {hero.secondaryLinkLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
