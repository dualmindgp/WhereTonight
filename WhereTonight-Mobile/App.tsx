import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/ToastContainer';
import { VenueProvider } from './src/contexts/VenueContext';
import { ToastProvider } from './src/contexts/ToastContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <VenueProvider>
        <ToastProvider>
          <AppNavigator />
          <ToastContainer />
          <StatusBar style="auto" />
        </ToastProvider>
      </VenueProvider>
    </SafeAreaProvider>
  );
}
