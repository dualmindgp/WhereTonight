'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface EditNameModalProps {
  isOpen: boolean
  currentName: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditNameModal({ 
  isOpen, 
  currentName, 
  userId, 
  onClose, 
  onSuccess 
}: EditNameModalProps) {
  const toast = useToastContext()
  const [newName, setNewName] = useState(currentName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!newName.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    if (newName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    if (newName.length > 20) {
      setError('El nombre no puede tener más de 20 caracteres')
      return
    }

    // Solo letras, números, guiones bajos y espacios
    const validNameRegex = /^[a-zA-Z0-9_\s]+$/
    if (!validNameRegex.test(newName)) {
      setError('Solo se permiten letras, números, guiones bajos y espacios')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Verificar si el nombre ya existe (case-insensitive)
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', newName.trim())

      if (checkError) throw checkError

      // Verificar si existe otro usuario con ese nombre
      const nameExists = existingUsers?.some(user => 
        user.id !== userId && user.username?.toLowerCase() === newName.trim().toLowerCase()
      )

      if (nameExists) {
        setError('Este nombre ya está en uso. Elige otro.')
        setIsSubmitting(false)
        return
      }

      // 2. Actualizar el nombre
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newName.trim() })
        .eq('id', userId)

      if (updateError && updateError.code === 'PGRST116') {
        // Si no existe el perfil, crearlo
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: newName.trim()
          })
        
        if (insertError) throw insertError
      } else if (updateError) {
        throw updateError
      }

      // 3. Éxito
      toast.success('Nombre actualizado correctamente')
      logger.trackEvent('username_updated', { userId, newName: newName.trim() })
      onSuccess()
      onClose()
    } catch (error: any) {
      logger.error('Error al actualizar nombre', error, { userId, newName: newName.trim() })
      const errorMessage = error.message || 'Error al actualizar el nombre'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-neon-blue/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Editar Nombre</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-light" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-light text-sm font-medium mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              placeholder="Tu nombre"
              maxLength={20}
              disabled={isSubmitting}
            />
            <p className="text-text-secondary text-xs mt-1">
              {newName.length}/20 caracteres
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="text-text-secondary text-sm mb-6">
            <p className="mb-2">⚠️ Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>3-20 caracteres</li>
              <li>Letras, números, _ y espacios</li>
              <li>Debe ser único</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
