'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44" aria-hidden="true">
  <path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1z" fill="var(--cta, #c2410c)" stroke="#fff" stroke-width="2"/>
  <circle cx="17" cy="16.5" r="6" fill="#fff"/></svg>`

/**
 * Mapa de OpenStreetMap con un pin que la clienta puede mover (arrastrando o tocando el mapa) para marcar el punto exacto de entrega.
 */
export function DeliveryMap({
  lat,
  lon,
  zoom = 17,
  onMove,
}: {
  lat: number
  lon: number
  /** Zoom inicial: 17 para ver la casa, 15 para recorrer la comuna buscando la casa. */
  zoom?: number
  onMove: (lat: number, lon: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !containerRef.current || mapRef.current) return
      // Se puede recorrer el mapa arrastrándolo (también con el dedo) para buscar la casa visualmente.
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lon], zoom)
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>')
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(map)


      const marker = L.marker([lat, lon], {
        draggable: true,
        autoPan: true,
        title: 'Punto de entrega',
        icon: L.divIcon({ html: PIN_SVG, className: '', iconSize: [34, 44], iconAnchor: [17, 43] }),
      }).addTo(map)
      marker.on('dragend', () => {
        const p = marker.getLatLng()
        onMoveRef.current(p.lat, p.lng)
      })
      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        onMoveRef.current(e.latlng.lat, e.latlng.lng)
      })
      mapRef.current = map
      markerRef.current = marker
    })()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // El mapa se crea una sola vez; los cambios de ubicación se aplican en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const marker = markerRef.current
    const map = mapRef.current
    if (!marker || !map) return
    const current = marker.getLatLng()
    if (Math.abs(current.lat - lat) > 1e-7 || Math.abs(current.lng - lon) > 1e-7) {
      marker.setLatLng([lat, lon])
      map.setView([lat, lon], Math.max(map.getZoom(), 16))
    }
  }, [lat, lon])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa del punto de entrega. Recorre el mapa y toca tu casa o arrastra el pin para marcarla."
      className="isolate h-64 w-full overflow-hidden rounded-xl border bg-muted sm:h-72"
    />
  )
}
