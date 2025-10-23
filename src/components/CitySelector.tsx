'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, X } from 'lucide-react'

interface City {
  name: string
  lat: number
  lng: number
}

interface CitySelectorProps {
  selectedCity: City | null
  onCitySelect: (city: City) => void
  placeholder?: string
}

export default function CitySelector({ selectedCity, onCitySelect, placeholder = 'Buscar ciudad...' }: CitySelectorProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar ciudades usando la API de Nominatim (OpenStreetMap)
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=10`,
          {
            headers: {
              'User-Agent': 'WhereTonight/1.0'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities')
        }
        
        const data = await response.json()
        
        // Filtrar solo lugares que son ciudades, pueblos o lugares administrativos
        const cities: City[] = data
          .filter((item: any) => {
            // Aceptar lugares (cities, towns, villages, etc.)
            if (item.class === 'place') return true
            // Aceptar límites administrativos (municipios, etc.)
            if (item.class === 'boundary' && item.type === 'administrative') return true
            return false
          })
          .map((item: any) => {
            // Obtener el nombre de la ciudad (primer elemento antes de la coma)
            const cityName = item.display_name.split(',')[0].trim()
            return {
              name: cityName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }
          })
          // Eliminar duplicados por nombre
          .filter((city: City, index: number, self: City[]) => 
            index === self.findIndex((c: City) => c.name === city.name)
          )
        
        setSuggestions(cities)
        setIsOpen(cities.length > 0)
      } catch (error) {
        console.error('Error searching cities:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleSelectCity = (city: City) => {
    onCitySelect(city)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {selectedCity ? (
        <div className="flex items-center gap-2 bg-dark-secondary rounded-lg px-4 py-3 border border-neon-blue/30">
          <MapPin className="w-5 h-5 text-neon-blue" />
          <span className="flex-1 text-text-light">{selectedCity.name}</span>
          <button
            onClick={() => onCitySelect(null as any)}
            className="text-text-secondary hover:text-text-light transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(suggestions.length > 0)}
              placeholder={placeholder}
              className="w-full bg-dark-secondary text-text-light rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue border border-text-secondary/20"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-light transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown de sugerencias */}
          {isOpen && (loading || suggestions.length > 0) && (
            <div className="absolute z-50 w-full mt-2 bg-dark-card border border-neon-blue/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-text-secondary flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-blue"></div>
                  <span>Buscando...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-4 py-3 hover:bg-dark-secondary transition-colors border-b border-dark-secondary last:border-b-0 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-neon-blue flex-shrink-0" />
                    <span className="text-text-light">{city.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-text-secondary">
                  No se encontraron ciudades
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
