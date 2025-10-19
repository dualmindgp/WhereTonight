'use client'

import React, { useState, useEffect } from 'react'
import { X, UserCheck, UserX, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface FriendRequest {
  id: string
  user_id: string
  created_at: string
  requester: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface FriendRequestsModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  onRequestsChange: () => void
}

export default function FriendRequestsModal({ 
  isOpen, 
  onClose,
  currentUserId,
  onRequestsChange
}: FriendRequestsModalProps) {
  const toast = useToastContext()
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadRequests()
    }
  }, [isOpen, currentUserId])

  const loadRequests = async () => {
    setLoading(true)
    logger.info('Cargando solicitudes de amistad', { userId: currentUserId })
    
    const data = await withErrorHandling(
      async () => {
        // Primero obtener las solicitudes pendientes
        const { data: requestsData, error: requestsError } = await supabase
          .from('friendships')
          .select('id, user_id, created_at')
          .eq('friend_id', currentUserId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (requestsError) throw requestsError

        if (!requestsData || requestsData.length === 0) {
          logger.info('Sin solicitudes pendientes', { userId: currentUserId })
          return []
        }

        // Obtener los IDs de usuarios que enviaron las solicitudes
        const userIds = requestsData.map(req => req.user_id)

        // Obtener perfiles de esos usuarios
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

        if (profilesError) throw profilesError

        // Combinar datos
        const transformedRequests = requestsData.map((req) => {
          const profile = profilesData?.find(p => p.id === req.user_id)
          return {
            id: req.id,
            user_id: req.user_id,
            created_at: req.created_at,
            requester: profile || {
              id: req.user_id,
              username: 'Usuario',
              avatar_url: null
            }
          }
        })

        return transformedRequests
      },
      'Error al cargar solicitudes',
      { userId: currentUserId }
    )

    setLoading(false)
    if (data) {
      setRequests(data)
      logger.trackEvent('friend_requests_loaded', { userId: currentUserId, count: data.length })
    } else {
      setRequests([])
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId)
    
    const success = await withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', requestId)

        if (error) throw error
        return true
      },
      'Error al aceptar solicitud',
      { requestId, userId: currentUserId }
    )

    setProcessingRequest(null)
    
    if (success) {
      setRequests(prev => prev.filter(req => req.id !== requestId))
      onRequestsChange()
      toast.success('Solicitud aceptada')
      logger.trackEvent('friend_request_accepted', { requestId, userId: currentUserId })
    } else {
      toast.error('Error al aceptar solicitud')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId)
    
    const success = await withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', requestId)

        if (error) throw error
        return true
      },
      'Error al rechazar solicitud',
      { requestId, userId: currentUserId }
    )

    setProcessingRequest(null)
    
    if (success) {
      setRequests(prev => prev.filter(req => req.id !== requestId))
      onRequestsChange()
      toast.info('Solicitud rechazada')
      logger.trackEvent('friend_request_rejected', { requestId, userId: currentUserId })
    } else {
      toast.error('Error al rechazar solicitud')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-dark-card rounded-t-3xl shadow-2xl border-t border-neon-pink/30 animate-slide-up max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-pink/20">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple">
              Solicitudes de Amistad
            </h2>
            {requests.length > 0 && (
              <p className="text-text-secondary text-sm mt-1">
                {requests.length} {requests.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-secondary transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-light mb-2">Sin solicitudes</h3>
              <p className="text-text-secondary">
                No tienes solicitudes de amistad pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-dark-secondary rounded-xl p-4 border border-neon-pink/20 hover:border-neon-pink/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    {request.requester.avatar_url ? (
                      <img
                        src={request.requester.avatar_url}
                        alt={request.requester.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-neon-pink/40"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-2xl font-bold text-white">
                        {request.requester.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Username */}
                    <div className="flex-1">
                      <p className="text-text-light font-bold text-lg">@{request.requester.username}</p>
                      <p className="text-text-secondary text-sm">
                        {new Date(request.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-colors disabled:opacity-50 font-medium"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      <span>Aceptar</span>
                    </button>

                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingRequest === request.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors disabled:opacity-50 font-medium"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                      <span>Rechazar</span>
                    </button>
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
