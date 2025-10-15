'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Users, Star, DollarSign, MapPin } from 'lucide-react'
import { VenueWithCount } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'
import TwoStepSearchBar from './TwoStepSearchBar'

interface SearchScreenProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
}

export default function SearchScreen({ venues, onVenueClick }: SearchScreenProps) {
  const { t } = useLanguage()
  const [venueSearchQuery, setVenueSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const [activeFilter, setActiveFilter] = useState<'nearby' | 'open' | 'rated' | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const distanceRef = userLocation || selectedCity

  // Distancias memoizadas por venue.id contra la referencia (userLocation o ciudad)
  const distancesById = useMemo(() => {
    if (!distanceRef) return {} as Record<string, number>
    const map: Record<string, number> = {}
    for (const v of venues) {
      if (Number.isFinite(v.lat) && Number.isFinite(v.lng)) {
        map[v.id] = getDistanceFromLatLonInKm(distanceRef.lat, distanceRef.lng, v.lat, v.lng)
      } else {
        map[v.id] = Number.POSITIVE_INFINITY
      }
    }
    return map
  }, [venues, distanceRef])

  // Solicitar ubicación del usuario al montar el componente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error)
        }
      )
    }
  }, [])

  // Si tenemos ubicación del usuario y una ciudad seleccionada, activar automáticamente el filtro "Cerca de mí"
  useEffect(() => {
    if (userLocation && selectedCity && activeFilter !== 'nearby') {
      setActiveFilter('nearby')
    }
  }, [userLocation, selectedCity, activeFilter])

  // Filtrar venues por ciudad (usando proximidad geográfica)
  const venuesByCity = useMemo(() => {
    if (!selectedCity) return []

    // Filtrar venues dentro de un radio de ~50km de la ciudad seleccionada
    const RADIUS_KM = 50
    const filtered = venues.filter(venue => {
      const distance = getDistanceFromLatLonInKm(
        selectedCity.lat,
        selectedCity.lng,
        venue.lat,
        venue.lng
      )
      return distance <= RADIUS_KM
    })

    return filtered
  }, [venues, selectedCity])

  // Filtrar y ordenar venues
  const filteredVenues = useMemo(() => {
    let filtered = venuesByCity

    // Filtrar por búsqueda de venue
    if (venueSearchQuery.trim()) {
      const query = venueSearchQuery.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.address?.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query)
      )
    }

    // Aplicar filtros rápidos
    if (activeFilter === 'nearby') {
      // Ordenar por distancia (más cercanos primero) usando el mapa de distancias memoizado
      if (distanceRef) {
        filtered = [...filtered].sort((a, b) => {
          const distA = distancesById[a.id] ?? Number.POSITIVE_INFINITY
          const distB = distancesById[b.id] ?? Number.POSITIVE_INFINITY
          if (distA === distB) return a.name.localeCompare(b.name)
          return distA - distB
        })
      }
    } else if (activeFilter === 'open') {
      // Filtrar solo los que tienen opening_hours (simplificado)
      filtered = filtered.filter(v => v.opening_hours)
    } else if (activeFilter === 'rated') {
      // Ordenar por rating (mejor valorados primero)
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else {
      // Por defecto: si tenemos referencia de distancia, ordenar por distancia; si no, por popularidad
      if (distanceRef) {
        filtered = [...filtered].sort((a, b) => {
          const distA = distancesById[a.id] ?? Number.POSITIVE_INFINITY
          const distB = distancesById[b.id] ?? Number.POSITIVE_INFINITY
          if (distA === distB) return a.name.localeCompare(b.name)
          return distA - distB
        })
      } else {
        filtered = [...filtered].sort((a, b) => (b.count_today || 0) - (a.count_today || 0))
      }
    }

    return filtered
  }, [venuesByCity, venueSearchQuery, activeFilter, selectedCity, userLocation, distanceRef, distancesById])

  // Función para calcular distancia entre dos puntos geográficos
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    if ([lat1, lon1, lat2, lon2].some((n) => !Number.isFinite(n))) return Number.POSITIVE_INFINITY
    const R = 6371 // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  const handleCitySelected = (city: { name: string; lat: number; lng: number }) => {
    setSelectedCity(city)
    setVenueSearchQuery('')
    setActiveFilter(null)
  }

  const handleVenueSearch = (query: string) => {
    setVenueSearchQuery(query)
  }

  const handleFilterChange = (filter: 'nearby' | 'open' | 'rated' | null) => {
    setActiveFilter(filter)
  }

  const handleClear = () => {
    setSelectedCity(null)
    setVenueSearchQuery('')
    setActiveFilter(null)
  }

  const renderPriceLevel = (level?: number | null) => {
    if (!level) return null
    return (
      <div className="flex">
        {Array.from({ length: 4 }).map((_, i) => (
          <DollarSign
            key={i}
            className={`w-3 h-3 ${i < level ? 'text-green-500' : 'text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-primary">
      {/* Two-Step Search Bar */}
      <TwoStepSearchBar
        onCitySelected={handleCitySelected}
        onVenueSearch={handleVenueSearch}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        resultsCount={filteredVenues.length}
      />

      {/* Venues list */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCity ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary px-8 text-center">
            <div className="mb-6">
              <Search className="w-20 h-20 opacity-40 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-text-light mb-3">Busca una ciudad</h2>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              Empieza escribiendo el nombre de una ciudad para descubrir los mejores locales
            </p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary px-6 text-center">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium text-text-light mb-2">No se encontraron locales</p>
            <p className="text-sm">
              {venueSearchQuery 
                ? `No hay resultados para "${venueSearchQuery}" en ${selectedCity.name}`
                : `No hay locales disponibles en ${selectedCity.name}`
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => onVenueClick(venue)}
                className="bg-dark-card rounded-lg overflow-hidden cursor-pointer hover:bg-dark-secondary transition-colors border border-neon-blue/10"
              >
                <div className="flex">
                  {/* Photo */}
                  <div className="w-24 h-24 flex-shrink-0 relative bg-dark-secondary">
                    {venue.photo_ref ? (
                      <img
                        src={`/api/photo?ref=${venue.photo_ref}&type=${venue.type}`}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback automático desde el servidor
                          if (!e.currentTarget.src.includes('fallback')) {
                            e.currentTarget.src = `/api/photo?type=${venue.type}&fallback=true`
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={`/api/photo?type=${venue.type}&fallback=true`}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Count badge */}
                    {(venue.count_today || 0) > 0 && (
                      <div className="absolute top-1 right-1 bg-neon-pink text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {venue.count_today}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 relative">
                    <h3 className="text-text-light font-bold text-lg mb-1">
                      {venue.name}
                    </h3>
                    
                    {/* Rating & Price */}
                    <div className="flex items-center gap-3 mb-2">
                      {venue.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-text-light text-sm">{venue.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {renderPriceLevel(venue.price_level)}
                    </div>

                    {/* Address */}
                    {venue.address && (
                      <p className="text-text-secondary text-xs line-clamp-2">
                        {venue.address}
                      </p>
                    )}

                    {/* Type tag */}
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 bg-neon-blue/20 text-neon-blue text-xs rounded-full">
                        {venue.type === 'club' ? 'Club' : venue.type === 'bar' ? 'Bar' : 'Otro'}
                      </span>
                    </div>

                    {/* Distance - Abajo a la derecha */}
                    {(() => {
                      if (!distanceRef) return null
                      const d = distancesById[venue.id]
                      if (!Number.isFinite(d)) return null
                      return (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-text-secondary text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {d.toFixed(1)} km
                        </span>
                      </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
