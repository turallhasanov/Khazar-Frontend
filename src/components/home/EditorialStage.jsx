import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../services/formatPrice.js'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { ColorSwatches, WishlistButton } from '../product/ProductControls.jsx'
import { discountPercent, sizeInStock, totalStock, unsplashSrcSet } from '../product/productDisplay.js'

// Spring in "slides" units — slightly under-damped: a settle, never a bounce.
const STIFFNESS = 70
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.86
const MAX_LEAD = 3 // the target never runs more than this many slides ahead
const DRAG_THRESHOLD = 6 // px before a press becomes a drag, so clicks still work
const FLING_PROJECTION = 0.22 // s of release velocity carried into the landing slide
const WHEEL_SETTLE = 140 // ms of trackpad silence before snapping to a slide
const TILT = { x: 2, y: 3 } // deg — pointer tilt of the hero
const PARALLAX = { x: 14, y: 10 } // px — pointer drift of the hero image inside its frame

const HERO_SIZES = '(min-width: 1024px) 560px, (min-width: 768px) 58vw, 82vw'

const mod = (value, length) => ((value % length) + length) % length
const pad = (value) => String(value).padStart(2, '0')
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Shortest signed distance from `current` to slide `index` on a loop of `count`. */
function loopOffset(index, current, count) {
  const raw = mod(index - current, count)
  return raw >= count / 2 ? raw - count : raw
}

/**
 * Composition keyframes along a slide's position p (0 = hero, 1–2 = queue on the right, −1 = gone).
 * x is in px from the hero's left edge; every channel is interpolated linearly between neighbours,
 * so dragging, the spring and keyboard all share one continuous choreography.
 */
function buildKeyframes(geo) {
  const { x1, x2, x3, s1, s2 } = geo
  return [
    { p: -1, x: 0, s: 1, o: 1, clip: 100, rot: 0, img: 1.14, shade: 0.28 },
    { p: 0, x: 0, s: 1, o: 1, clip: 0, rot: 0, img: 1, shade: 0 },
    { p: 1, x: x1, s: s1, o: 0.92, clip: 0, rot: -5, img: 1.08, shade: 0 },
    { p: 2, x: x2, s: s2, o: 0.55, clip: 0, rot: -8, img: 1.12, shade: 0 },
    { p: 3, x: x3, s: s2 * 0.8, o: 0, clip: 100, rot: -10, img: 1.16, shade: 0 },
  ]
}

function sample(frames, p) {
  if (p <= frames[0].p || p >= frames[frames.length - 1].p) return null
  const upper = frames.findIndex((frame) => frame.p >= p)
  const a = frames[upper - 1]
  const b = frames[upper]
  const t = (p - a.p) / (b.p - a.p)
  const out = {}
  for (const key of Object.keys(a)) out[key] = a[key] + (b[key] - a[key]) * t
  return out
}

/** Stage geometry from its own width — hero dominant, queue in receding steps. */
function measureGeometry(width) {
  const desktop = window.innerWidth >= 1024
  const tablet = window.innerWidth >= 768
  const heroW = desktop
    ? Math.min(width * 0.6, window.innerHeight * 0.76 * 0.75)
    : width * (tablet ? 0.58 : 0.82)
  const gap = desktop ? 36 : tablet ? 24 : 14
  const s1 = tablet ? 0.5 : 0.46
  const s2 = s1 * 0.8
  const x1 = heroW + gap
  const x2 = x1 + heroW * s1 + gap * 0.75
  const x3 = x2 + heroW * s2 + gap * 0.75
  return { heroW, heroH: (heroW * 4) / 3, gap, s1, s2, x1, x2, x3 }
}

/**
 * Ana səhifə — "Editoryal səhnə": bir aktiv məhsul hero kimi önə çıxır, növbəti ikisi sağda dərinlikdə gözləyir.
 * - Keçid: çıxan şəkil pərdə ilə sola çəkilir və içəri itələnir, gələn şəkil növbə yerindən böyüyərək hero olur;
 *   ad, qiymət və detallar maskanın altından kademəli qalxır.
 * - Hərəkət bir yay (spring) mövqeyindən çıxır: sürükləmə / toxunma ətalətlə, trackpad, ← / → və naviqasiya
 *   eyni davamlı mövqeni idarə edir, ona görə animasiyalar toqquşmur. Sonsuz dövr — sonuncudan sonra birinci gəlir.
 * - Siçanla hero yüngülcə əyilir, şəkil çərçivənin içində sürüşür; hover-da zoom və ikinci şəkil.
 * - prefers-reduced-motion: yay əvəzinə ani keçid, əyilmə və parallax yoxdur.
 */
