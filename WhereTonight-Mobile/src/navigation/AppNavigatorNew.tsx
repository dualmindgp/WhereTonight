import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Search, MessageCircle, User } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { useCityContext } from '../contexts/CityContext'

// Screens
import MapScreen from '../screens/MapScreen'
import SearchScreen from '../screens/SearchScreen'
import SocialFeedScreen from '../screens/SocialFeedScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AuthScreen from '../screens/AuthScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import HistoryScreen from '../screens/HistoryScreen'
import FriendsScreen from '../screens/FriendsScreen'
import CityOnboardingScreen from '../components/CityOnboardingScreen'

export type RootStackParamList = {
  CityOnboarding: undefined
  MainTabs: undefined
  Auth: undefined
}

export type MainTabsParamList = {
  Home: undefined
  Search: undefined
  Social: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabsParamList>()

function MainTabs({ userId }: { userId?: string }) {
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#00d9ff30',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#00D9FF',
        tabBarInactiveTintColor: '#666'
      }}
    >
      <Tab.Screen
        name="Home"
        component={MapScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Social"
        component={() => <SocialFeedScreen userId={userId} />}
        options={{
          tabBarLabel: 'Social',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => (
          userId ? (
            <ProfileScreen
              userId={userId}
              onLogout={() => {}}
              onShowFavorites={() => setShowFavorites(true)}
              onShowHistory={() => setShowHistory(true)}
              onShowFriends={() => setShowFriends(true)}
              onShowSettings={() => setShowSettings(true)}
            />
          ) : (
            <AuthScreen onAuthSuccess={() => {}} />
          )
        )}
        options={{
          tabBarLabel: userId ? 'Perfil' : 'Login',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { selectedCity, setSelectedCity, isLoading: cityLoading } = useCityContext()

  useEffect(() => {
    console.log('🔍 [AppNavigator] Checking initial session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 [AppNavigator] Initial session:', session ? 'LOGGED IN' : 'NOT LOGGED IN')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 [AppNavigator] Auth state changed:', event, session ? 'USER PRESENT' : 'NO USER')
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading || cityLoading) {
    return null
  }

  const handleAuthSuccess = () => {
    console.log('✅ [AppNavigator] Auth success - refreshing session...')
    // Forzar recarga de la sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 [AppNavigator] Refreshed session:', session ? 'LOGGED IN' : 'NOT LOGGED IN')
      setUser(session?.user ?? null)
    })
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Siempre mostrar CityOnboarding primero si no hay ciudad */}
        {!selectedCity ? (
          <Stack.Screen name="CityOnboarding">
            {() => <CityOnboardingScreen onCitySelect={setSelectedCity} />}
          </Stack.Screen>
        ) : (
          <>
            {/* MainTabs siempre accesible (con o sin usuario) */}
            <Stack.Screen name="MainTabs">
              {() => <MainTabs userId={user?.id} />}
            </Stack.Screen>
            {/* AuthScreen como modal opcional */}
            <Stack.Screen 
              name="Auth"
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            >
              {() => <AuthScreen onAuthSuccess={handleAuthSuccess} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
