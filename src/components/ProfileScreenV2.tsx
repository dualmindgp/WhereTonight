'use client'

import React, { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  Camera, Settings, Share2, Edit2,
  LogOut, Bookmark, Clock, ChevronRight, Crown,
  Star, TrendingUp, QrCode
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import AddFriendModal from './AddFriendModal'
import EditProfileModal from './EditProfileModal'
import { VenueWithCount } from '@/lib/database.types'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'
import QRScanner from './QRScanner'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'
import CompleteProfileModal from './CompleteProfileModal'
import OnboardingFlow from './OnboardingFlow'
import ReferralCard from './ReferralCard'
import BadgesShowcase from './BadgesShowcase'

interface ProfileScreenV2Props {
  user: User
  profile: any
  venues: VenueWithCount[]
  onVenueClick: (venueId: string) => void
  onProfileUpdated: () => void
  onShowSettings?: () => void
  onShowFavorites?: () => void
  onShowHistory?: () => void
  onShowFriends?: () => void
}

export default function ProfileScreenV2({ 
  user, 
  profile,
  venues,
  onVenueClick,
  onProfileUpdated,
  onShowSettings,
  onShowFavorites,
  onShowHistory,
  onShowFriends
}: ProfileScreenV2Props) {
  const { t, locale } = useLanguage()
  const toast = useToastContext()
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false)
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper para calcular edad desde birth_date
  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null
    
    const birthDate = new Date(birthDateString)
    const today = new Date()
    
    if (birthDate > today) return null
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true)
    logger.info('Subiendo avatar', { userId: user.id, fileName: file.name })
    
    const success = await withErrorHandling(
      async () => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user.id)

        if (updateError && updateError.code === 'PGRST116') {
          logger.info('Creando perfil nuevo', { userId: user.id })
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              avatar_url: data.publicUrl,
              language: locale
            })
          if (insertError) throw insertError
        } else if (updateError) {
          throw updateError
        }

        return true
      },
      'Error al subir foto de perfil',
      { userId: user.id }
    )

    setAvatarUploading(false)
    
    if (success) {
      onProfileUpdated()
      toast.success('¡Foto de perfil actualizada!')
      logger.trackEvent('avatar_uploaded_v2', { userId: user.id })
    } else {
      toast.error('Error al subir la foto')
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('El archivo debe ser menor a 2MB')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.warning('Solo se permiten archivos PNG, JPG o WEBP')
      return
    }

    uploadAvatar(file)
  }

  const username = profile?.username || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
  const email = user.email || ''

  // Stats states
  const [ticketsUsed, setTicketsUsed] = useState(0)
  const [streak, setStreak] = useState(0)
  const [uniqueVenues, setUniqueVenues] = useState(0)
  const [friendsCount, setFriendsCount] = useState(0)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  // Cargar stats desde BD
  useEffect(() => {
    const loadStats = async () => {
      try {
        // 1. Total de tickets usados
        const { count: totalTickets } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        setTicketsUsed(totalTickets || 0)

        // 2. Locales únicos visitados
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('venue_id')
          .eq('user_id', user.id)
        const uniqueVenueIds = new Set(ticketsData?.map(t => t.venue_id) || [])
        setUniqueVenues(uniqueVenueIds.size)

        // 3. Calcular streak (días consecutivos)
        const { data: allTickets } = await supabase
          .from('tickets')
          .select('local_date')
          .eq('user_id', user.id)
          .order('local_date', { ascending: false })
        
        if (allTickets && allTickets.length > 0) {
          let currentStreak = 1
          const today = new Date()
          const lastTicketDate = new Date(allTickets[0].local_date)
          
          // Calcular diferencia en días
          const daysDiff = Math.floor((today.getTime() - lastTicketDate.getTime()) / (1000 * 60 * 60 * 24))
          
          // Si el último ticket fue hoy o ayer, contar racha
          if (daysDiff <= 1) {
            for (let i = 0; i < allTickets.length - 1; i++) {
              const date1 = new Date(allTickets[i].local_date)
              const date2 = new Date(allTickets[i + 1].local_date)
              const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
              
              if (diff === 1) {
                currentStreak++
              } else {
                break
              }
            }
            setStreak(currentStreak)
          } else {
            setStreak(0)
          }
        }

        // 4. Número de amigos (si existe tabla friendships)
        const { count: friends } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')
        setFriendsCount(friends || 0)

        // 5. Solicitudes pendientes
        const { count: pendingRequests } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .eq('friend_id', user.id)
          .eq('status', 'pending')
        setPendingRequestsCount(pendingRequests || 0)

        // 6. Puntos y nivel
        try {
          const totalPoints = await getUserPoints(user.id)
          setPoints(totalPoints)
          setLevel(getLevelFromPoints(totalPoints))
        } catch (error) {
          console.error('Error loading points:', error)
        }
      } catch (error) {
        logger.error('Error al cargar estadísticas', error as Error, { userId: user.id })
      }
    }

    loadStats()
  }, [user.id])

  // Datos del perfil (ahora dinámicos desde la BD)
  const age = profile?.birth_date ? calculateAge(profile.birth_date) : null
  const city = profile?.city
  const musicGenres = profile?.music_genres || []
  
  // Verificar si es un usuario nuevo (no ha completado perfil) - mostrar onboarding
  useEffect(() => {
    if (profile && !profile.birth_date && !profile.city && (!profile.music_genres || profile.music_genres.length === 0)) {
      // Si tiene username pero no otros datos, mostrar onboarding
      const hasBasicData = profile.username && profile.username.trim() !== ''
      if (hasBasicData) {
        setShowOnboardingFlow(true)
      }
    }
  }, [profile])

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Header - Nuevo diseño centrado más compacto */}
        <div className="bg-gradient-to-b from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          {/* Fondo con efecto blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
          
          {/* Contenido */}
          <div className="relative z-10">
            {/* Botón editar perfil - esquina superior derecha, más separado */}
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="absolute -top-2 -right-2 flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-white transition-colors bg-gray-800/80 rounded-lg hover:bg-gray-700/80"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">editar</span>
            </button>

            {/* Avatar Section - Centrado */}
            <div className="flex flex-col items-center mb-4 mt-6">
              <div className="relative group">
                {/* Foto de perfil con borde degradado morado - más pequeña */}
                <div className="p-1 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-2xl shadow-purple-500/50">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={username}
                      className="w-28 h-28 rounded-full object-cover bg-gray-900"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-5xl font-bold text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Camera Button Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {avatarUploading ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-9 h-9 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              {/* Username and Info - más compacto */}
              <div className="text-center mt-4 w-full">
                {/* Nombre grande */}
                <h1 className="text-3xl font-bold text-white mb-1">
                  {username}
                </h1>
                
                {/* Username con @ - solo si es diferente al nombre o hay handle personalizado */}
                {(profile?.custom_handle || username.toLowerCase().replace(/\s+/g, '_') !== username.toLowerCase()) && (
                  <p className="text-text-secondary text-base mb-2">
                    @{profile?.custom_handle || username.toLowerCase().replace(/\s+/g, '_')}
                  </p>
                )}
                
                {/* Edad · Ciudad · Géneros - más compacto */}
                <p className="text-text-light text-sm">
                  {age && `${age} años`} 
                  {age && city && ' · '}
                  {city && city}
                  {(age || city) && musicGenres && musicGenres.length > 0 && ' · '}
                  {musicGenres && musicGenres.length > 0 && musicGenres.slice(0, 3).join(' & ')}
                  {musicGenres && musicGenres.length > 3 && ` +${musicGenres.length - 3}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tickets */}
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-pink/20">
            <div className="text-4xl font-bold text-neon-pink mb-1">{ticketsUsed}</div>
            <div className="text-text-secondary text-sm">Tickets</div>
          </div>

          {/* Streak */}
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-blue/20 flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(79, 195, 247, 0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#4FC3F7"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - streak / 7)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                {streak}
              </div>
            </div>
            <div className="text-text-secondary text-sm">Streak</div>
          </div>

          {/* Locales visitados */}
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-blue/20">
            <div className="text-4xl font-bold text-neon-blue mb-1">{uniqueVenues}</div>
            <div className="text-text-secondary text-sm">Locales<br/>visitados</div>
          </div>

          {/* Amigos - Clickeable */}
          <button 
            onClick={() => onShowFriends?.()}
            className="relative bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-cyan/20 hover:bg-dark-hover transition-colors text-left w-full"
          >
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-dark-primary">
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </span>
            )}
            <div className="text-4xl font-bold text-neon-cyan mb-1">{friendsCount}</div>
            <div className="text-text-secondary text-sm">Amigos</div>
          </button>
        </div>

        {/* Puntos y Nivel */}
        <div className="grid grid-cols-2 gap-3">
          {/* Puntos Card */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-bold text-lg">{points}</span>
            </div>
            <p className="text-text-secondary text-xs">Puntos</p>
          </div>

          {/* Nivel Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-bold text-lg">{level}</span>
            </div>
            <p className="text-text-secondary text-xs">Nivel</p>
          </div>
        </div>

        {/* Sistema de Referidos */}
        <ReferralCard userId={user.id} />

        {/* Badges y Logros */}
        <BadgesShowcase userId={user.id} variant="compact" />

        {/* QR Scanner Button */}
        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-500/30"
        >
          <QrCode className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-semibold">Escanear Código QR</span>
        </button>

        {/* Favoritos e Historial */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onShowFavorites?.()}
            className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-pink/20 text-left hover:bg-dark-hover transition-colors"
          >
            <Bookmark className="w-5 h-5 text-neon-pink mb-2" />
            <div className="text-white font-medium">Favoritos</div>
          </button>
          
          <button 
            onClick={() => onShowHistory?.()}
            className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-blue/20 text-left hover:bg-dark-hover transition-colors"
          >
            <Clock className="w-5 h-5 text-neon-blue mb-2" />
            <div className="text-white font-medium">Historial reciente</div>
          </button>
        </div>

        {/* Menu Options */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-neon-blue/20">
          {/* Ajustes */}
          <button
            onClick={() => onShowSettings?.()}
            className="w-full flex items-center justify-between p-4 hover:bg-dark-hover transition-colors border-b border-dark-secondary"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-neon-purple" />
              <span className="text-white font-medium">Ajustes</span>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Invitar amigos */}
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-dark-hover transition-colors border-b border-dark-secondary"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-neon-blue" />
              <span className="text-white font-medium">Invitar amigos</span>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">Cerrar sesión</span>
          </button>
        </div>

      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        userId={user.id}
        username={username}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentProfile={profile}
        onProfileUpdated={() => {
          onProfileUpdated()
          toast.success('¡Perfil actualizado!')
        }}
      />

      {/* QR Scanner */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(code) => {
          console.log('QR Code scanned:', code)
          toast.success(`Código escaneado: ${code}`)
          setShowQRScanner(false)
        }}
      />

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={showCompleteProfileModal}
        onClose={() => setShowCompleteProfileModal(false)}
        userId={user.id}
        currentUsername={username}
        onProfileUpdated={onProfileUpdated}
      />

      {/* Onboarding Flow for new users */}
      <OnboardingFlow
        isOpen={showOnboardingFlow}
        onClose={() => setShowOnboardingFlow(false)}
        userId={user.id}
        currentUsername={username}
        onComplete={onProfileUpdated}
      />
    </div>
  )
}
