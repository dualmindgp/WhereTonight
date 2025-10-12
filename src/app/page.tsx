'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { VenueWithCount } from '@/lib/database.types'
import { useVenues } from '@/contexts/VenueContext'
import MapWrapper from '@/components/MapWrapper'
import VenueList from '@/components/VenueList'
import AuthButton from '@/components/AuthButton'
import TopNavBar from '@/components/TopNavBar'
import VenueSheet from '@/components/VenueSheet'
import BottomNavBar from '@/components/BottomNavBar'
import SearchScreen from '@/components/SearchScreen'
import SocialFeed from '@/components/SocialFeed'
import AuthModal from '@/components/AuthModal'
import FilterModal, { FilterOptions } from '@/components/FilterModal'
import EditProfileModal from '@/components/EditProfileModal'
import LanguageSelector from '@/components/LanguageSelector'
import ActivityFeed from '@/components/ActivityFeed'
import ProfileScreenV2 from '@/components/ProfileScreenV2'
import SettingsScreen from '@/components/SettingsScreen'
import FavoritesScreen from '@/components/FavoritesScreen'
import HistoryScreen from '@/components/HistoryScreen'
import useSwipe from '@/hooks/useSwipe'
import { useLanguage } from '@/contexts/LanguageContext'
import { MapPin, Edit } from 'lucide-react'

