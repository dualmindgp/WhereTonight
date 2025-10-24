import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Keyboard
} from 'react-native'
import { MapPin, X, Search } from 'lucide-react-native'
import { City } from '../contexts/CityContext'

interface CitySelectorProps {
  visible: boolean
  onClose: () => void
  onSelect: (city: City) => void
  selectedCity: City | null
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  class: string
  type: string
}

export default function CitySelector({ visible, onClose, onSelect, selectedCity }: CitySelectorProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [loading, setLoading] = useState(false)

  // Búsqueda con debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      await searchCities(query)
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const searchCities = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=10`,
        {
          headers: {
            'User-Agent': 'WhereTonight/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }

      const data: NominatimResult[] = await response.json()

      // Filtrar solo lugares que son ciudades
      const cities: City[] = data
        .filter((item) => {
          if (item.class === 'place') return true
          if (item.class === 'boundary' && item.type === 'administrative') return true
          return false
        })
        .map((item) => {
          const cityName = item.display_name.split(',')[0].trim()
          return {
            name: cityName,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        })
        // Eliminar duplicados
        .filter((city, index, self) =>
          index === self.findIndex((c) => c.name === city.name)
        )

      setSuggestions(cities)
    } catch (error) {
      console.error('Error searching cities:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCity = (city: City) => {
    onSelect(city)
    setQuery('')
    setSuggestions([])
    Keyboard.dismiss()
    onClose()
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Ciudad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          {/* Selected City Display */}
          {selectedCity && (
            <View style={styles.selectedCityContainer}>
              <MapPin color="#00D9FF" size={20} />
              <Text style={styles.selectedCityText}>{selectedCity.name}</Text>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search color="#b0b0b0" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ciudad..."
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <X color="#666" size={20} />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#00D9FF" size="large" />
              <Text style={styles.loadingText}>Buscando ciudades...</Text>
            </View>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectCity(item)}
                >
                  <MapPin color="#00D9FF" size={18} />
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
            />
          )}

          {/* Empty State */}
          {!loading && query.length >= 2 && suggestions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron ciudades</Text>
            </View>
          )}

          {/* Initial State */}
          {!loading && query.length < 2 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Escribe al menos 2 caracteres</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1f3a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  selectedCityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  selectedCityText: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#b0b0b0',
    marginTop: 12,
  },
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f4a',
    gap: 12,
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#b0b0b0',
    fontSize: 16,
  },
})
