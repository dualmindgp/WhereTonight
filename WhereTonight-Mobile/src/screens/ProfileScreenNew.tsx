import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import { useHistory } from '../hooks/useHistory';
import FavoritesScreenNew from './FavoritesScreenNew';
import HistoryScreenNew from './HistoryScreenNew';

interface ProfileScreenNewProps {
  userId: string;
  onLogout: () => void;
}

export default function ProfileScreenNew({ userId, onLogout }: ProfileScreenNewProps) {
  const toast = useToastContext();
  const { favorites } = useFavorites(userId);
  const { totalVisits } = useHistory(userId);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.username?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
          </View>
          <Text style={styles.username}>{profile?.username || 'Usuario'}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowFavorites(true)}
          >
            <Ionicons name="heart" size={24} color="#FF1493" />
            <Text style={styles.statValue}>{favorites.size}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowHistory(true)}
          >
            <Ionicons name="time" size={24} color="#00D9FF" />
            <Text style={styles.statValue}>{totalVisits}</Text>
            <Text style={styles.statLabel}>Visitas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="people" size={24} color="#FFD700" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowFavorites(true)}
          >
            <Ionicons name="heart-outline" size={20} color="#FF1493" />
            <Text style={styles.menuItemText}>Mis Favoritos</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowHistory(true)}
          >
            <Ionicons name="time-outline" size={20} color="#00D9FF" />
            <Text style={styles.menuItemText}>Historial de Visitas</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="people-outline" size={20} color="#FFD700" />
            <Text style={styles.menuItemText}>Mis Amigos</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={20} color="#888" />
            <Text style={styles.menuItemText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF1493" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modales */}
      <Modal
        visible={showFavorites}
        animationType="slide"
        onRequestClose={() => setShowFavorites(false)}
      >
        <FavoritesScreenNew
          userId={userId}
          onClose={() => setShowFavorites(false)}
        />
      </Modal>

      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <HistoryScreenNew
          userId={userId}
          onClose={() => setShowHistory(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF20',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#00D9FF20',
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 16,
    backgroundColor: '#FF149320',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FF1493',
    gap: 12,
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF1493',
  },
});
