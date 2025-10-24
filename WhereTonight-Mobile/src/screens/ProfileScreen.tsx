import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { User, LogOut, Edit, Heart, Clock, Users, Settings } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/database.types'
import { useToastContext } from '../contexts/ToastContext'
import EditProfileModal from '../components/EditProfileModal'

interface ProfileScreenProps {
  userId: string
  onLogout: () => void
  onShowFavorites?: () => void
  onShowHistory?: () => void
  onShowFriends?: () => void
  onShowSettings?: () => void
}

export default function ProfileScreen({
  userId,
  onLogout,
  onShowFavorites,
  onShowHistory,
  onShowFriends,
  onShowSettings
}: ProfileScreenProps) {
  const toast = useToastContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setUsername(data.username || '')
        setBio(data.bio || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim()
        })
        .eq('id', userId)

      if (error) throw error

      setProfile({
        ...profile!,
        username: username.trim(),
        bio: bio.trim()
      })
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar perfil')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      onLogout()
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-primary justify-center items-center">
        <ActivityIndicator size="large" color="#00D9FF" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-primary">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gradient-to-b from-neon-blue/20 to-dark-primary px-6 py-8">
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue items-center justify-center mb-4">
              <User className="w-12 h-12 text-white" />
            </View>
            {editing ? (
              <View className="w-full gap-3">
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#999"
                  className="w-full px-4 py-2 bg-dark-secondary text-text-light rounded-lg border border-neon-blue/30"
                />
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Bio"
                  placeholderTextColor="#999"
                  multiline
                  maxLength={150}
                  className="w-full px-4 py-2 bg-dark-secondary text-text-light rounded-lg border border-neon-blue/30 min-h-[80px]"
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setEditing(false)
                      setUsername(profile?.username || '')
                      setBio(profile?.bio || '')
                    }}
                    className="flex-1 px-4 py-2 bg-dark-secondary rounded-lg"
                  >
                    <Text className="text-text-light text-center font-bold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    className="flex-1 px-4 py-2 bg-neon-blue rounded-lg"
                  >
                    <Text className="text-white text-center font-bold">Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-2xl font-bold text-white mb-1">
                  {profile?.username || 'Usuario'}
                </Text>
                <Text className="text-text-secondary text-center mb-4">
                  {profile?.bio || 'Sin bio'}
                </Text>
                <TouchableOpacity
                  onPress={() => setEditing(true)}
                  className="flex-row items-center gap-2 px-4 py-2 bg-neon-blue/20 rounded-lg border border-neon-blue/30"
                >
                  <Edit className="w-4 h-4 text-neon-blue" />
                  <Text className="text-neon-blue font-bold">Editar Perfil</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 py-6 gap-3">
          <TouchableOpacity
            onPress={onShowFavorites}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-pink/20"
          >
            <Heart className="w-6 h-6 text-neon-pink" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Mis Favoritos</Text>
              <Text className="text-text-secondary text-sm">Locales guardados</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowHistory}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-cyan/20"
          >
            <Clock className="w-6 h-6 text-neon-cyan" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Historial</Text>
              <Text className="text-text-secondary text-sm">Donde has estado</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowFriends}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-blue/20"
          >
            <Users className="w-6 h-6 text-neon-blue" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Amigos</Text>
              <Text className="text-text-secondary text-sm">Tu red social</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowSettings}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-text-secondary/20"
          >
            <Settings className="w-6 h-6 text-text-secondary" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Configuración</Text>
              <Text className="text-text-secondary text-sm">Preferencias</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center gap-3 px-4 py-4 bg-red-500/10 rounded-2xl border border-red-500/30 mt-4"
          >
            <LogOut className="w-6 h-6 text-red-500" />
            <Text className="text-lg font-bold text-red-500">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
