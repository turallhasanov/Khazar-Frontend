import { useEffect, useRef } from 'react'

/** One observer for every Reveal on the page; each element is unobserved after its first entrance. */
let sharedObserver = null

function observe(element) {
  if (typeof IntersectionObserver === 'undefined') {
    element.classList.add('is-visible')
    return () => {}
  }
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        sharedObserver.unobserve(entry.target)
      }
    },
    // Starts slightly before the element is fully on screen, so fast scrolling never shows empty space.
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  sharedObserver.observe(element)
  return () => sharedObserver?.unobserve(element)
}

/**
 * Kaydırınca görünme sarmalayıcısı — opaklık + kısa yükselme (variant="image": perde açılışı).
 * Stil index.css'teki .reveal / .reveal-image sınıflarında; prefers-reduced-motion'da anında görünür.
 * `delay` (ms) aynı bölümdeki öğeleri kademelendirmek içindir.
 */
export function Reveal({ as: Tag = 'div', variant = 'fade', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => observe(ref.current), [])

  return (
    <Tag
      ref={ref}
      className={`${variant === 'image' ? 'reveal-image' : 'reveal'} ${className}`}
      style={delay ? { ...style, '--reveal-delay': `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
