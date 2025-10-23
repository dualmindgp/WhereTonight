import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigatorNew'
import { ToastContainer } from './src/components/ToastContainer'
import { VenueProvider } from './src/contexts/VenueContext'
import { ToastProvider } from './src/contexts/ToastContext'
import { LanguageProvider } from './src/contexts/LanguageContext'

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <VenueProvider>
          <ToastProvider>
            <AppNavigator />
            <ToastContainer />
            <StatusBar style="auto" />
          </ToastProvider>
        </VenueProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  )
}
