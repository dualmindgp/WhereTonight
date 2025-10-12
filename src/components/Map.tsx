'use client'

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import { VenueWithCount } from '@/lib/database.types'
import maplibregl from 'maplibre-gl'

export interface MapProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
  selectedVenueId?: string | null
}

const Map = forwardRef<any, MapProps>(({ venues, onVenueClick, selectedVenueId }, ref) => {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [viewState, setViewState] = useState({
    longitude: 21.0122,
    latitude: 52.2297,
    zoom: 13
  })
  
  useImperativeHandle(ref, () => ({
    flyTo: (options: any) => {
      if (mapRef.current) {
        mapRef.current.getMap().flyTo(options)
      }
    }
  }))
  
  // Añadir marcadores cuando el mapa esté listo
  useEffect(() => {
    if (!mapRef.current) return
    
    const map = mapRef.current.getMap()
    if (!map) return
    
    if (venues.length === 0) {
      return // No añadir marcadores si no hay venues
    }
    
    // Esperar a que el mapa se cargue completamente
    const addMarkers = () => {
      // Limpiar marcadores anteriores
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      venues.forEach((venue) => {
        
        const count = venue.count_today || 0
        
        // Determinar el color según la popularidad con escala gradual
        let color, glowColor
        if (venue.id === selectedVenueId) {
          color = '#FF00FF' // Rosa/magenta para seleccionado
          glowColor = 'rgba(255, 0, 255, 0.8)'
        } else if (count >= 20) {
          color = '#FF00FF' // Rosa/magenta para muy popular (20+ personas)
          glowColor = 'rgba(255, 0, 255, 0.6)'
        } else if (count >= 10) {
          color = '#FF1493' // Rosa fuerte para popular (10-19 personas)
          glowColor = 'rgba(255, 20, 147, 0.6)'
        } else if (count >= 5) {
          color = '#00FFFF' // Cyan para moderado (5-9 personas)
          glowColor = 'rgba(0, 255, 255, 0.6)'
        } else if (count > 0) {
          color = '#4FC3F7' // Azul claro para poco popular (1-4 personas)
          glowColor = 'rgba(79, 195, 247, 0.6)'
        } else {
          color = '#4A5568' // Gris para vacío
          glowColor = 'rgba(74, 85, 104, 0.4)'
        }
        
        // Crear elemento HTML para el marcador
        const el = document.createElement('div')
        el.style.position = 'absolute'
        el.style.cursor = 'pointer'
        el.style.width = '50px'
        el.style.height = '65px'
        el.style.display = 'flex'
        el.style.flexDirection = 'column'
        el.style.alignItems = 'center'
        
        // Pin con círculo perfecto y triángulo
        el.innerHTML = `
          <div style="
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${color};
            border: 3px solid rgba(255, 255, 255, 0.4);
            box-shadow: 
              0 0 20px ${glowColor},
              0 0 40px ${glowColor},
              inset 0 0 10px rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            transition: all 0.3s ease;
          ">${count}</div>
          <div style="
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 15px solid ${color};
            filter: drop-shadow(0 0 10px ${glowColor});
            margin-top: -3px;
          "></div>
        `
        
        // Añadir evento de click
        el.addEventListener('click', () => {
          onVenueClick(venue)
        })
        
        // Efecto hover
        el.addEventListener('mouseenter', () => {
          const circle = el.querySelector('div')
          if (circle) {
            circle.style.transform = 'scale(1.1)'
          }
        })
        
        el.addEventListener('mouseleave', () => {
          const circle = el.querySelector('div')
          if (circle) {
            circle.style.transform = 'scale(1)'
          }
        })
        
        // Crear y añadir el marcador al mapa
        const marker = new maplibregl.Marker({ 
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([venue.lng, venue.lat])
          .addTo(map)
        
        markersRef.current.push(marker)
      })
    }
    
    // Siempre esperar a que el mapa esté cargado antes de añadir marcadores
    if (map.loaded()) {
      addMarkers()
    } else {
      const onLoad = () => {
        addMarkers()
        map.off('load', onLoad)
      }
      map.on('load', onLoad)
    }
    
    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [venues, selectedVenueId, onVenueClick])
  
  return (
    <div className="w-full h-full relative">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      />
    </div>
  )
})

Map.displayName = 'Map'

export default Map
