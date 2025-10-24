import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface City {
  name: string
  lat: number
  lng: number
}

interface CityContextType {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
  isLoading: boolean
}

const CityContext = createContext<CityContextType | undefined>(undefined)

const CITY_STORAGE_KEY = '@wheretonight_selected_city'

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar ciudad guardada al iniciar
  useEffect(() => {
    loadSavedCity()
  }, [])

  const loadSavedCity = async () => {
    try {
      const savedCity = await AsyncStorage.getItem(CITY_STORAGE_KEY)
      if (savedCity) {
        setSelectedCityState(JSON.parse(savedCity))
      }
    } catch (error) {
      console.error('Error loading saved city:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setSelectedCity = async (city: City | null) => {
    try {
      setSelectedCityState(city)
      if (city) {
        await AsyncStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city))
      } else {
        await AsyncStorage.removeItem(CITY_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving city:', error)
    }
  }

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, isLoading }}>
      {children}
    </CityContext.Provider>
  )
}

export function useCityContext() {
  const context = useContext(CityContext)
  if (context === undefined) {
    throw new Error('useCityContext must be used within a CityProvider')
  }
  return context
}
