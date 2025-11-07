'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Search, X, Sparkles } from 'lucide-react'

interface City {
  name: string
  lat: number
  lng: number
  country?: string
}

interface CityOnboardingProps {
  onCitySelect: (city: City) => void
}

// Ciudades principales de España + Varsovia
const FEATURED_CITIES: City[] = [
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'España' },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734, country: 'España' },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763, country: 'España' },
  { name: 'Sevilla', lat: 37.3891, lng: -5.9845, country: 'España' },
  { name: 'Zaragoza', lat: 41.6488, lng: -0.8891, country: 'España' },
  { name: 'Málaga', lat: 36.7213, lng: -4.4214, country: 'España' },
  { name: 'Bilbao', lat: 43.263, lng: -2.935, country: 'España' },
  { name: 'Varsovia', lat: 52.2297, lng: 21.0122, country: 'Polonia' },
]

export default function CityOnboarding({ onCitySelect }: CityOnboardingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Animación de entrada escalonada
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationStep(1), 100),
      setTimeout(() => setAnimationStep(2), 400),
      setTimeout(() => setAnimationStep(3), 800),
    ]
    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  // Auto-focus en búsqueda cuando se abre
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Búsqueda de ciudades OPTIMIZADA
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Priorizar búsqueda en Europa (España primero)
        const queries = [
          // 1. Buscar en España primero
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)},España&` +
          `format=json&addressdetails=1&limit=4&featuretype=city&accept-language=es`,
          // 2. Buscar en Europa
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)},Europe&` +
          `format=json&addressdetails=1&limit=4&featuretype=city&accept-language=es`
        ]

        const results = await Promise.all(
          queries.map(url => 
            fetch(url, {
              headers: { 'User-Agent': 'WhereTonight/1.0' }
            }).then(r => r.json()).catch(() => [])
          )
        )
        
        const allResults = [...results[0], ...results[1]]
        
        const cities: City[] = allResults
          .filter((item: any) => {
            // Filtrar solo ciudades reales
            const place = item.class === 'place'
            const boundary = item.class === 'boundary' && item.type === 'administrative'
            const isCity = place || boundary
            
            // Excluir lugares muy pequeños
            const importance = parseFloat(item.importance) || 0
            const isRelevant = importance > 0.3
            
            return isCity && isRelevant
          })
          .map((item: any) => {
            const cityName = item.display_name.split(',')[0].trim()
            const country = item.address?.country || ''
            const importance = parseFloat(item.importance) || 0
            
            return {
              name: cityName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              country,
              importance
            }
          })
          // Eliminar duplicados
          .filter((city: any, index: number, self: any[]) => 
            index === self.findIndex((c: any) => 
              c.name.toLowerCase() === city.name.toLowerCase() && 
              c.country === city.country
            )
          )
          // Ordenar por relevancia (importancia)
          .sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0))
          // Limitar a 8 resultados
          .slice(0, 8)
          // Remover campo importance del resultado final
          .map(({ importance, ...city }: any) => city)
        
        setSearchResults(cities)
      } catch (error) {
        console.error('Error searching cities:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500) // Aumentado de 300ms a 500ms para reducir llamadas

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const handleCitySelect = (city: City) => {
    // Guardar en sessionStorage (solo durante la sesión actual)
    sessionStorage.setItem('selectedCity', JSON.stringify(city))
    
    // Animación de salida antes de seleccionar
    setAnimationStep(4)
    setTimeout(() => {
      onCitySelect(city)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark-primary overflow-y-auto">
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-neon-blue/20 animate-float"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 min-h-screen flex flex-col justify-center pb-32">
        {/* Pregunta principal */}
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          } ${animationStep === 4 ? 'opacity-0 -translate-y-20' : ''}`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-neon-pink animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-blue to-neon-pink animate-gradient">
              ¿Dónde te apetece salir hoy?
            </h1>
            <Sparkles className="w-8 h-8 text-neon-blue animate-pulse" />
          </div>
          <p className="text-text-secondary text-lg md:text-xl">
            Selecciona tu ciudad y descubre la mejor vida nocturna
          </p>
        </div>

        {/* Vista de búsqueda */}
        {showSearch ? (
          <div 
            className={`transition-all duration-500 ${
              animationStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${animationStep === 4 ? 'opacity-0 scale-95' : ''}`}
          >
            <div className="bg-dark-card rounded-3xl p-6 border border-neon-blue/30 shadow-2xl">
              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca cualquier ciudad del mundo..."
                  className="w-full bg-dark-secondary text-text-light rounded-xl pl-12 pr-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue border border-text-secondary/20"
                />
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resultados de búsqueda */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitySelect(city)}
                        className="group bg-dark-secondary hover:bg-dark-hover rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neon-pink/20 border border-transparent hover:border-neon-pink/40 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-text-light font-semibold text-lg truncate">
                              {city.name}
                            </p>
                            {city.country && (
                              <p className="text-text-secondary text-sm truncate">
                                {city.country}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-12 text-text-secondary">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron ciudades</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-secondary">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Escribe al menos 2 caracteres para buscar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Grid de ciudades principales */}
            <div 
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 ${
                animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${animationStep === 4 ? 'opacity-0 translate-y-20' : ''}`}
            >
              {FEATURED_CITIES.map((city, index) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className="group bg-dark-card hover:bg-dark-secondary rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-neon-blue/30 border border-neon-blue/20 hover:border-neon-pink/40"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-neon-pink/30">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-text-light font-bold text-lg group-hover:text-neon-blue transition-colors">
                        {city.name}
                      </p>
                      {city.country && (
                        <p className="text-text-secondary text-sm">
                          {city.country}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Botón de búsqueda personalizada */}
            <div 
              className={`text-center mb-16 transition-all duration-700 delay-300 ${
                animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${animationStep === 4 ? 'opacity-0 translate-y-20' : ''}`}
            >
              <button
                onClick={() => setShowSearch(true)}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-neon-pink to-neon-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-neon-pink/50"
              >
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Buscar otra ciudad</span>
              </button>
              <p className="text-text-secondary text-sm mt-4">
                o selecciona una ciudad de arriba
              </p>
            </div>
          </>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FF1493, #00BFFF);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #FF69B4, #1E90FF);
        }
      `}</style>
    </div>
  )
}