export default function Home() {
  const { venues } = useVenues() // Usar venues desde el context
  const [user, setUser] = useState<User | null>(null)
  const [hasUsedTicketToday, setHasUsedTicketToday] = useState(false)
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [showVenueSheet, setShowVenueSheet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [filters, setFilters] = useState<FilterOptions>({ priceRange: [], minRating: 0, sortBy: 'popularity' })
  const [filteredVenues, setFilteredVenues] = useState<VenueWithCount[]>([])
  const [navTab, setNavTab] = useState<string>('home')
  const { t } = useLanguage()
  
  // Referencia al contenedor principal para los gestos
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  // Ya no necesitamos loadVenues aquí, el context se encarga

  // Verificar si el usuario ya usó su ticket hoy
  const checkTicketStatus = async () => {
    if (!user) {
      setHasUsedTicketToday(false)
      return
    }

    try {
      // Usar fecha UTC estándar
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('local_date', today)
        .limit(1)
      
      if (error) {
        console.error('Error checking ticket status:', error)
        setHasUsedTicketToday(false)
      } else {
        setHasUsedTicketToday(data && data.length > 0)
      }
    } catch (error) {
      console.error('Error checking ticket status:', error)
      setHasUsedTicketToday(false)
    }
  }

  const { loadVenues } = useVenues()
  
  // Efectos
  useEffect(() => {
    // Los venues ya se cargan en el context

    // Obtener usuario actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    checkTicketStatus()
  }, [user])
  
  // Ya no necesitamos la navegación por gestos como antes
  useSwipe(mainContainerRef, {
    threshold: 60 // Mantenemos el hook pero ya no hacemos nada con los gestos
  })

  // Handlers
  const handleVenueClick = (venue: VenueWithCount) => {
    setSelectedVenueId(venue.id)
    setShowVenueSheet(true)
    
    // Centrar el mapa en el venue seleccionado con suavidad
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [venue.lng, venue.lat],
        zoom: 14.5,
        duration: 1000
      })
    }
  }

  const handleCloseVenueSheet = () => {
    setShowVenueSheet(false)
  }

  const handleUseTicket = async (venueId: string): Promise<boolean> => {
    if (!user || hasUsedTicketToday) return false

    try {
      // Usar fecha UTC estándar para consistencia global
      const today = new Date().toISOString().split('T')[0] // Formato: YYYY-MM-DD

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          venue_id: venueId,
          local_date: today
        })
        .select()

      if (error) {
        console.error('Error using ticket:', error)
        return false
      }

      // Actualizar estado y recargar datos
      setHasUsedTicketToday(true)
      
      // Crear actividad en el feed
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            venue_id: venueId,
            type: 'ticket_used'
          })
        })
      } catch (error) {
        console.error('Error creating activity:', error)
      }
      
      // Esperar un momento para asegurar que la BD procese el insert
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Recargar para actualizar conteos
      await loadVenues()
      
      return true
    } catch (error) {
      console.error('Error using ticket:', error)
      return false
    }
  }

  const handleAuthRequired = () => {
    setShowAuthModal(true)
  }

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const loadProfile = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setProfile(data)
    }
  }

  const handleProfileUpdated = () => {
    loadProfile()
  }

  // Aplicar filtros a los venues
  useEffect(() => {
    let result = [...venues]

    // Filtrar por precio
    if (filters.priceRange.length > 0) {
      result = result.filter(v => {
        if (!v.avg_price_text) return false
        return filters.priceRange.some(price => v.avg_price_text?.includes(price))
      })
    }

    // Filtrar por rating
    if (filters.minRating > 0) {
      result = result.filter(v => (v.rating || 0) >= filters.minRating)
    }

    // Ordenar
    if (filters.sortBy === 'popularity') {
      result.sort((a, b) => b.count_today - a.count_today)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (filters.sortBy === 'price') {
      // Ordenar por precio (asumiendo que $ < $$ < $$$ < $$$$)
      result.sort((a, b) => {
        const priceA = (a.avg_price_text?.match(/\$/g) || []).length
        const priceB = (b.avg_price_text?.match(/\$/g) || []).length
        return priceA - priceB
      })
    }

    setFilteredVenues(result)
  }, [venues, filters])

  // Cargar perfil cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  // Usar venues filtrados o todos los venues
  const displayVenues = filteredVenues.length > 0 || filters.priceRange.length > 0 || filters.minRating > 0 ? filteredVenues : venues

  // Encontrar el venue seleccionado
  const selectedVenue = displayVenues.find(v => v.id === selectedVenueId) || null

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div ref={mainContainerRef} className="h-screen flex flex-col bg-dark-primary">
      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-dark-primary to-dark-secondary relative">
        {/* Mantener el mapa montado pero oculto cuando no está en 'home' */}
        <div className={`flex-1 relative ${navTab === 'home' ? '' : 'hidden'}`}>
          {/* Nav Bar Superior como overlay - Solo en home */}
          {navTab === 'home' && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <TopNavBar 
                onCityChange={(location) => {
                  console.log(`City changed: ${location.name}`, location)
                  // Mover el mapa a la nueva ubicación
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: [location.lng, location.lat],
                      zoom: 13,
                      duration: 2000
                    })
                  }
                }}
                onSearchFriends={() => console.log('Search friends clicked')}
                onFilterClick={() => setShowFilterModal(true)}
              />
            </div>
          )}

          {/* Map section - Full Screen */}
          <MapWrapper
            ref={mapRef}
            venues={displayVenues}
            onVenueClick={handleVenueClick}
            selectedVenueId={selectedVenueId}
          />
          
          
          {/* Venue Details Sheet */}
          {selectedVenue && (
            <VenueSheet 
              venue={selectedVenue}
              isOpen={showVenueSheet}
              onClose={handleCloseVenueSheet}
              onUseTicket={handleUseTicket}
              hasUsedTicketToday={hasUsedTicketToday}
              userId={user?.id}
            />
          )}
        </div>
        
        {navTab === 'search' && (
          <div className="flex-1 flex flex-col relative">
            {/* TopNavBar como overlay en búsqueda también */}
            <div className="absolute top-0 left-0 right-0 z-10">
              <TopNavBar 
                onCityChange={(location) => {
                  console.log(`City changed: ${location.name}`, location)
                  // En la vista de búsqueda también podríamos hacer algo con la ubicación
                  // Por ahora solo lo logueamos
                }}
                onSearchFriends={() => console.log('Search friends clicked')}
                onFilterClick={() => setShowFilterModal(true)}
              />
            </div>
            <div className="pt-20">
              <SearchScreen venues={displayVenues} onVenueClick={handleVenueClick} />
            </div>
          </div>
        )}
        
        {navTab === 'social' && (
          <SocialFeed />
        )}
        
        {navTab === 'profile' && (
          showSettings ? (
            <SettingsScreen onBack={() => setShowSettings(false)} />
          ) : showFavorites ? (
            user && (
              <FavoritesScreen 
                user={user}
                onBack={() => setShowFavorites(false)}
                onVenueClick={(venue) => {
                  setShowFavorites(false)
                  handleVenueClick(venue)
                }}
              />
            )
          ) : showHistory ? (
            user && (
              <HistoryScreen 
                user={user}
                onBack={() => setShowHistory(false)}
                onVenueClick={(venue) => {
                  setShowHistory(false)
                  handleVenueClick(venue)
                }}
              />
            )
          ) : user ? (
            <ProfileScreenV2
              user={user}
              profile={profile}
              venues={venues}
              onVenueClick={(venueId) => {
                const venue = venues.find(v => v.id === venueId)
                if (venue) handleVenueClick(venue)
              }}
              onProfileUpdated={handleProfileUpdated}
              onShowSettings={() => setShowSettings(true)}
              onShowFavorites={() => setShowFavorites(true)}
              onShowHistory={() => setShowHistory(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-primary">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-text-light mb-2">{t('profile.welcome')}</h2>
              <p className="text-text-secondary mb-6 text-center max-w-md">
                {t('profile.welcomeMessage')}
              </p>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-neon-blue hover:bg-neon-blue/80 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                {t('common.login')}
              </button>
            </div>
          )
        )}
        
        {/* Bottom Navigation Bar */}
        <BottomNavBar 
          activeTab={navTab}
          onChangeTab={setNavTab}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Edit Profile Modal */}
      {user && profile && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          currentProfile={{
            id: user.id,
            username: profile.username,
            bio: profile.bio,
            avatar_url: profile.avatar_url
          }}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  )
}
