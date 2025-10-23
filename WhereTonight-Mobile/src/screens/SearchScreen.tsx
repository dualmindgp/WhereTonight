import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenues } from '../contexts/VenueContext';
import { VenueWithCount } from '../types/database.types';
import { Ionicons } from '@expo/vector-icons';

interface FilterOptions {
  priceRange: string[];
  minRating: number;
  sortBy: 'popularity' | 'rating' | 'price';
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [],
    minRating: 0,
    sortBy: 'popularity'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { venues } = useVenues();

  const filteredVenues = useMemo(() => {
    let result = venues as VenueWithCount[];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      result = result.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por precio
    if (filters.priceRange.length > 0) {
      result = result.filter(v => {
        if (!v.avg_price_text) return false;
        return filters.priceRange.some(price => v.avg_price_text?.includes(price));
      });
    }

    // Filtrar por rating
    if (filters.minRating > 0) {
      result = result.filter(v => (v.rating || 0) >= filters.minRating);
    }

    // Ordenar
    if (filters.sortBy === 'popularity') {
      result.sort((a, b) => (b.count_today || 0) - (a.count_today || 0));
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'price') {
      result.sort((a, b) => {
        const priceA = (a.avg_price_text?.match(/\$/g) || []).length;
        const priceB = (b.avg_price_text?.match(/\$/g) || []).length;
        return priceA - priceB;
      });
    }

    return result;
  }, [searchQuery, venues, filters]);

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
                  {item.count_today && (
                    <Text style={styles.venueCategory}>👥 {item.count_today} hoy</Text>
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
