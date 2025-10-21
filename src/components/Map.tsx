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
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [viewState, setViewState] = useState({
    longitude: 21.0122,
    latitude: 52.2297,
    zoom: 13
  })
  const [isLocating, setIsLocating] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(13)
  
  // Función para calcular el tamaño del marcador basado en el zoom
  const getMarkerScale = (zoom: number) => {
    // Zoom base es 13, con escala de 1
    // A zoom 10 (alejado) -> escala 0.6
    // A zoom 16 (cerca) -> escala 1.4
    const baseZoom = 13
    const minScale = 0.5
    const maxScale = 1.5
    const scale = Math.min(maxScale, Math.max(minScale, 1 + (zoom - baseZoom) * 0.15))
    return scale
  }
  
  useImperativeHandle(ref, () => ({
    flyTo: (options: any) => {
      if (mapRef.current) {
        mapRef.current.getMap().flyTo(options)
      }
    }
  }))

  // Función para ir a la ubicación del usuario
  const goToUserLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const map = mapRef.current?.getMap()
        
        if (map) {
          // Remover marcador anterior si existe
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.remove()
          }

          // Crear elemento para el marcador de ubicación del usuario
          const el = document.createElement('div')
          el.style.width = '40px'
          el.style.height = '40px'
          el.style.display = 'flex'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          
          el.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, #00FFFF 0%, #0099FF 100%);
              border: 4px solid white;
              box-shadow: 
                0 0 0 4px rgba(0, 255, 255, 0.3),
                0 0 20px rgba(0, 255, 255, 0.6),
                0 4px 10px rgba(0, 0, 0, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              animation: pulse 2s infinite;
            ">
              <div style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: white;
                box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
              "></div>
            </div>
          `

          // Agregar animación de pulso
          const style = document.createElement('style')
          style.textContent = `
            @keyframes pulse {
              0%, 100% {
                box-shadow: 
                  0 0 0 4px rgba(0, 255, 255, 0.3),
                  0 0 20px rgba(0, 255, 255, 0.6),
                  0 4px 10px rgba(0, 0, 0, 0.4);
              }
              50% {
                box-shadow: 
                  0 0 0 8px rgba(0, 255, 255, 0.2),
                  0 0 30px rgba(0, 255, 255, 0.8),
                  0 4px 10px rgba(0, 0, 0, 0.4);
              }
            }
          `
          document.head.appendChild(style)

          // Crear y añadir el marcador
          const marker = new maplibregl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([longitude, latitude])
            .addTo(map)
          
          userLocationMarkerRef.current = marker

          // Centrar el mapa en la ubicación
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1500
          })
        }
        setIsLocating(false)
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos.')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }
  
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
        
        // Calcular escala inicial basada en el zoom actual
        const scale = getMarkerScale(currentZoom)
        
        // Crear elemento wrapper para el marcador (sin transformaciones)
        const el = document.createElement('div')
        el.className = 'venue-marker-wrapper'
        el.style.position = 'absolute'
        el.style.cursor = 'pointer'
        
        // Crear contenedor interno que se escalará
        const innerContainer = document.createElement('div')
        innerContainer.className = 'venue-marker-inner'
        innerContainer.style.width = '50px'
        innerContainer.style.height = '65px'
        innerContainer.style.display = 'flex'
        innerContainer.style.flexDirection = 'column'
        innerContainer.style.alignItems = 'center'
        innerContainer.style.transformOrigin = 'bottom center'
        innerContainer.style.transform = `scale(${scale})`
        innerContainer.style.transition = 'transform 0.3s ease'
        innerContainer.style.willChange = 'transform'
        
        // Pin con círculo perfecto y triángulo (tamaños fijos)
        innerContainer.innerHTML = `
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
        
        el.appendChild(innerContainer)
        
        // Añadir evento de click
        el.addEventListener('click', () => {
          onVenueClick(venue)
        })
        
        // Crear y añadir el marcador al mapa
        const marker = new maplibregl.Marker({ 
          element: el,
          anchor: 'bottom' // Anclar en la parte inferior del wrapper (punta del pin)
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
  
  // Actualizar escala de marcadores cuando cambie el zoom
  useEffect(() => {
    if (markersRef.current.length === 0) return
    
    const scale = getMarkerScale(currentZoom)
    
    markersRef.current.forEach((marker) => {
      const el = marker.getElement()
      if (el && el.classList.contains('venue-marker-wrapper')) {
        // Buscar el contenedor interno y aplicar el scale
        const innerContainer = el.querySelector('.venue-marker-inner') as HTMLElement
        if (innerContainer) {
          innerContainer.style.transform = `scale(${scale})`
        }
      }
    })
  }, [currentZoom])
  
  return (
    <div className="w-full h-full relative">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => {
          setViewState(evt.viewState)
          setCurrentZoom(evt.viewState.zoom)
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      />
      
      {/* Botón de ubicación - arriba a la derecha debajo del botón de filtro */}
      <button
        onClick={goToUserLocation}
        disabled={isLocating}
        className="absolute top-16 right-4 bg-dark-secondary/80 backdrop-blur-sm hover:bg-dark-secondary text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-text-secondary/20"
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), 0 4px 6px rgba(0, 0, 0, 0.5)'
        }}
        aria-label="Ir a mi ubicación"
      >
        {isLocating ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  )
})

Map.displayName = 'Map'

export default Map
