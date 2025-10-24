import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MapPin, Search, X, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';

const { width } = Dimensions.get('window');

export interface City {
  name: string;
  lat: number;
  lng: number;
  country?: string;
}

interface CityOnboardingScreenProps {
  onCitySelect: (city: City) => void;
}

// Ciudades principales de España + Varsovia
const FEATURED_CITIES: City[] = [
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'España' },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734, country: 'España' },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763, country: 'España' },
  { name: 'Sevilla', lat: 37.3891, lng: -5.9845, country: 'España' },
  { name: 'Zaragoza', lat: 41.6488, lng: -0.8891, country: 'España' },
  { name: 'Málaga', lat: 36.7213, lng: -4.4214, country: 'España' },
  { name: 'Bilbao', lat: 43.263, lng: -2.935, country: 'España' },
  { name: 'Varsovia', lat: 52.2297, lng: 21.0122, country: 'Polonia' },
];

export default function CityOnboardingScreen({ onCitySelect }: CityOnboardingScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Búsqueda de ciudades con debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(searchQuery)}&` +
            `format=json&` +
            `addressdetails=1&` +
            `limit=8`,
          {
            headers: {
              'User-Agent': 'WhereTonight/1.0',
            },
          }
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();

        const cities: City[] = data
          .filter((item: any) => {
            if (item.class === 'place') return true;
            if (item.class === 'boundary' && item.type === 'administrative') return true;
            return false;
          })
          .map((item: any) => {
            const cityName = item.display_name.split(',')[0].trim();
            const country = item.address?.country || '';
            return {
              name: cityName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              country,
            };
          })
          .filter(
            (city: City, index: number, self: City[]) =>
              index === self.findIndex((c: City) => c.name === city.name)
          );

        setSearchResults(cities);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleCitySelect = async (city: City) => {
    console.log('🌍 [CityOnboarding] City selected:', city.name);
    // Guardar en AsyncStorage
    await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
    onCitySelect(city);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles color="#FF0080" size={32} />
          <Text style={styles.title}>¿Dónde te apetece salir hoy?</Text>
          <Sparkles color="#00D9FF" size={32} />
        </View>
        <Text style={styles.subtitle}>Selecciona tu ciudad y descubre la mejor vida nocturna</Text>
      </View>

      {/* Vista de búsqueda */}
      {showSearch ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchCard}>
            {/* Barra de búsqueda */}
            <View style={styles.searchInputContainer}>
              <Search color="#b0b0b0" size={20} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Busca cualquier ciudad del mundo..."
                placeholderTextColor="#666"
                style={styles.searchInput}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.clearButton}
              >
                <X color="#b0b0b0" size={20} />
              </TouchableOpacity>
            </View>

            {/* Resultados de búsqueda */}
            <ScrollView style={styles.resultsContainer}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00D9FF" />
                </View>
              ) : searchResults.length > 0 ? (
                <View style={styles.resultsGrid}>
                  {searchResults.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleCitySelect(city)}
                      style={styles.resultItem}
                    >
                      <View style={styles.resultIconContainer}>
                        <MapPin color="#ffffff" size={24} />
                      </View>
                      <View style={styles.resultTextContainer}>
                        <Text style={styles.resultName}>{city.name}</Text>
                        {city.country && <Text style={styles.resultCountry}>{city.country}</Text>}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : searchQuery.length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Search color="#666" size={48} />
                  <Text style={styles.emptyText}>No se encontraron ciudades</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Search color="#666" size={48} />
                  <Text style={styles.emptyText}>Escribe al menos 2 caracteres para buscar</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : (
        <>
          {/* Grid de ciudades principales */}
          <View style={styles.citiesGrid}>
            {FEATURED_CITIES.map((city) => (
              <TouchableOpacity
                key={city.name}
                onPress={() => handleCitySelect(city)}
                style={styles.cityCard}
              >
                <View style={styles.cityIconContainer}>
                  <MapPin color="#ffffff" size={32} />
                </View>
                <Text style={styles.cityName}>{city.name}</Text>
                {city.country && <Text style={styles.cityCountry}>{city.country}</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón de búsqueda personalizada */}
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.searchButton}>
              <Search color="#ffffff" size={20} />
              <Text style={styles.searchButtonText}>Buscar otra ciudad</Text>
            </TouchableOpacity>
            <Text style={styles.searchHint}>o selecciona una ciudad de arriba</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.primary,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.light,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  searchCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neon.blue + '30',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neon.blue + '30',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text.light,
    fontSize: fontSize.md,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    maxHeight: 400,
  },
  resultsGrid: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF0080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultCountry: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  cityCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neon.blue + '30',
  },
  cityIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neon.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityName: {
    color: colors.text.light,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cityCountry: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  searchButtonContainer: {
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neon.pink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  searchButtonText: {
    color: colors.text.light,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  searchHint: {
    color: '#b0b0b0',
    fontSize: 12,
  },
});
