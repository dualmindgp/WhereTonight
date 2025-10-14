'use client'

import React, { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  Camera, Settings, Share2, Edit2,
  LogOut, Bookmark, Clock, ChevronRight, Crown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import AddFriendModal from './AddFriendModal'
import EditNameModal from './EditNameModal'
import { VenueWithCount } from '@/lib/database.types'

interface ProfileScreenV2Props {
  user: User
  profile: any
  venues: VenueWithCount[]
  onVenueClick: (venueId: string) => void
  onProfileUpdated: () => void
  onShowSettings?: () => void
  onShowFavorites?: () => void
  onShowHistory?: () => void
}

export default function ProfileScreenV2({ 
  user, 
  profile,
  venues,
  onVenueClick,
  onProfileUpdated,
  onShowSettings,
  onShowFavorites,
  onShowHistory
}: ProfileScreenV2Props) {
  const { t, locale } = useLanguage()
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [showEditNameModal, setShowEditNameModal] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadAvatar = async (file: File) => {
    try {
      console.log('Subiendo avatar...', file.name)
      setAvatarUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      console.log('Subiendo a:', filePath)

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Error upload:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('URL p\u00fablica:', data.publicUrl)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      console.log('Update error:', updateError)

      if (updateError && updateError.code === 'PGRST116') {
        console.log('Perfil no existe, creando...')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            avatar_url: data.publicUrl,
            language: locale
          })
        console.log('Insert error:', insertError)
        if (insertError) throw insertError
      } else if (updateError) {
        throw updateError
      }

      console.log('Avatar subido correctamente')
      onProfileUpdated()
      alert('\u00a1Foto de perfil actualizada!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error al subir la foto. Revisa la consola.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo debe ser menor a 2MB')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Solo se permiten archivos PNG, JPG o WEBP')
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
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [user.id])

  return (
    <div className="flex-1 bg-dark-primary overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Header - Avatar grande, nombre a la derecha, email abajo */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-6 border border-neon-blue/20">
          <div className="flex items-start gap-4">
            {/* Columna izquierda: Avatar + Email */}
            <div className="flex flex-col items-center gap-2">
              {/* Avatar grande - CLICKEABLE */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="relative group cursor-pointer"
              >
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={username}
                      className="w-28 h-28 rounded-full object-cover border-4 border-neon-purple/40 transition-all group-hover:border-neon-pink"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-5xl font-bold text-white group-hover:opacity-90 transition-opacity">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Overlay con cámara */}
                  <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {avatarUploading ? (
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </button>

            </div>

            {/* Columna derecha: Nombre + Botón editar */}
            <div className="flex-1 flex items-start justify-between pt-2">
              <h2 className="text-3xl font-bold text-white">
                {username}
              </h2>

              {/* Edit button - Icono de lápiz */}
              <button
                onClick={() => setShowEditNameModal(true)}
                className="p-3 rounded-xl bg-dark-secondary hover:bg-dark-hover border border-neon-blue/30 hover:border-neon-blue/50 transition-all"
                title="Editar nombre"
              >
                <Edit2 className="w-5 h-5 text-neon-blue" />
              </button>
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

          {/* Amigos */}
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-cyan/20">
            <div className="text-4xl font-bold text-neon-cyan mb-1">{friendsCount}</div>
            <div className="text-text-secondary text-sm">Amigos</div>
          </div>
        </div>

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

        {/* Premium Card */}
        <button className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/30 hover:border-purple-500/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-bold text-lg mb-1">
                WhereTonight <span className="text-purple-400">PREMIUM</span>
              </div>
              <div className="text-purple-300 text-sm">
                $50 de descuentos y ventajas VIP
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-purple-400" />
          </div>
        </button>

      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        userId={user.id}
        username={username}
      />

      {/* Edit Name Modal */}
      <EditNameModal
        isOpen={showEditNameModal}
        currentName={username}
        userId={user.id}
        onClose={() => setShowEditNameModal(false)}
        onSuccess={onProfileUpdated}
      />
    </div>
  )
}
