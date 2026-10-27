/**
 * onError handler for storefront images: hides a picture that failed to load instead of showing the browser's
 * broken-image icon. `visibility` (not `display`) keeps the image's box, so aspect-ratio frames keep their size
 * and the linen background behind them shows through.
 */
export function hideBrokenImage(event) {
  event.currentTarget.style.visibility = 'hidden'
}
