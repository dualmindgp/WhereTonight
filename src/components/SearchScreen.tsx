'use client'

import { useState, useMemo } from 'react'
import { Search, Users, Star, DollarSign } from 'lucide-react'
import { VenueWithCount } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'

interface SearchScreenProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
}

export default function SearchScreen({ venues, onVenueClick }: SearchScreenProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar y ordenar venues
  const filteredVenues = useMemo(() => {
    let filtered = venues

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.address?.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query)
      )
    }

    // Ordenar por popularidad (count_today descendente)
    return filtered.sort((a, b) => (b.count_today || 0) - (a.count_today || 0))
  }, [venues, searchQuery])

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
      {/* Search header */}
      <div className="p-4 bg-dark-card border-b border-neon-blue/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-secondary text-text-light border border-neon-blue/30 rounded-lg focus:outline-none focus:border-neon-blue"
          />
        </div>
        <div className="mt-2 text-sm text-text-secondary">
          {filteredVenues.length} {t('common.venuesFound')}
        </div>
      </div>

      {/* Venues list */}
      <div className="flex-1 overflow-y-auto">
        {filteredVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <p>{t('common.noActivity')}</p>
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
                        src={`/api/photo?ref=${venue.photo_ref}`}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhMWEyZSIvPjwvc3ZnPg=='
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">🎉</div>
                      </div>
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
                  <div className="flex-1 p-3">
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

                    {/* Today's count text */}
                    {(venue.count_today || 0) > 0 && (
                      <p className="mt-2 text-neon-pink text-sm font-medium">
                        {t('common.today')} {venue.count_today} {t('common.people')}
                      </p>
                    )}
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
