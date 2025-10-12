'use client'

import { useState, useMemo } from 'react'
import { VenueWithCount } from '@/lib/database.types'
import VenueCard from './VenueCard'
import { Search, Filter } from 'lucide-react'

interface VenueListProps {
  venues: VenueWithCount[]
  isAuthenticated: boolean
  hasUsedTicketToday: boolean
  onTicketUsed: () => void
  onAuthRequired: () => void
  onVenueClick: (venue: VenueWithCount) => void
}

export default function VenueList({ 
  venues, 
  isAuthenticated, 
  hasUsedTicketToday, 
  onTicketUsed,
  onAuthRequired,
  onVenueClick
}: VenueListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'club' | 'bar' | 'other'>('all')

  // Filtrar y ordenar venues
  const filteredVenues = useMemo(() => {
    let filtered = venues

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(venue => venue.type === filterType)
    }

    // Ordenar por afluencia descendente (los más populares primero)
    return filtered.sort((a, b) => b.count_today - a.count_today)
  }, [venues, searchTerm, filterType])

  return (
    <div className="h-full flex flex-col pb-16 lg:pb-0">
      {/* Header con controles */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Locales en Varsovia ({filteredVenues.length})
        </h2>
        
        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros por tipo */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="club">🎵 Clubs</option>
            <option value="bar">🍺 Bares</option>
            <option value="other">🏪 Otros</option>
          </select>
        </div>
      </div>

      {/* Lista de venues */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredVenues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron locales que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <div 
              key={venue.id}
              onClick={() => onVenueClick(venue)}
              className="cursor-pointer"
            >
              <VenueCard
                venue={venue}
                isAuthenticated={isAuthenticated}
                hasUsedTicketToday={hasUsedTicketToday}
                onTicketUsed={onTicketUsed}
                onAuthRequired={onAuthRequired}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-center text-gray-600">
        <div className="flex justify-between items-center">
          <span>Total hoy: {venues.reduce((sum, v) => sum + v.count_today, 0)} personas</span>
          <span>Locales activos: {venues.length}</span>
        </div>
      </div>
    </div>
  )
}
