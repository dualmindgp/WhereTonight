'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, MapPin, Users, UserPlus, Check, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface FriendProfile {
  id: string
  username: string
  avatar_url: string | null
}

interface FriendProfileScreenProps {
  friendId: string
  currentUserId: string
  onBack: () => void
  onVenueClick?: (venueId: string) => void
  onFriendClick?: (friendId: string) => void
}

interface TicketWithVenue {
  venue_id: string
  local_date: string
  venue_name: string
}

interface FriendWithStatus {
  id: string
  username: string
  avatar_url: string | null
  friendship_status: 'none' | 'friends' | 'pending_sent' | 'pending_received'
}

export default function FriendProfileScreen({ 
  friendId,
  currentUserId,
  onBack,
  onVenueClick,
  onFriendClick
}: FriendProfileScreenProps) {
  const toast = useToastContext()
  const [profile, setProfile] = useState<FriendProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [ticketsUsed, setTicketsUsed] = useState(0)
  const [uniqueVenues, setUniqueVenues] = useState(0)
  const [streak, setStreak] = useState(0)
  const [recentTickets, setRecentTickets] = useState<TicketWithVenue[]>([])
  const [friends, setFriends] = useState<FriendWithStatus[]>([])
  const [friendsCount, setFriendsCount] = useState(0)
  const [loadingFriends, setLoadingFriends] = useState(false)

  useEffect(() => {
    loadFriendProfile()
  }, [friendId])

  const loadFriendProfile = async () => {
    logger.info('Cargando perfil de amigo', { friendId })
    
    const success = await withErrorHandling(
      async () => {
        // Cargar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', friendId)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Cargar estadísticas
        // 1. Total de tickets
        const { count: totalTickets } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friendId)
        setTicketsUsed(totalTickets || 0)

        // 2. Locales únicos
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('venue_id')
          .eq('user_id', friendId)
        const uniqueVenueIds = new Set(ticketsData?.map(t => t.venue_id) || [])
        setUniqueVenues(uniqueVenueIds.size)

        // 3. Calcular streak
        const { data: allTickets } = await supabase
          .from('tickets')
          .select('local_date')
          .eq('user_id', friendId)
          .order('local_date', { ascending: false })
        
        if (allTickets && allTickets.length > 0) {
          let currentStreak = 1
          const today = new Date()
          const lastTicketDate = new Date(allTickets[0].local_date)
          
          const daysDiff = Math.floor((today.getTime() - lastTicketDate.getTime()) / (1000 * 60 * 60 * 24))
          
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

        // 4. Cargar tickets recientes con nombres de venues
        const { data: recentTicketsData } = await supabase
          .from('tickets')
          .select('venue_id, local_date')
          .eq('user_id', friendId)
          .order('local_date', { ascending: false })
          .limit(10)

        if (recentTicketsData && recentTicketsData.length > 0) {
          // Obtener nombres de venues
          const venueIds = Array.from(new Set(recentTicketsData.map(t => t.venue_id)))
          const { data: venuesData } = await supabase
            .from('venues')
            .select('id, name')
            .in('id', venueIds)

          const venueMap = new Map(venuesData?.map(v => [v.id, v.name]) || [])
          
          const ticketsWithNames = recentTicketsData.map(ticket => ({
            ...ticket,
            venue_name: venueMap.get(ticket.venue_id) || 'Local desconocido'
          }))
          
          setRecentTickets(ticketsWithNames)
        }

        return true
      },
      'Error al cargar perfil del amigo',
      { friendId }
    )

    setLoading(false)
    
    if (!success) {
      toast.error('No se pudo cargar el perfil')
    } else {
      // Cargar amigos después de cargar el perfil exitosamente
      await loadFriendsOfFriend()
    }
  }

  const loadFriendsOfFriend = async () => {
    logger.info('Cargando amigos del perfil', { friendId, currentUserId })
    setLoadingFriends(true)
    
    const success = await withErrorHandling(
      async () => {
        // Obtener amistades del perfil usando la API (evita RLS)
        const response = await fetch(`/api/friendships/${friendId}`)
        
        if (!response.ok) {
          throw new Error('Error al obtener amistades')
        }
        
        const friendshipsData = await response.json()

        if (!friendshipsData || friendshipsData.length === 0) {
          setFriendsCount(0)
          setFriends([])
          return true
        }
        
        logger.info('Amistades aceptadas', { count: friendshipsData.length })

        // Obtener IDs de amigos
        // Si user_id es el perfil que estamos viendo, el amigo es friend_id
        // Si friend_id es el perfil que estamos viendo, el amigo es user_id
        const friendIdsRaw = friendshipsData.map((f: any) => {
          if (f.user_id === friendId) {
            return f.friend_id
          } else if (f.friend_id === friendId) {
            return f.user_id
          }
          // Esto no debería pasar, pero por seguridad
          return f.user_id
        })
        
        // Filtrar al usuario actual de la lista
        const friendIds = friendIdsRaw.filter((id: string) => id !== currentUserId)

        logger.info('Amigos encontrados', { count: friendIds.length })

        // Establecer el conteo DESPUÉS del filtrado
        setFriendsCount(friendIds.length)

        if (friendIds.length === 0) {
          setFriends([])
          return true
        }

        // Obtener perfiles de amigos
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', friendIds)

        if (profilesError) throw profilesError

        // Obtener TODAS las relaciones de amistad del usuario actual de una vez
        const { data: currentUserFriendships } = await supabase
          .from('friendships')
          .select('user_id, friend_id, status')
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)

        // Crear un mapa de estado de amistad
        const friendshipStatusMap = new Map<string, { status: string, isSender: boolean }>()
        
        currentUserFriendships?.forEach(fs => {
          const otherId = fs.user_id === currentUserId ? fs.friend_id : fs.user_id
          const isSender = fs.user_id === currentUserId
          friendshipStatusMap.set(otherId, { status: fs.status, isSender })
        })

        // Crear array de amigos con estado
        const friendsWithStatus: FriendWithStatus[] = (profilesData || []).map(friendProfile => {
          const relationship = friendshipStatusMap.get(friendProfile.id)
          
          let status: 'none' | 'friends' | 'pending_sent' | 'pending_received' = 'none'

          if (relationship) {
            if (relationship.status === 'accepted') {
              status = 'friends'
            } else if (relationship.status === 'pending') {
              status = relationship.isSender ? 'pending_sent' : 'pending_received'
            }
          }

          return {
            ...friendProfile,
            friendship_status: status
          }
        })

        logger.info('Amigos procesados', { count: friendsWithStatus.length })
        setFriends(friendsWithStatus)
        return true
      },
      'Error al cargar amigos',
      { friendId }
    )

    setLoadingFriends(false)
    
    if (!success) {
      logger.error('Falló la carga de amigos', new Error('loadFriendsOfFriend failed'), { friendId })
    }
  }

  const handleAddFriend = async (targetFriendId: string) => {
    const success = await withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUserId,
            friend_id: targetFriendId,
            status: 'pending'
          })

        if (error) throw error

        toast.success('Solicitud de amistad enviada')
        
        // Recargar lista de amigos para actualizar estados
        await loadFriendsOfFriend()
        
        return true
      },
      'Error al enviar solicitud',
      { targetFriendId }
    )

    if (!success) {
      toast.error('No se pudo enviar la solicitud')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-dark-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 bg-dark-primary flex flex-col items-center justify-center p-6">
        <p className="text-text-secondary mb-4">No se pudo cargar el perfil</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-neon-cyan text-white rounded-lg hover:bg-neon-cyan/80 transition-colors"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-dark-primary overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-neon-blue/20 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-text-light" />
        </button>
        <h1 className="text-xl font-bold text-white">Perfil</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header - Avatar y nombre */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-6 border border-neon-blue/20">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-28 h-28 rounded-full object-cover border-4 border-neon-purple/40"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-5xl font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Nombre */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white">{profile.username}</h2>
              <p className="text-text-secondary text-sm mt-1">Amigo</p>
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
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-blue/20 col-span-2">
            <div className="text-4xl font-bold text-neon-blue mb-1">{uniqueVenues}</div>
            <div className="text-text-secondary text-sm">Locales visitados</div>
          </div>
        </div>

        {/* Amigos */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-purple/20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-purple" />
            Amigos ({friendsCount})
          </h3>
          
          {loadingFriends ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-text-secondary text-sm">Cargando amigos...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-text-secondary text-sm">Sin amigos aún</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {friends.slice(0, 5).map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-dark-secondary/50 rounded-lg"
                  >
                    <button
                      onClick={() => onFriendClick?.(friend.id)}
                      className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                    >
                      {/* Avatar */}
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-neon-purple/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-lg font-bold text-white">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Username */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{friend.username}</div>
                        {friend.friendship_status === 'friends' && (
                          <div className="text-neon-cyan text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Ya son amigos
                          </div>
                        )}
                        {friend.friendship_status === 'pending_sent' && (
                          <div className="text-yellow-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Solicitud enviada
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Action button */}
                    {friend.friendship_status === 'none' && (
                      <button
                        onClick={() => handleAddFriend(friend.id)}
                        className="p-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 rounded-lg border border-neon-cyan/30 transition-colors"
                        title="Agregar amigo"
                      >
                        <UserPlus className="w-4 h-4 text-neon-cyan" />
                      </button>
                    )}
                    {friend.friendship_status === 'friends' && (
                      <div className="p-2 bg-neon-cyan/10 rounded-lg">
                        <Check className="w-4 h-4 text-neon-cyan" />
                      </div>
                    )}
                    {friend.friendship_status === 'pending_sent' && (
                      <div className="p-2 bg-yellow-400/10 rounded-lg">
                        <Clock className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>
              ))}
              </div>
              {friends.length > 5 && (
                <div className="text-center mt-3 text-text-secondary text-sm">
                  +{friends.length - 5} amigos más
                </div>
              )}
            </>
          )}
        </div>

        {/* Actividad reciente */}
        {recentTickets.length > 0 && (
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-cyan/20">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neon-cyan" />
              Actividad reciente
            </h3>
            <div className="space-y-2">
              {recentTickets.map((ticket, index) => (
                <button
                  key={`${ticket.venue_id}-${ticket.local_date}-${index}`}
                  onClick={() => onVenueClick?.(ticket.venue_id)}
                  className="w-full flex items-center justify-between p-3 bg-dark-secondary/50 rounded-lg hover:bg-dark-hover transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan" />
                    <div>
                      <div className="text-white font-medium">{ticket.venue_name}</div>
                      <div className="text-text-secondary text-xs">
                        {new Date(ticket.local_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
