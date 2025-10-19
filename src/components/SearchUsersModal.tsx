'use client'

import React, { useState } from 'react'
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface SearchUsersModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

export default function SearchUsersModal({ 
  isOpen, 
  onClose,
  currentUserId
}: SearchUsersModalProps) {
  const toast = useToastContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    
    const data = await withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${query}%`)
          .neq('id', currentUserId)
          .limit(20)

        if (error) throw error
        return data || []
      },
      'Error al buscar usuarios',
      { query, currentUserId }
    )

    setLoading(false)
    if (data) {
      setSearchResults(data)
    } else {
      setSearchResults([])
    }
  }

  const handleSendFriendRequest = async (userId: string) => {
    setSendingRequest(userId)
    
    const result = await withErrorHandling(
      async () => {
        // Verificar si ya existe una solicitud o amistad en cualquier dirección
        const { data: existing } = await supabase
          .from('friendships')
          .select('id, status')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)

        if (existing && existing.length > 0) {
          const status = existing[0].status
          return status === 'accepted' ? 'already_friends' : 'already_pending'
        }

        // Crear solicitud de amistad
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUserId,
            friend_id: userId,
            status: 'pending'
          })

        if (error) throw error
        return 'sent'
      },
      'Error al enviar solicitud',
      { currentUserId, targetUserId: userId }
    )

    setSendingRequest(null)
    
    if (result === 'sent') {
      setSentRequests(prev => {
        const newSet = new Set(prev)
        newSet.add(userId)
        return newSet
      })
      toast.success('Solicitud enviada')
      logger.trackEvent('friend_request_sent', { fromUserId: currentUserId, toUserId: userId })
    } else if (result === 'already_friends') {
      toast.info('Ya son amigos')
    } else if (result === 'already_pending') {
      toast.info('Ya existe una solicitud pendiente')
    } else {
      toast.error('Error al enviar solicitud')
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-dark-card rounded-t-3xl shadow-2xl border-t border-neon-cyan/30 animate-slide-up max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-cyan/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue">
            Buscar Usuarios
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-secondary transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-neon-cyan/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-dark-secondary border border-neon-cyan/30 rounded-xl pl-12 pr-4 py-3 text-text-light placeholder-text-muted focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                No se encontraron usuarios con "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="bg-dark-secondary rounded-xl p-4 border border-neon-cyan/20 hover:border-neon-cyan/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-neon-cyan/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-xl font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Username */}
                      <div>
                        <p className="text-text-light font-medium">@{user.username}</p>
                      </div>
                    </div>

                    {/* Add Button */}
                    {sentRequests.has(user.id) ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Enviada</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(user.id)}
                        disabled={sendingRequest === user.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30 transition-colors disabled:opacity-50"
                      >
                        {sendingRequest === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span className="text-sm">Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
