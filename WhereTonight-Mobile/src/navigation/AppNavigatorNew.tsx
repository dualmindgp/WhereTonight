import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Search, MessageCircle, User } from 'lucide-react-native'
import { supabase } from '../lib/supabase'

// Screens
import MapScreen from '../screens/MapScreen'
import SearchScreen from '../screens/SearchScreen'
import SocialFeedScreen from '../screens/SocialFeedScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AuthScreen from '../screens/AuthScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import HistoryScreen from '../screens/HistoryScreen'
import FriendsScreen from '../screens/FriendsScreen'

export type RootStackParamList = {
  Auth: undefined
  MainTabs: undefined
}

export type MainTabsParamList = {
  Home: undefined
  Search: undefined
  Social: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabsParamList>()

function MainTabs({ userId }: { userId: string }) {
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lng: number } | undefined>(undefined)
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
        component={() => <SocialFeedScreen userId={userId} selectedCity={selectedCity} />}
        options={{
          tabBarLabel: 'Social',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => (
          <ProfileScreen
            userId={userId}
            onLogout={() => {}}
            onShowFavorites={() => setShowFavorites(true)}
            onShowHistory={() => setShowHistory(true)}
            onShowFriends={() => setShowFriends(true)}
            onShowSettings={() => setShowSettings(true)}
          />
        )}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={() => <MainTabs userId={user.id} />} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
