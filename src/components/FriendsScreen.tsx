'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Users, UserPlus, Search, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import SearchUsersModal from './SearchUsersModal'
import FriendRequestsModal from './FriendRequestsModal'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface Friend {
  id: string
  username: string
  avatar_url: string | null
}

interface FriendsScreenProps {
  user: User
  onBack: () => void
  onFriendClick?: (friendId: string) => void
}

export default function FriendsScreen({ user, onBack, onFriendClick }: FriendsScreenProps) {
  const toast = useToastContext()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    loadFriends()
    loadPendingRequestsCount()
  }, [user.id])

  const loadPendingRequestsCount = async () => {
    const count = await withErrorHandling(
      async () => {
        const { count, error } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .eq('friend_id', user.id)
          .eq('status', 'pending')

        if (error) throw error
        return count || 0
      },
      'Error al cargar solicitudes pendientes',
      { userId: user.id }
    )
    
    if (count !== null) {
      setPendingRequestsCount(count)
    }
  }

  const loadFriends = async () => {
    logger.info('Cargando amigos', { userId: user.id })
    
    const data = await withErrorHandling(
      async () => {
        // Obtener amistades aceptadas
        const { data: friendshipsData, error: friendshipsError } = await supabase
          .from('friendships')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')

        if (friendshipsError) throw friendshipsError

        if (!friendshipsData || friendshipsData.length === 0) {
          logger.info('Usuario sin amigos', { userId: user.id })
          return []
        }

        // Obtener IDs de amigos
        const friendIds = friendshipsData.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        )

        // Obtener perfiles de amigos
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', friendIds)

        if (profilesError) throw profilesError

        return profilesData || []
      },
      'Error al cargar amigos',
      { userId: user.id }
    )

    setLoading(false)
    
    if (data) {
      setFriends(data)
      logger.trackEvent('friends_loaded', { userId: user.id, count: data.length })
    } else {
      setFriends([])
      toast.error('Error al cargar amigos')
    }
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
        <Users className="w-6 h-6 text-neon-cyan" />
        <h1 className="text-xl font-bold text-white">Amigos</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-xl border border-neon-cyan/30 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Buscar usuarios</span>
          </button>
          
          <button
            onClick={() => setShowRequestsModal(true)}
            className="relative flex items-center justify-center gap-2 py-3 px-4 bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink rounded-xl border border-neon-pink/30 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-dark-primary">
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cargando amigos...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-light mb-2">Sin amigos</h3>
            <p className="text-text-secondary">
              Invita a tus amigos para conectar y ver dónde van esta noche
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onFriendClick?.(friend.id)}
                className="w-full bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-cyan/20 hover:border-neon-cyan/40 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-neon-cyan/40"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-2xl font-bold text-white">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{friend.username}</h3>
                    <p className="text-text-secondary text-sm">Amigo</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Users Modal */}
      <SearchUsersModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentUserId={user.id}
      />

      {/* Friend Requests Modal */}
      <FriendRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        currentUserId={user.id}
        onRequestsChange={() => {
          loadFriends()
          loadPendingRequestsCount()
        }}
      />
    </div>
  )
}
