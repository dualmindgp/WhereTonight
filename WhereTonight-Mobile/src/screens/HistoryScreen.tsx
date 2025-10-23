import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Clock, ChevronLeft } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { VenueWithCount, Ticket } from '../types/database.types'
import { useToastContext } from '../contexts/ToastContext'

interface HistoryScreenProps {
  userId: string
  onBack: () => void
  onVenueClick?: (venue: VenueWithCount) => void
}

export default function HistoryScreen({ userId, onBack, onVenueClick }: HistoryScreenProps) {
  const toast = useToastContext()
  const [history, setHistory] = useState<(Ticket & { venue?: VenueWithCount })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [userId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (ticketError) throw ticketError

      if (!tickets || tickets.length === 0) {
        setHistory([])
        return
      }

      const venueIds = [...new Set(tickets.map(t => t.venue_id))]

      const { data: venues, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .in('id', venueIds)

      if (venueError) throw venueError

      const venueMap = new Map(venues?.map(v => [v.id, v]) || [])

      const historyWithVenues = tickets.map(ticket => ({
        ...ticket,
        venue: venueMap.get(ticket.venue_id)
      }))

      setHistory(historyWithVenues)
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-primary">
      <View className="flex-row items-center gap-3 px-4 py-4 bg-dark-card border-b border-neon-blue/20">
        <TouchableOpacity onPress={onBack} className="p-2">
          <ChevronLeft className="w-6 h-6 text-text-light" />
        </TouchableOpacity>
        <Clock className="w-6 h-6 text-neon-cyan" />
        <Text className="text-xl font-bold text-white">Historial</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      ) : history.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Clock className="w-16 h-16 text-text-secondary mb-4" />
          <Text className="text-xl font-bold text-text-light mb-2">Sin historial</Text>
          <Text className="text-text-secondary text-center">
            Tu historial de visitas aparecerá aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.venue && onVenueClick?.(item.venue)}
              className="mx-4 my-2 bg-dark-card rounded-2xl p-4 border border-neon-cyan/20 flex-row items-center gap-4"
            >
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">
                  {item.venue?.name || 'Desconocido'}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {item.venue?.address || 'Sin dirección'}
                </Text>
                <View className="flex-row gap-2 mt-2">
                  <Text className="text-neon-cyan text-xs">
                    📅 {formatDate(item.local_date)}
                  </Text>
                  {item.venue?.rating && (
                    <Text className="text-neon-blue text-xs">⭐ {item.venue.rating}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
