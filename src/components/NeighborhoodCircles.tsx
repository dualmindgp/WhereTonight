'use client'

import React from 'react'
import { VenueWithCount } from '@/lib/database.types'

// Agrupar venues por vecindarios (aprox basado en ubicación geográfica)
interface Neighborhood {
  id: string
  name: string
  count: number
  lat: number
  lng: number
  trending?: boolean
  venues: VenueWithCount[]
}

interface NeighborhoodCirclesProps {
  venues: VenueWithCount[]
  onNeighborhoodClick: (neighborhood: Neighborhood) => void
}

export default function NeighborhoodCircles({ venues, onNeighborhoodClick }: NeighborhoodCirclesProps) {
  // Definimos algunos vecindarios de Varsovia (esto debería venir de una API en una app real)
  const predefinedNeighborhoods = [
    { id: 'nowy-swiat', name: 'Nowy Świat', lat: 52.2319, lng: 21.0203, trending: true },
    { id: 'powisle', name: 'Powiśle', lat: 52.2380, lng: 21.0310 },
    { id: 'praga', name: 'Praga District', lat: 52.2505, lng: 21.0440 },
    { id: 'muranow', name: 'Muranów', lat: 52.2444, lng: 20.9921 }
  ]
  
  // Agrupa venues por vecindario (simplificado - en una app real habría que usar un algoritmo más sofisticado)
  const calculateNeighborhoods = (): Neighborhood[] => {
    const neighborhoods = predefinedNeighborhoods.map(neighborhood => {
      // Encontrar venues cercanos a este vecindario (simplificado)
      const neighborhoodVenues = venues.filter(venue => {
        // Radio aproximado de 1km
        const distance = Math.sqrt(
          Math.pow((venue.lat - neighborhood.lat) * 111, 2) + 
          Math.pow((venue.lng - neighborhood.lng) * 111, 2)
        )
        return distance < 1
      })
      
      // Sumar la cantidad de personas
      const count = neighborhoodVenues.reduce((sum, venue) => sum + venue.count_today, 0)
      
      return {
        ...neighborhood,
        count,
        venues: neighborhoodVenues
      }
    })
    
    // Ordenar por popularidad
    return neighborhoods.sort((a, b) => b.count - a.count)
  }
  
  const neighborhoods = calculateNeighborhoods()
  
  const getColorClass = (neighborhood: Neighborhood, index: number) => {
    if (neighborhood.trending || index === 0) return 'border-neon-pink shadow-neon-pink text-neon-pink'
    if (index === 1) return 'border-neon-blue shadow-neon-blue text-neon-blue'
    return 'border-neon-cyan shadow-neon-cyan text-neon-cyan'
  }
  
  return (
    <div>
      {neighborhoods.map((neighborhood, index) => (
        <div 
          key={neighborhood.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${neighborhood.lng * 100}%`, 
            top: `${neighborhood.lat * 100}%`,
            zIndex: 1000 - index
          }}
          onClick={() => onNeighborhoodClick(neighborhood)}
        >
          <div className={`flex flex-col items-center`}>
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getColorClass(neighborhood, index)} text-2xl font-bold bg-dark-primary bg-opacity-70`}
              style={{
                boxShadow: `0 0 15px ${index === 0 ? '#FF00FF' : index === 1 ? '#00BFFF' : '#00FFFF'}`
              }}
            >
              {neighborhood.count}
            </div>
            <div className="mt-1 text-text-light font-medium text-center">
              {neighborhood.name}
            </div>
            {neighborhood.trending && (
              <div className="text-xs text-yellow-400">
                {neighborhood.count} trending
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
