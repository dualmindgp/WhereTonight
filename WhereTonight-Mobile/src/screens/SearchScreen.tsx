import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenues } from '../contexts/VenueContext';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { venues } = useVenues();

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, venues]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar locales..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {searchQuery.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Busca locales, bares, discotecas...</Text>
        </View>
      ) : filteredVenues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron resultados</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.venueCard}>
              <View style={styles.venueContent}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.venueFooter}>
                  {item.rating && (
                    <Text style={styles.venueRating}>⭐ {item.rating}</Text>
                  )}
                  {item.category && (
                    <Text style={styles.venueCategory}>{item.category}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
            </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  listContent: {
    padding: 10,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  venueContent: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  venueDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  venueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  venueRating: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  venueCategory: {
    fontSize: 11,
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