export function EditorialStage({ products, label }) {
  const count = products.length
  const stageRef = useRef(null)
  const slideRefs = useRef([])
  const suppressClickRef = useRef(false)
  const [active, setActive] = useState(0)
  const [colorByProduct, setColorByProduct] = useState({})
  const [stageHeight, setStageHeight] = useState(null)

  // Everything the frame loop reads lives here, so motion never re-renders React.
  const motion = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    drag: null,
    wheelTimer: 0,
    frames: null,
    geo: null,
    reduced: false,
    active: 0,
    frame: 0,
    last: 0,
    pointer: { x: 0, y: 0, tx: 0, ty: 0 },
  })

  const paint = useCallback(() => {
    const m = motion.current
    if (!m.frames) return
    const { heroW, heroH } = m.geo
    const { x: px, y: py } = m.pointer

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return
      const p = loopOffset(index, m.current, count)
      const k = sample(m.frames, p)
      if (!k) {
        slide.style.visibility = 'hidden'
        return
      }
      slide.style.visibility = 'visible'
      // The hero (and only the hero) answers the pointer, fading out as it leaves centre stage.
      const focus = Math.max(0, 1 - Math.abs(p))
      const tiltX = -py * TILT.x * focus
      const tiltY = px * TILT.y * focus
      slide.style.transform =
        `translate3d(${k.x}px, 0, 0) rotateY(${k.rot}deg) scale(${k.s}) ` +
        `translate3d(${heroW / 2}px, ${-heroH / 2}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) ` +
        `translate3d(${-heroW / 2}px, ${heroH / 2}px, 0)`
      slide.style.opacity = k.o.toFixed(3)
      slide.style.clipPath = k.clip > 0.05 ? `inset(0 ${k.clip.toFixed(2)}% 0 0)` : 'none'
      // The outgoing slide rides on top so its curtain reveals the incoming hero beneath.
      slide.style.zIndex = p <= 0 ? '30' : String(Math.round(20 - p * 4))

      const media = slide.firstElementChild?.firstElementChild
      if (media) {
        media.style.transform = `translate3d(${-px * PARALLAX.x * focus}px, ${-py * PARALLAX.y * focus}px, 0) scale(${k.img.toFixed(4)})`
      }
      const shade = slide.querySelector('[data-shade]')
      if (shade) shade.style.opacity = k.shade.toFixed(3)
    })

    const next = mod(Math.round(m.current), count)
    if (next !== m.active) {
      m.active = next
      setActive(next)
    }
  }, [count])

  const tick = useCallback(
    // Named so the frame can schedule itself without reading the outer binding.
    function frameStep(now) {
      const m = motion.current
      const dt = m.last ? Math.min(0.05, (now - m.last) / 1000) : 1 / 60
      m.last = now

      if (!m.drag) {
        if (m.reduced) {
          m.current = m.target
          m.velocity = 0
        } else {
          // Fixed sub-steps keep the spring stable on slow frames.
          let remaining = dt
          while (remaining > 0) {
            const h = Math.min(remaining, 1 / 120)
            const accel = STIFFNESS * (m.target - m.current) - DAMPING * m.velocity
            m.velocity += accel * h
            m.current += m.velocity * h
            remaining -= h
          }
        }
      }

      const ptr = m.pointer
      const follow = 1 - Math.exp(-dt * 6)
      ptr.x += (ptr.tx - ptr.x) * follow
      ptr.y += (ptr.ty - ptr.y) * follow

      const springSettled = Math.abs(m.target - m.current) < 0.0004 && Math.abs(m.velocity) < 0.002
      const pointerSettled = Math.abs(ptr.tx - ptr.x) < 0.001 && Math.abs(ptr.ty - ptr.y) < 0.001
      if (springSettled && !m.drag) {
        m.current = m.target
        m.velocity = 0
      }
      paint()

      if (springSettled && pointerSettled && !m.drag) {
        m.frame = 0
        return
      }
      m.frame = requestAnimationFrame(frameStep)
    },
    [paint],
  )

  /** Starts the loop if it is idle; it stops itself once everything has settled. */
  const kick = useCallback(() => {
    const m = motion.current
    if (m.frame) return
    m.last = 0
    m.frame = requestAnimationFrame(tick)
  }, [tick])

  const goTo = useCallback(
    (target) => {
      const m = motion.current
      m.target = clamp(target, m.current - MAX_LEAD, m.current + MAX_LEAD)
      kick()
    },
    [kick],
  )

  const step = useCallback((direction) => goTo(Math.round(motion.current.target) + direction), [goTo])

  // Measure before paint so the first frame is already composed (no layout shift).
  useLayoutEffect(() => {
    const stage = stageRef.current
    const m = motion.current
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    m.reduced = reducedQuery.matches

    const layout = () => {
      m.geo = measureGeometry(stage.clientWidth)
      m.frames = buildKeyframes(m.geo)
      stage.style.setProperty('--hero-w', `${m.geo.heroW}px`)
      stage.style.setProperty('--hero-h', `${m.geo.heroH}px`)
      stage.style.setProperty('--x1', `${m.geo.x1}px`)
      stage.style.setProperty('--q-w', `${m.geo.heroW * m.geo.s1}px`)
      stage.style.setProperty('--q-h', `${m.geo.heroH * m.geo.s1}px`)
      setStageHeight(m.geo.heroH)
      paint()
    }
    layout()

    const resizeObserver = new ResizeObserver(layout)
    resizeObserver.observe(stage)
    const onReducedChange = () => {
      m.reduced = reducedQuery.matches
      m.pointer = { x: 0, y: 0, tx: 0, ty: 0 }
      kick()
    }
    reducedQuery.addEventListener('change', onReducedChange)

    // Trackpad: horizontal swipes scrub the stage, then it settles on the nearest slide.
    const onWheel = (event) => {
      const dx = event.deltaX * (event.deltaMode === 1 ? 16 : 1)
      if (Math.abs(dx) <= Math.abs(event.deltaY) || !m.geo) return
      event.preventDefault()
      m.current += dx / (m.geo.x1 * 1.4)
      m.target = m.current
      m.velocity = 0
      kick()
      window.clearTimeout(m.wheelTimer)
      m.wheelTimer = window.setTimeout(() => goTo(Math.round(m.current)), WHEEL_SETTLE)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(m.frame)
      m.frame = 0
      window.clearTimeout(m.wheelTimer)
      resizeObserver.disconnect()
      reducedQuery.removeEventListener('change', onReducedChange)
      stage.removeEventListener('wheel', onWheel)
    }
  }, [paint, kick, goTo])

  // A focused slide that stops being the hero hands focus back to the stage, never to a hidden element.
  useEffect(() => {
    const focused = document.activeElement
    const slide = focused?.closest?.('[data-stage-slide]')
    if (slide && Number(slide.dataset.stageSlide) !== active) stageRef.current?.focus({ preventScroll: true })
  }, [active])

  // --- Pointer: drag with momentum (mouse, touch, pen); touch-action: pan-y keeps vertical page scroll ---
  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // A drag released off the slides leaves no click behind to consume the flag; clear it here.
    suppressClickRef.current = false
    const m = motion.current
    m.drag = {
      id: event.pointerId,
      startX: event.clientX,
      start: m.current,
      lastX: event.clientX,
      lastT: event.timeStamp,
      v: 0,
      moved: false,
    }
    m.velocity = 0
    kick()
  }

  const onPointerMove = (event) => {
    const m = motion.current
    if (event.pointerType === 'mouse' && !m.reduced) {
      // Pointer position relative to the hero, −1…1 on each axis.
      const rect = stageRef.current.getBoundingClientRect()
      const { heroW, heroH } = m.geo
      m.pointer.tx = clamp(((event.clientX - rect.left) / heroW) * 2 - 1, -1, 1)
      m.pointer.ty = clamp(((event.clientY - (rect.bottom - heroH)) / heroH) * 2 - 1, -1, 1)
      kick()
    }

    const drag = m.drag
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.startX
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      drag.moved = true
      stageRef.current.setPointerCapture(event.pointerId)
      stageRef.current.dataset.dragging = 'true'
    }
    const distance = m.geo.x1
    m.current = drag.start - dx / distance
    m.target = m.current
    const dt = event.timeStamp - drag.lastT
    if (dt > 0) {
      const instant = (-(event.clientX - drag.lastX) / distance / dt) * 1000
      drag.v = drag.v * 0.3 + instant * 0.7
    }
    drag.lastX = event.clientX
    drag.lastT = event.timeStamp
  }

  const endDrag = (event, cancelled = false) => {
    const m = motion.current
    const drag = m.drag
    if (!drag || drag.id !== event.pointerId) return
    m.drag = null
    if (!drag.moved) {
      kick()
      return
    }
    delete stageRef.current.dataset.dragging
    suppressClickRef.current = true
    // A pause before release means the hand stopped — land where it is.
    const fresh = event.timeStamp - drag.lastT < 90
    const v = cancelled || !fresh ? 0 : clamp(drag.v, -6, 6)
    let target = Math.round(m.current + v * FLING_PROJECTION)
    // A quick flick always turns at least one page.
    if (target === Math.round(drag.start) && Math.abs(v) > 0.6) target += Math.sign(v)
    m.velocity = v
    goTo(target)
  }

  const onPointerLeave = (event) => {
    if (event.pointerType !== 'mouse') return
    motion.current.pointer.tx = 0
    motion.current.pointer.ty = 0
    kick()
  }

  const onSlideClick = (event, index) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      return
    }
    // A queued product comes forward instead of navigating away.
    if (index !== active) {
      event.preventDefault()
      const base = Math.round(motion.current.target)
      goTo(base + loopOffset(index, base, count))
    }
  }

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    step(event.key === 'ArrowRight' ? 1 : -1)
  }

  const product = products[active]
  const nextProduct = products[mod(active + 1, count)]
  const colorIndex = colorByProduct[product.id] ?? 0

  return (
    <div className="editorial-stage-layout">
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="karusel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endDrag(event)}
        onPointerCancel={(event) => endDrag(event, true)}
        onPointerLeave={onPointerLeave}
        onDragStart={(event) => event.preventDefault()}
        className="editorial-stage focus-visible:outline-offset-4"
        style={stageHeight ? { height: stageHeight } : undefined}
      >
        {products.map((item, index) => (
          <StageSlide
            key={item.id}
            ref={(element) => {
              slideRefs.current[index] = element
            }}
            product={item}
            index={index}
            isActive={index === active}
            eager={index < 3}
            onClick={(event) => onSlideClick(event, index)}
          />
        ))}

        {/* Növbəti məhsulun adı — kiçik növbə kartının üstündə, oxunaqlı ölçüdə */}
        <p key={nextProduct.id} aria-hidden="true" className="editorial-stage-next">
          <span className="editorial-stage-rise" style={{ '--d': '280ms' }}>
            <span className="text-ink-400">Növbəti — </span>
            {nextProduct.name}
          </span>
        </p>
      </div>

      <StagePanel
        product={product}
        index={active}
        count={count}
        colorIndex={colorIndex}
        onColorChange={(next) => setColorByProduct((current) => ({ ...current, [product.id]: next }))}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />

      <p className="sr-only" aria-live="polite">
        {`${active + 1} / ${count}: ${product.name}`}
      </p>
    </div>
  )
}

