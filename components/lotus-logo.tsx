/**
 * Logo de NaturKatt: flor de loto en tonos lila, con pétalos degradados sobre el agua.
 * `id` evita repetir los identificadores de los degradados cuando el logo aparece dos veces en la página (encabezado y pie).
 */
export function LotusIcon({ className, id = 'nk' }: { className?: string; id?: string }) {
  const c = `${id}-loto-centro`
  const s = `${id}-loto-medio`
  const o = `${id}-loto-exterior`
  const line = '#5b2a86'
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={c} x1="32" y1="9" x2="32" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fdf9ff" />
          <stop offset="1" stopColor="#b56ee8" />
        </linearGradient>
        <linearGradient id={s} x1="32" y1="18" x2="32" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbf3ff" />
          <stop offset="1" stopColor="#a35ad9" />
        </linearGradient>
        <linearGradient id={o} x1="32" y1="30" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0dcff" />
          <stop offset="1" stopColor="#8b3dd6" />
        </linearGradient>
      </defs>
      {/* pétalos exteriores */}
      <path d="M32 47.5C20 48.5 8.5 43 4 31.5C15 29 26 35 32 47.5Z" fill={`url(#${o})`} stroke={line} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M32 47.5C44 48.5 55.5 43 60 31.5C49 29 38 35 32 47.5Z" fill={`url(#${o})`} stroke={line} strokeWidth="1.3" strokeLinejoin="round" />
      {/* pétalos medios */}
      <path d="M32 47.5C20.5 42 14.5 31.5 15.5 18.5C25.5 22 31 33 32 47.5Z" fill={`url(#${s})`} stroke={line} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M32 47.5C43.5 42 49.5 31.5 48.5 18.5C38.5 22 33 33 32 47.5Z" fill={`url(#${s})`} stroke={line} strokeWidth="1.3" strokeLinejoin="round" />
      {/* pétalo central */}
      <path d="M32 8.5C40 17.5 42 32 32 47.5C22 32 24 17.5 32 8.5Z" fill={`url(#${c})`} stroke={line} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M32 16V40M28.5 22C29 30 30 37 32 44M35.5 22C35 30 34 37 32 44" stroke={line} strokeOpacity="0.35" strokeWidth="0.8" strokeLinecap="round" />
      {/* agua */}
      <path d="M12 53C18.5 56 25 57 32 57C39 57 45.5 56 52 53" stroke={line} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
