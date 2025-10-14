'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import LogoLoop from './LogoLoop'

interface TopNavBarProps {
  onCityChange?: (location: { name: string; lat: number; lng: number }) => void
  onSearchFriends?: () => void
  onFilterClick?: () => void
  topVenues?: Array<{ name: string; count: number }>
}

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name: string
}

export default function TopNavBar({ 
  onCityChange, 
  onSearchFriends,
  onFilterClick,
  topVenues = []
}: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Warsaw')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Buscar ciudades usando Nominatim (OpenStreetMap)
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error searching cities:', error)
      setSearchResults([])
    }
  }

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCities(searchQuery)
      }, 300)
    } else {
      setSearchResults([])
      setShowResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSelectCity = (result: SearchResult) => {
    const cityName = result.name || result.display_name.split(',')[0]
    setSelectedCity(cityName)
    setSearchQuery('')
    setShowResults(false)
    setIsSearching(false)
    
    if (onCityChange) {
      onCityChange({
        name: cityName,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      })
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 space-x-2">
      {/* City Search Input */}
      <div className="relative flex-1 max-w-xs">
        {!isSearching ? (
          // Botón para mostrar la ciudad seleccionada
          <button
            onClick={() => {
              setIsSearching(true)
              setTimeout(() => searchInputRef.current?.focus(), 100)
            }}
            className="flex items-center space-x-2 bg-dark-secondary/80 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 text-text-light border border-neon-purple/30 shadow-lg shadow-neon-purple/10 hover:bg-dark-secondary transition-colors w-full"
          >
            <MapPin className="w-5 h-5 text-neon-purple flex-shrink-0" />
            <span className="text-neon-purple font-medium truncate">{selectedCity}</span>
          </button>
        ) : (
          // Input de búsqueda
          <div className="relative">
            <div className="flex items-center bg-dark-secondary/80 backdrop-blur-sm rounded-full pl-3 pr-2 py-2 border border-neon-purple/30 shadow-lg shadow-neon-purple/10">
              <Search className="w-5 h-5 text-neon-purple flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  // Pequeño delay para permitir clicks en resultados
                  setTimeout(() => {
                    if (!searchQuery) {
                      setIsSearching(false)
                    }
                  }, 200)
                }}
                placeholder="Buscar ciudad..."
                className="flex-1 bg-transparent text-text-light placeholder-text-secondary outline-none px-2 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-dark-primary/50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 mt-2 w-full bg-dark-card/95 backdrop-blur-md border border-neon-purple/30 rounded-lg shadow-lg shadow-neon-purple/20 overflow-hidden">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    className="w-full text-left px-4 py-3 hover:bg-dark-secondary transition-colors border-b border-neon-purple/10 last:border-b-0"
                    onClick={() => handleSelectCity(result)}
                    onMouseDown={(e) => e.preventDefault()} // Prevenir blur del input
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
        )}
      </div>

      {/* Logo Loop in the center */}
      <div className="flex-1 overflow-hidden px-2">
        <LogoLoop
          logos={
            topVenues.length > 0
              ? [
                  { node: <span className="text-neon-pink font-bold text-lg">🔥 TRENDING</span> },
                  ...topVenues.slice(0, 5).map(venue => ({
                    node: (
                      <span className="text-neon-cyan font-semibold">
                        {venue.name} ({venue.count})
                      </span>
                    )
                  }))
                ]
              : [
                  { node: <span className="text-neon-pink font-bold text-lg">🎉 HOT NOW</span> },
                  { node: <span className="text-neon-cyan font-semibold">Platinium</span> },
                  { node: <span className="text-neon-purple font-semibold">VooDoo Club</span> },
                  { node: <span className="text-neon-blue font-semibold">Level 27</span> },
                  { node: <span className="text-neon-pink font-semibold">Smolna</span> },
                  { node: <span className="text-neon-cyan font-semibold">Sketch</span> },
                ]
          }
          speed={60}
          direction="left"
          logoHeight={20}
          gap={24}
          pauseOnHover={true}
          fadeOut={true}
          fadeOutColor="rgba(11, 11, 11, 1)"
          scaleOnHover={false}
        />
      </div>

      {/* Filter Button */}
      <button 
        onClick={onFilterClick}
        className="bg-dark-secondary/80 backdrop-blur-sm p-2 rounded-full border border-text-secondary/20 shadow-lg hover:bg-dark-secondary transition-colors flex-shrink-0"
      >
        <SlidersHorizontal className="w-5 h-5 text-text-light" />
      </button>
    </div>
  )
}
