'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Navigation, Star } from 'lucide-react'
import { logger } from '@/lib/logger'

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name: string
  type?: string
}

interface TwoStepSearchBarProps {
  onCitySelected: (city: { name: string; lat: number; lng: number }) => void
  onVenueSearch: (query: string) => void
  onFilterChange: (filter: 'nearby' | 'rated', isActive: boolean) => void
  onClear: () => void
  resultsCount: number
  activeFilters: Set<'nearby' | 'rated'>
}

export default function TwoStepSearchBar({
  onCitySelected,
  onVenueSearch,
  onFilterChange,
  onClear,
  resultsCount,
  activeFilters
}: TwoStepSearchBarProps) {
  const [step, setStep] = useState<'city' | 'venue'>('city')
  const [cityQuery, setCityQuery] = useState('')
  const [venueQuery, setVenueQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cityResults, setCityResults] = useState<SearchResult[]>([])
  const [showCityResults, setShowCityResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Buscar ciudades usando Nominatim
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCityResults([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&featuretype=city&accept-language=es`
      )
      const data = await response.json()
      setCityResults(data)
      setShowCityResults(true)
      logger.trackEvent('city_search_two_step', { query, resultsCount: data.length })
    } catch (error) {
      logger.error('Error al buscar ciudades', error as Error, { query })
      setCityResults([])
    }
  }

  // Debounce para búsqueda de ciudades
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (cityQuery && step === 'city') {
      searchTimeoutRef.current = setTimeout(() => {
        searchCities(cityQuery)
      }, 300)
    } else {
      setCityResults([])
      setShowCityResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [cityQuery, step])

  // Debounce para búsqueda de venues
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (step === 'venue') {
      searchTimeoutRef.current = setTimeout(() => {
        onVenueSearch(venueQuery)
      }, 300)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [venueQuery, step, onVenueSearch])

  const handleSelectCity = (result: SearchResult) => {
    const cityName = result.name || result.display_name.split(',')[0]
    setSelectedCity(cityName)
    setCityQuery('')
    setShowCityResults(false)
    setStep('venue')
    
    onCitySelected({
      name: cityName,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    })

    // Focus en el input para continuar con la búsqueda de venue
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClear = () => {
    setStep('city')
    setCityQuery('')
    setVenueQuery('')
    setSelectedCity(null)
    setCityResults([])
    setShowCityResults(false)
    onClear()
  }

  const handleFilterClick = (filter: 'nearby' | 'rated') => {
    const isCurrentlyActive = activeFilters.has(filter)
    onFilterChange(filter, !isCurrentlyActive)
  }

  const getPlaceholder = () => {
    if (step === 'city') {
      return 'Buscar ciudad...'
    }
    return `${selectedCity} › busca un local (opcional)`
  }

  const getCurrentValue = () => {
    return step === 'city' ? cityQuery : venueQuery
  }

  const handleInputChange = (value: string) => {
    if (step === 'city') {
      setCityQuery(value)
    } else {
      setVenueQuery(value)
    }
  }

  return (
    <div className="p-4 bg-dark-card border-b border-neon-blue/20">
      {/* Barra de búsqueda principal */}
      <div className="relative mb-3">
        <div className="flex items-center bg-dark-secondary rounded-lg border border-neon-blue/30 focus-within:border-neon-blue transition-colors">
          <Search className="ml-3 w-5 h-5 text-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={getCurrentValue()}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 bg-transparent text-text-light placeholder-text-secondary outline-none px-3 py-3"
          />
          {(selectedCity || cityQuery || venueQuery) && (
            <button
              onClick={handleClear}
              className="mr-2 p-1.5 hover:bg-dark-primary/50 rounded-full transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-5 h-5 text-text-secondary hover:text-neon-pink" />
            </button>
          )}
        </div>

        {/* Resultados de búsqueda de ciudades */}
        {showCityResults && cityResults.length > 0 && step === 'city' && (
          <div className="absolute z-50 mt-2 w-full bg-dark-card/95 backdrop-blur-md border border-neon-blue/30 rounded-lg shadow-lg shadow-neon-blue/20 overflow-hidden max-h-64 overflow-y-auto">
            {cityResults.map((result) => (
              <button
                key={result.place_id}
                className="w-full text-left px-4 py-3 hover:bg-dark-secondary transition-colors border-b border-neon-blue/10 last:border-b-0"
                onClick={() => handleSelectCity(result)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neon-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-text-light font-medium truncate">
                      {result.name || result.display_name.split(',')[0]}
                    </div>
                    <div className="text-text-secondary text-xs truncate">
                      {result.display_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips de filtros rápidos - Solo se muestran cuando hay ciudad seleccionada */}
      {selectedCity && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleFilterClick('nearby')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeFilters.has('nearby')
                ? 'bg-neon-blue text-white shadow-md shadow-neon-blue/30'
                : 'bg-dark-secondary text-text-light border border-neon-blue/30 hover:border-neon-blue'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Cerca de mí
          </button>
          <button
            onClick={() => handleFilterClick('rated')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeFilters.has('rated')
                ? 'bg-neon-purple text-white shadow-md shadow-neon-purple/30'
                : 'bg-dark-secondary text-text-light border border-neon-purple/30 hover:border-neon-purple'
            }`}
          >
            <Star className="w-4 h-4" />
            Mejor valorados
          </button>
        </div>
      )}

      {/* Contador de resultados */}
      {selectedCity && (
        <div className="text-sm text-text-secondary">
          <span className="text-neon-blue font-semibold">{resultsCount}</span> locales encontrados
          {venueQuery && ` para "${venueQuery}"`}
          {activeFilters.has('nearby') && ' cerca de ti'}
          {activeFilters.has('rated') && ' mejor valorados'}
        </div>
      )}

      {/* Mensaje cuando no hay ciudad seleccionada */}
      {!selectedCity && !cityQuery && (
        <div className="text-sm text-text-secondary">
          Busca una ciudad para ver los locales disponibles
        </div>
      )}
    </div>
  )
}