/** One stage frame. Only the hero is focusable and opens the product page; queued frames bring themselves forward. */
function StageSlide({ ref, product, index, isActive, eager, onClick }) {
  const [primaryImage, secondaryImage] = product.images
  const soldOut = totalStock(product.stock) === 0
  const discount = discountPercent(product)

  return (
    <div
      ref={ref}
      data-stage-slide={index}
      data-active={isActive || undefined}
      aria-hidden={isActive ? undefined : true}
      className="editorial-stage-slide"
    >
      <Link
        to={`/mehsul/${product.slug}`}
        aria-label={product.name}
        tabIndex={isActive ? 0 : -1}
        draggable={false}
        onClick={onClick}
        className="editorial-stage-frame"
      >
        <span className="editorial-stage-media">
          <img
            src={primaryImage}
            srcSet={unsplashSrcSet(primaryImage)}
            sizes={HERO_SIZES}
            alt={product.name}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onError={hideBrokenImage}
            className="editorial-stage-img"
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              srcSet={unsplashSrcSet(secondaryImage)}
              sizes={HERO_SIZES}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={hideBrokenImage}
              className="editorial-stage-img editorial-stage-img-alt"
            />
          )}
        </span>
        <span data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink-900 opacity-0" />

        {/* Etiketlər — yalnız API-nin verdiyi real məlumat */}
        <span className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-1">
          {soldOut ? (
            <span className="bg-ink-900 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-linen-50">
              Tükənib
            </span>
          ) : (
            discount > 0 && (
              <span className="bg-clay-600 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-linen-50">
                −{discount}%
              </span>
            )
          )}
        </span>
      </Link>
    </div>
  )
}

