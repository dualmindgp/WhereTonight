'use client'

import React, { useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { Camera, UserPlus, Users, LogOut, Edit2, QrCode, Star, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'
import ActivityFeed from './ActivityFeed'
import AddFriendModal from './AddFriendModal'
import { VenueWithCount } from '@/lib/database.types'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'
import QRScanner from './QRScanner'
import PointsBadge from './PointsBadge'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'

interface ProfileScreenProps {
  user: User
  profile: any
  venues: VenueWithCount[]
  onVenueClick: (venueId: string) => void
  onProfileUpdated: () => void
}

export default function ProfileScreen({ 
  user, 
  profile,
  venues,
  onVenueClick,
  onProfileUpdated 
}: ProfileScreenProps) {
  const { t } = useLanguage()
  const toast = useToastContext()
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showEditBio, setShowEditBio] = useState(false)
  const [editingBio, setEditingBio] = useState(profile?.bio || '')
  const [editingUsername, setEditingUsername] = useState(profile?.username || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)

  // Cargar puntos del usuario
  React.useEffect(() => {
    const loadPoints = async () => {
      try {
        const totalPoints = await getUserPoints(user.id)
        setPoints(totalPoints)
        setLevel(getLevelFromPoints(totalPoints))
      } catch (error) {
        console.error('Error loading points:', error)
      }
    }
    loadPoints()
  }, [user.id])

  const handleQRScan = (code: string) => {
    console.log('QR Code scanned:', code)
    toast.success(`Código escaneado: ${code}`)
    // Aquí puedes procesar el código QR
    // Por ejemplo, añadir amigo si es un código de amistad
  }

  const uploadAvatar = async (file: File) => {
    try {
      setAvatarUploading(true)
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

      // Intentar actualizar perfil con nueva URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      // Si falla porque no existe, crear el perfil
      if (updateError && updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            avatar_url: data.publicUrl,
            language: 'es'
          })
        
        if (insertError) throw insertError
      } else if (updateError) {
        throw updateError
      }

      toast.success('Foto de perfil actualizada')
      logger.trackEvent('avatar_uploaded', { userId: user.id })
      onProfileUpdated()
    } catch (error) {
      logger.error('Error al subir avatar', error as Error, { userId: user.id })
      toast.error('Error al subir la foto. Por favor, intenta de nuevo.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('El archivo debe ser menor a 2MB')
      return
    }

    // Validar formato
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.warning('Solo se permiten archivos PNG, JPG o WEBP')
      return
    }

    uploadAvatar(file)
  }

  const handleSaveProfile = async () => {
    logger.info('Guardando perfil', {
      userId: user.id,
      username: editingUsername.trim(),
      bio: editingBio.trim()
    })

    const success = await withErrorHandling(
      async () => {
        // Primero intentar actualizar
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            username: editingUsername.trim() || null,
            bio: editingBio.trim() || null
          })
          .eq('id', user.id)
          .select()

        // Si falla porque no existe el perfil, crearlo
        if (updateError) {
          if (updateError.code === 'PGRST116' || updateError.message?.includes('0 rows')) {
            // No rows updated - el perfil no existe, crearlo
            logger.info('Creando nuevo perfil', { userId: user.id })
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username: editingUsername.trim() || null,
                bio: editingBio.trim() || null,
                language: 'es'
              })
              .select()
            
            if (insertError) throw insertError
            return insertData
          } else {
            throw updateError
          }
        }
        return updateData
      },
      'Error al guardar perfil',
      { userId: user.id, username: editingUsername.trim() }
    )

    if (success) {
      setShowEditBio(false)
      onProfileUpdated()
      toast.success('Perfil guardado correctamente')
      logger.trackEvent('profile_updated', { userId: user.id })
    } else {
      toast.error('Error al guardar el perfil')
    }
  }

  const username = profile?.username || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
  const bio = profile?.bio || ''

  return (
    <div className="flex-1 bg-gradient-to-b from-dark-primary via-dark-secondary to-dark-primary overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-3xl p-8 border border-neon-blue/20 shadow-lg shadow-neon-blue/10">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={username}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-neon-blue/40 shadow-xl shadow-neon-blue/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-neon-pink via-neon-blue to-neon-cyan flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-neon-blue/30">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Camera Button Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {avatarUploading ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-10 h-10 text-white" />
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

            {/* Username and Bio */}
            {!showEditBio ? (
              <div className="text-center mt-4 w-full relative">
                {/* Botón de editar en la esquina superior derecha */}
                <button
                  onClick={() => {
                    setEditingUsername(username)
                    setEditingBio(bio)
                    setShowEditBio(true)
                  }}
                  className="absolute -top-2 -right-2 p-2 rounded-full bg-dark-secondary/80 hover:bg-dark-hover border border-neon-blue/30 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-neon-blue" />
                </button>
                
                {/* Nombre centrado */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue mb-2">
                  {username}
                </h2>
                
                {/* Biografía */}
                {bio ? (
                  <p className="text-text-light text-lg px-4">{bio}</p>
                ) : (
                  <p className="text-text-secondary text-sm italic">
                    Añade una biografía
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full mt-4 space-y-3">
                <input
                  type="text"
                  value={editingUsername}
                  onChange={(e) => setEditingUsername(e.target.value)}
                  maxLength={30}
                  placeholder="Nombre de usuario"
                  className="w-full bg-dark-secondary text-text-light text-center rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
                <textarea
                  value={editingBio}
                  onChange={(e) => setEditingBio(e.target.value)}
                  maxLength={80}
                  rows={2}
                  placeholder="Erasmus en Varsovia 🍻"
                  className="w-full bg-dark-secondary text-text-light text-center rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
                <p className="text-xs text-text-secondary text-right">{editingBio.length}/80</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditBio(false)}
                    className="flex-1 py-2 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Points and QR Section */}
          <div className="border-t border-neon-blue/20 pt-6 mt-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* QR Scanner Button */}
            <button
              onClick={() => setShowQRScanner(true)}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-500/30"
            >
              <QrCode className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Escanear Código QR</span>
            </button>
          </div>

          {/* Friends Section */}
          <div className="border-t border-neon-blue/20 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-blue" />
                <h3 className="text-xl font-bold text-text-light">Amigos</h3>
              </div>
              <span className="text-text-secondary text-sm">0 amigos</span>
            </div>

            {/* Add Friend Button */}
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-neon-pink to-neon-blue hover:opacity-90 transition-opacity shadow-lg shadow-neon-blue/30"
            >
              <UserPlus className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Añadir Amigo</span>
            </button>

            {/* Friends List Placeholder */}
            <div className="mt-4 text-center py-8">
              <div className="text-6xl mb-2">👥</div>
              <p className="text-text-secondary text-sm">
                Aún no tienes amigos agregados
              </p>
              <p className="text-text-secondary text-xs mt-1">
                ¡Escanea un QR o comparte tu enlace!
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector Card */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-6 border border-neon-blue/20 shadow-lg">
          <h3 className="text-lg font-bold text-text-light mb-4">Idioma</h3>
          <LanguageSelector />
        </div>

        {/* Recent Activity Card */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-6 border border-neon-blue/20 shadow-lg">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-text-light">{t('common.recentActivity')}</h3>
            <p className="text-text-secondary text-sm mt-1">
              {t('common.yourActivityHistory')}
            </p>
          </div>
          <ActivityFeed 
            limit={5} 
            userId={user.id} 
            onVenueClick={(venueId) => {
              const venue = venues.find(v => v.id === venueId)
              if (venue) onVenueClick(venueId)
            }} 
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
          }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('common.logout')}
        </button>
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        userId={user.id}
        username={username}
      />

      {/* QR Scanner */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  )
}
