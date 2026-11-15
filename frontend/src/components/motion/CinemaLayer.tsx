/**
 * Art direction "Transmission" (US-5.14): the whole site is seen as footage received from far
 * away — a fine film grain and a soft vignette over every page. Two fixed layers, no blend
 * mode (cheap over the moving sky); the grain only breathes in opacity, and stays still under
 * reduced motion. Decorative, never in the way (pointer-events: none).
 */
export function CinemaLayer() {
  return (
    <div aria-hidden="true" className="cinema-layer">
      <div className="cinema-grain" />
      <div className="cinema-vignette" />
    </div>
  )
}
