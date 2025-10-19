'use client'

import React, { useState, useRef } from 'react'
import { X, Upload, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: {
    id: string
    username?: string
    bio?: string
    avatar_url?: string
  }
  onProfileUpdated: () => void
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentProfile,
  onProfileUpdated 
}: EditProfileModalProps) {
  const { t } = useLanguage()
  const toast = useToastContext()
  const [username, setUsername] = useState(currentProfile.username || '')
  const [bio, setBio] = useState(currentProfile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('El archivo debe ser menor a 2MB')
      setError('El archivo debe ser menor a 2MB')
      return
    }

    // Validar formato
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.warning('Solo se permiten archivos PNG, JPG o WEBP')
      setError('Solo se permiten archivos PNG, JPG o WEBP')
      return
    }

    setAvatarFile(file)
    setError(null)

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        logger.error('Error al subir avatar', uploadError, { userId, fileName })
        return null
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      logger.trackEvent('avatar_uploaded_via_modal', { userId })
      return data.publicUrl
    } catch (error) {
      logger.error('Error en uploadAvatar', error as Error, { userId })
      return null
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      let newAvatarUrl = avatarUrl

      // Subir avatar si hay archivo nuevo
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile, currentProfile.id)
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl
        } else {
          setError(t('profile.errorUpdating'))
          setLoading(false)
          return
        }
      }

      // Actualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatar_url: newAvatarUrl || null
        })
        .eq('id', currentProfile.id)

      if (updateError) {
        logger.error('Error al actualizar perfil', updateError, { userId: currentProfile.id })
        setError(updateError.message)
        toast.error('Error al actualizar el perfil')
        setLoading(false)
        return
      }

      toast.success('Perfil actualizado correctamente')
      logger.trackEvent('profile_updated_via_modal', { userId: currentProfile.id })
      onProfileUpdated()
      onClose()
    } catch (error: any) {
      logger.error('Error al guardar perfil', error, { userId: currentProfile.id })
      setError(error.message)
      toast.error('Error al guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-dark-card rounded-t-3xl shadow-2xl border-t border-neon-blue/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-blue/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            {t('profile.editProfile')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-secondary transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {displayAvatar ? (
                <img 
                  src={displayAvatar} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-neon-blue/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center text-4xl font-bold text-white">
                  {username.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-neon-blue text-white hover:bg-neon-blue/80 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <p className="text-xs text-text-secondary">
              {t('profile.uploadAvatar')} (PNG, JPG, WEBP, máx. 2MB)
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              {t('profile.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="w-full bg-dark-secondary text-text-light rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="tu_nombre"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              {t('profile.bio')}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full bg-dark-secondary text-text-light rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder={t('profile.bioPlaceholder')}
            />
            <p className="text-xs text-text-secondary mt-1 text-right">
              {bio.length}/160
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neon-blue/20 flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('profile.saveProfile')}
          </button>
        </div>
      </div>
    </div>
  )
}