/**
 * Aktiv məhsulun editoryal paneli — böyük italik nömrə, ad, qiymət, rəng, ölçü ilə səbətə, istək siyahısı.
 * Məhsul dəyişəndə blok yenidən qurulur və hər sətir maskanın altından kademəli qalxır.
 */
function StagePanel({ product, index, count, colorIndex, onColorChange, onPrev, onNext }) {
  const { addToCart, openCart } = useCart()
  const selectedColor = product.colors[colorIndex] ?? product.colors[0]
  const soldOut = totalStock(product.stock) === 0
  const words = product.name.split(' ')

  const onQuickAdd = (size) => {
    addToCart(product, selectedColor, size)
    openCart()
  }

  return (
    <div className="editorial-stage-panel">
      <div key={product.id}>
        <p className="editorial-stage-mask font-display text-[clamp(4.5rem,3rem+5vw,8.5rem)] font-light italic leading-[0.9] tracking-[-0.04em] text-clay-600">
          <span className="editorial-stage-rise" style={{ '--d': '0ms' }}>
            {pad(index + 1)}
          </span>
        </p>

        <p className="editorial-stage-mask eyebrow mt-6">
          <span className="editorial-stage-rise" style={{ '--d': '90ms' }}>
            {product.fabric.material || 'Yeni gələnlər'}
          </span>
        </p>

        <h3 className="mt-3 min-h-[2.1em] font-display text-[clamp(1.75rem,1.3rem+1.4vw,2.6rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink-900">
          <Link
            to={`/mehsul/${product.slug}`}
            className="transition-colors duration-500 hover:text-clay-600 focus-visible:underline focus-visible:outline-none"
          >
            {words.map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`} className="editorial-stage-mask mr-[0.25em] inline-block align-bottom">
                <span className="editorial-stage-rise" style={{ '--d': `${140 + wordIndex * 45}ms` }}>
                  {word}
                </span>
              </span>
            ))}
          </Link>
        </h3>

        <p className="editorial-stage-mask mt-4 font-sans tabular-nums">
          <span className="editorial-stage-rise flex items-baseline gap-2.5" style={{ '--d': '260ms' }}>
            {product.compareAtPrice && (
              <span className="text-sm text-ink-500 line-through">
                <span className="sr-only">Əvvəlki qiymət: </span>
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className={`text-lg font-medium ${product.compareAtPrice ? 'text-clay-600' : 'text-ink-900'}`}>
              {formatPrice(product.basePrice)}
            </span>
          </span>
        </p>

        <div className="editorial-stage-fade mt-8 space-y-5 border-t border-linen-200 pt-5" style={{ '--d': '340ms' }}>
          {product.colors.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ink-500">
                Rəng — <span className="text-ink-900">{selectedColor.name}</span>
              </span>
              <div className="-mr-1">
                <ColorSwatches
                  colors={product.colors}
                  selectedIndex={colorIndex}
                  onSelect={onColorChange}
                  max={6}
                  dotClass="h-3.5 w-3.5"
                />
              </div>
            </div>
          )}

          {product.sizes.length > 0 && !soldOut && selectedColor && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-500">Ölçü seç · səbətə at</p>
              <ul className="-ml-2 mt-1 flex flex-wrap">
                {product.sizes.map((size) => {
                  const inStock = sizeInStock(product, size)
                  return (
                    <li key={size}>
                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={() => onQuickAdd(size)}
                        aria-label={`${product.name}, ${selectedColor.name}, ${size} — səbətə əlavə et`}
                        className={`relative flex h-10 min-w-10 items-center justify-center px-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-300 after:absolute after:inset-x-2 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[var(--ease-editorial)] hover:text-clay-600 hover:after:scale-x-100 disabled:cursor-not-allowed disabled:after:hidden ${
                          inStock ? 'text-ink-900' : 'text-ink-400 line-through'
                        }`}
                      >
                        {size}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-5">
            <Link to={`/mehsul/${product.slug}`} className="link-sweep">
              Məhsula bax
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" className="link-sweep-arrow" />
            </Link>
            <WishlistButton product={product} className="ml-auto border border-linen-200" />
          </div>
        </div>
      </div>

      {/* Naviqasiya — sayğac, irəliləyiş xətti və iki sakit düymə */}
      <nav aria-label="Məhsullar arasında keçid" className="mt-10 flex items-center gap-5 lg:mt-14">
        <p className="shrink-0 font-sans text-[11px] font-medium tabular-nums tracking-[0.16em] text-ink-900" aria-hidden="true">
          {pad(index + 1)} <span className="text-ink-400">/ {pad(count)}</span>
        </p>
        <span className="relative h-px flex-1 overflow-hidden bg-linen-200" aria-hidden="true">
          <span
            className="absolute inset-0 origin-left bg-ink-900 transition-transform duration-[900ms] ease-[var(--ease-editorial)]"
            style={{ transform: `scaleX(${(index + 1) / count})` }}
          />
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onPrev} aria-label="Əvvəlki məhsul" className="editorial-stage-nav">
            <ArrowLeft size={16} strokeWidth={1.25} aria-hidden="true" />
          </button>
          <button type="button" onClick={onNext} aria-label="Növbəti məhsul" className="editorial-stage-nav">
            <ArrowRight size={16} strokeWidth={1.25} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  )
}
