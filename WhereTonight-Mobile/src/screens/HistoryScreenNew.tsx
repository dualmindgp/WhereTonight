import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { VenueWithCount } from '../types/database.types';
import { useToastContext } from '../contexts/ToastContext';

interface HistoryItem {
  venue_id: string;
  venue_name: string;
  local_date: string;
  count: number;
}

interface HistoryScreenNewProps {
  userId: string;
  onVenuePress?: (venue: VenueWithCount) => void;
  onClose?: () => void;
}

export default function HistoryScreenNew({
  userId,
  onVenuePress,
  onClose
}: HistoryScreenNewProps) {
  const toast = useToastContext();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // Obtener tickets del usuario
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('venue_id, local_date')
        .eq('user_id', userId)
        .order('local_date', { ascending: false })
        .limit(100);

      if (ticketsError) throw ticketsError;

      if (!ticketsData || ticketsData.length === 0) {
        setHistory([]);
        setTotalVisits(0);
        return;
      }

      setTotalVisits(ticketsData.length);

      // Agrupar por fecha
      const grouped: { [key: string]: any[] } = {};
      ticketsData.forEach(ticket => {
        if (!grouped[ticket.local_date]) {
          grouped[ticket.local_date] = [];
        }
        grouped[ticket.local_date].push(ticket);
      });

      // Obtener información de venues
      const venueIds = [...new Set(ticketsData.map(t => t.venue_id))];
      const { data: venuesData } = await supabase
        .from('venues')
        .select('id, name, address, rating, type')
        .in('id', venueIds);

      const venueMap = new Map(venuesData?.map(v => [v.id, v]) || []);

      // Formatear datos
      const sections = Object.entries(grouped).map(([date, tickets]) => ({
        title: formatDate(date),
        data: tickets.map(t => ({
          ...venueMap.get(t.venue_id),
          local_date: t.local_date
        }))
      }));

      setHistory(sections);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Hoy';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitle}>
          <Ionicons name="time" size={24} color="#00D9FF" />
          <Text style={styles.title}>Historial</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalVisits}</Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#00D9FF30" />
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyText}>Tus visitas a locales aparecerán aquí</Text>
        </View>
      ) : (
        <SectionList
          sections={history}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.venueCard}
              onPress={() => onVenuePress?.(item)}
            >
              <View style={styles.venueCardLeft}>
                <View style={styles.venueImage}>
                  <Text style={styles.venueImagePlaceholder}>🕐</Text>
                </View>
              </View>

              <View style={styles.venueContent}>
                <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.venueMetaRow}>
                  {item.rating && (
                    <Text style={styles.venueRating}>⭐ {item.rating.toFixed(1)}</Text>
                  )}
                  {item.type && (
                    <Text style={styles.venueType}>{item.type}</Text>
                  )}
                </View>
                {item.address && (
                  <Text style={styles.venueAddress} numberOfLines={1}>{item.address}</Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={20} color="#00D9FF" />
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D9FF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D9FF',
    textTransform: 'capitalize',
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00D9FF20',
    gap: 12,
  },
  venueCardLeft: {
    width: 70,
    height: 70,
  },
  venueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00D9FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueImagePlaceholder: {
    fontSize: 28,
  },
  venueContent: {
    flex: 1,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  venueRating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  venueType: {
    fontSize: 11,
    color: '#00D9FF',
    backgroundColor: '#00D9FF10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  venueAddress: {
    fontSize: 12,
    color: '#888',
  },
});
