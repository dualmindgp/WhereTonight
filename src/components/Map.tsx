'use client'

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import { VenueWithCount } from '@/lib/database.types'
import maplibregl from 'maplibre-gl'

export interface MapProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
  selectedVenueId?: string | null
  initialCenter?: { lat: number; lng: number } | null
}

const Map = forwardRef<any, MapProps>(({ venues, onVenueClick, selectedVenueId, initialCenter }, ref) => {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.lng || 21.0122,  // Usar ciudad seleccionada o Varsovia por defecto
    latitude: initialCenter?.lat || 52.2297,
    zoom: 13
  })
  const [isLocating, setIsLocating] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(13)
  const [mapReady, setMapReady] = useState(false)
  
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

  // Handler cuando el mapa se carga
  const handleMapLoad = () => {
    console.log('🗺️ Map loaded callback fired!')
    setMapReady(true)
  }

  // Actualizar mapa cuando cambia la ciudad seleccionada
  useEffect(() => {
    if (initialCenter && mapRef.current && mapReady) {
      const map = mapRef.current.getMap()
      if (map && map.loaded()) {
        map.flyTo({
          center: [initialCenter.lng, initialCenter.lat],
          zoom: 13,
          duration: 2000
        })
      }
    }
  }, [initialCenter, mapReady])

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
    console.log(`📍 Markers effect triggered: mapReady=${mapReady}, venues=${venues.length}`)
    
    if (!mapReady) {
      console.log('⏳ Map not ready yet, skipping markers')
      return
    }
    
    if (!mapRef.current) {
      console.log('❌ Map ref not ready')
      return
    }
    
    const map = mapRef.current.getMap()
    if (!map) {
      console.log('❌ Map not available')
      return
    }
    
    if (venues.length === 0) {
      console.log('📍 No venues to display')
      // Limpiar marcadores si no hay venues
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      return
    }
    
    console.log(`📍 Preparing to add ${venues.length} markers to map`)
    
    // Esperar a que el mapa se cargue completamente
    const addMarkers = () => {
      console.log('🎯 Starting to add markers...')
      console.log(`Map state: loaded=${map.loaded()}, styleLoaded=${map.isStyleLoaded()}`)
      
      // Limpiar marcadores anteriores
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      let addedCount = 0
      
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
        innerContainer.style.width = '40px'
        innerContainer.style.height = '60px'
        innerContainer.style.display = 'flex'
        innerContainer.style.flexDirection = 'column'
        innerContainer.style.alignItems = 'center'
        innerContainer.style.justifyContent = 'flex-start'
        innerContainer.style.transformOrigin = 'bottom center'
        innerContainer.style.transform = `scale(${scale})`
        innerContainer.style.transition = 'transform 0.3s ease'
        innerContainer.style.willChange = 'transform'
        
        // Pin estilo premium con base luminosa y halo suave (sin número)
        innerContainer.innerHTML = `
          <div class="marker-live" style="
            position: relative;
            width: 40px;
            height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          ">
            <!-- Halo suave alrededor del pin -->
            <div class="ring" style="
              position: absolute;
              top: 2px;
              left: 50%;
              width: 34px;
              height: 34px;
              transform: translateX(-50%) rotate(-45deg);
              border-radius: 50% 50% 50% 0;
              border: 2px solid ${color};
              box-shadow: 0 0 18px ${glowColor};
              opacity: 0.9;
              animation: pulseRing 2.2s infinite ease-out;
              transform-origin: center;
            "></div>

            <!-- Pin principal (gota con degradado) -->
            <div class="marker-pin" style="
              width: 40px;
              height: 40px;
              background: radial-gradient(circle at 30% 20%, ${color} 0%, ${color} 45%, #0a0a0a 100%);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid rgba(255, 255, 255, 0.4);
              box-shadow: 
                0 0 18px ${glowColor},
                0 0 36px ${glowColor},
                0 6px 14px rgba(0, 0, 0, 0.5);
              position: relative;
              z-index: 2;
              overflow: hidden;
            ">
            </div>

            <!-- Base circular luminosa bajo el pin -->
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 32px;
              height: 12px;
              border-radius: 50%;
              background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
              opacity: 0.9;
              filter: blur(2px);
            "></div>
          </div>
        `
        
        el.appendChild(innerContainer)
        
        // Añadir evento de hover (ligera ampliación visual del pin)
        el.addEventListener('mouseenter', () => {
          const pin = innerContainer.querySelector('.marker-pin') as HTMLElement
          if (pin) {
            pin.style.boxShadow = `0 0 24px ${glowColor}, 0 0 48px ${glowColor}, 0 8px 18px rgba(0,0,0,0.6)`
          }
        })
        
        el.addEventListener('mouseleave', () => {
          const pin = innerContainer.querySelector('.marker-pin') as HTMLElement
          if (pin) {
            pin.style.boxShadow = `0 0 18px ${glowColor}, 0 0 36px ${glowColor}, 0 6px 14px rgba(0,0,0,0.5)`
          }
        })
        
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
        addedCount++
      })
      
      console.log(`✅ Successfully added ${addedCount} markers to the map`)
    }
    
    // Usar estrategia más confiable: esperar evento 'idle' que garantiza que el mapa está completamente renderizado
    const attemptAddMarkers = () => {
      if (map.loaded() && map.isStyleLoaded()) {
        console.log('Map is fully loaded and styled, adding markers')
        addMarkers()
      } else {
        console.log('Map not fully ready, waiting for idle event')
        const onIdle = () => {
          console.log('Map idle event fired, adding markers')
          addMarkers()
          map.off('idle', onIdle)
        }
        map.once('idle', onIdle)
      }
    }
    
    attemptAddMarkers()
    
    return () => {
      console.log('🧹 Cleaning up markers')
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [venues, selectedVenueId, mapReady])
  
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
        onLoad={handleMapLoad}
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
