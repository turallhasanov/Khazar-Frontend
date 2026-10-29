const DEFAULT_WIDTHS = [800, 1200, 1600, 2400]

/**
 * `src` / `srcSet` props for a full-width cover image whose URL comes from the admin panel. Unsplash URLs get a
 * srcset at the widths screens need (their `w` parameter is replaced); any other URL is used as it is.
 */
export function responsiveImage(url, { width = 1600, widths = DEFAULT_WIDTHS } = {}) {
  if (!url) return {}
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    // A site path such as "/media/cover.jpg".
    return { src: url }
  }
  if (parsed.hostname !== 'images.unsplash.com') return { src: url }

  const at = (w) => {
    const sized = new URL(parsed)
    sized.searchParams.set('w', String(w))
    return sized.toString()
  }
  return { src: at(width), srcSet: widths.map((w) => `${at(w)} ${w}w`).join(', ') }
}
