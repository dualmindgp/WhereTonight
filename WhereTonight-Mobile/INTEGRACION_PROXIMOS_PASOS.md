# 🔗 Integración - Próximos Pasos

## 1. Actualizar AppNavigator.tsx

El `AppNavigator.tsx` actual necesita ser actualizado para incluir las nuevas pantallas y modales.

### Cambios necesarios:

```typescript
// Importar las nuevas pantallas
import VenueDetailScreen from '../screens/VenueDetailScreen'
import FavoritesScreenNew from '../screens/FavoritesScreenNew'
import HistoryScreenNew from '../screens/HistoryScreenNew'
import SocialFeedScreenNew from '../screens/SocialFeedScreenNew'

// Actualizar MainTabs para pasar props correctamente
function MainTabs({ userId }: { userId: string }) {
  const [selectedVenue, setSelectedVenue] = useState<VenueWithCount | null>(null)
  const [showVenueDetail, setShowVenueDetail] = useState(false)
  
  // ... resto del código
}
```

## 2. Corregir Tipos TypeScript

### Actualizar `database.types.ts`:

```typescript
export interface VenueWithCount extends Venue {
  count_today?: number
  phone?: string
  description?: string
  website?: string
}

export interface Favorite {
  id: string
  user_id: string
  venue_id: string
  created_at: string
}

export interface SocialPost {
  id: string
  user_id: string
  content: string
  city: string
  city_lat: number
  city_lng: number
  audience: 'public' | 'friends_only'
  created_at: string
  updated_at: string
}
```

## 3. Integración de Pantallas en Navegación

### Estructura recomendada:

```
AppNavigator
├── Auth Stack
│   └── AuthScreen
└── Main Stack
    ├── MainTabs
    │   ├── Home (MapScreen)
    │   ├── Search (SearchScreen)
    │   ├── Social (SocialFeedScreenNew)
    │   └── Profile (ProfileScreen)
    └── Modales
        ├── VenueDetailScreen
        ├── FavoritesScreenNew
        ├── HistoryScreenNew
        └── FriendsScreen
```

## 4. Pasar Props Entre Pantallas

### Ejemplo de integración en MapScreen:

```typescript
// En MapScreen.tsx
const handleVenuePress = (venue: VenueWithCount) => {
  setSelectedVenue(venue)
  setShowVenueDetail(true)
}

// Mostrar modal
{showVenueDetail && selectedVenue && (
  <Modal visible={showVenueDetail} animationType="slide">
    <VenueDetailScreen
      venue={selectedVenue}
      onClose={() => setShowVenueDetail(false)}
      onAddFavorite={handleAddFavorite}
      onRemoveFavorite={handleRemoveFavorite}
      isFavorite={favorites.has(selectedVenue.id)}
    />
  </Modal>
)}
```

## 5. Conectar Favoritos

### En ProfileScreen:

```typescript
const [showFavorites, setShowFavorites] = useState(false)

// Botón para mostrar favoritos
<TouchableOpacity onPress={() => setShowFavorites(true)}>
  <Text>Mis Favoritos</Text>
</TouchableOpacity>

// Modal
{showFavorites && (
  <Modal visible={showFavorites} animationType="slide">
    <FavoritesScreenNew
      userId={userId}
      onClose={() => setShowFavorites(false)}
      onVenuePress={handleVenuePress}
    />
  </Modal>
)}
```

## 6. Conectar Historial

### Similar a favoritos:

```typescript
const [showHistory, setShowHistory] = useState(false)

{showHistory && (
  <Modal visible={showHistory} animationType="slide">
    <HistoryScreenNew
      userId={userId}
      onClose={() => setShowHistory(false)}
      onVenuePress={handleVenuePress}
    />
  </Modal>
)}
```

## 7. Conectar Feed Social

### En SocialFeedScreen:

```typescript
// Pasar userId y ciudad seleccionada
<SocialFeedScreenNew
  userId={userId}
  selectedCity={selectedCity}
  onClose={() => setShowSocial(false)}
/>
```

## 8. Manejar Selección de Ciudad

### En MapScreen:

```typescript
const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lng: number } | null>(null)

// Cuando el usuario selecciona una ciudad
const handleCitySelect = (city: { name: string; lat: number; lng: number }) => {
  setSelectedCity(city)
  // Actualizar venues
  // Actualizar feed social
}
```

## 9. Sincronizar Favoritos

### Crear hook personalizado:

```typescript
// hooks/useFavorites.ts
export function useFavorites(userId: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  const loadFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('venue_id')
      .eq('user_id', userId)
    
    const ids = new Set(data?.map(f => f.venue_id) || [])
    setFavorites(ids)
  }
  
  const addFavorite = async (venueId: string) => {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, venue_id: venueId })
    
    setFavorites(prev => new Set([...prev, venueId]))
  }
  
  const removeFavorite = async (venueId: string) => {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('venue_id', venueId)
    
    setFavorites(prev => {
      const next = new Set(prev)
      next.delete(venueId)
      return next
    })
  }
  
  useEffect(() => {
    loadFavorites()
  }, [userId])
  
  return { favorites, addFavorite, removeFavorite }
}
```

## 10. Checklist de Integración

- [ ] Actualizar `AppNavigator.tsx`
- [ ] Corregir tipos en `database.types.ts`
- [ ] Integrar `VenueDetailScreen`
- [ ] Integrar `FavoritesScreenNew`
- [ ] Integrar `HistoryScreenNew`
- [ ] Integrar `SocialFeedScreenNew`
- [ ] Crear hook `useFavorites`
- [ ] Sincronizar estado de favoritos
- [ ] Manejar selección de ciudad
- [ ] Pruebas en dispositivo real
- [ ] Optimizar rendimiento
- [ ] Manejar errores de red

## 11. Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar Expo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Limpiar caché
npm start -- --clear

# Ver logs
npm start -- --verbose
```

## 12. Variables de Entorno

Asegúrate de que `.env` tenga:

```
EXPO_PUBLIC_SUPABASE_URL=https://gbhffekgxwbeehzzogsp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE
```

## 13. Estructura Final Esperada

```
WhereTonight-Mobile/
├── src/
│   ├── screens/
│   │   ├── MapScreen.tsx ✅
│   │   ├── SearchScreen.tsx ✅
│   │   ├── VenueDetailScreen.tsx ✅
│   │   ├── FavoritesScreenNew.tsx ✅
│   │   ├── HistoryScreenNew.tsx ✅
│   │   ├── SocialFeedScreenNew.tsx ✅
│   │   ├── ProfileScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   └── FriendsScreen.tsx
│   ├── contexts/
│   │   ├── VenueContext.tsx
│   │   ├── ToastContext.tsx ✅
│   │   └── LanguageContext.tsx
│   ├── hooks/
│   │   └── useFavorites.ts (crear)
│   ├── navigation/
│   │   └── AppNavigator.tsx (actualizar)
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── database.types.ts (actualizar)
│   └── components/
│       └── Toast.tsx
├── .env
├── app.json
└── package.json
```

---

**Tiempo estimado de integración**: 2-3 horas
**Dificultad**: Media
**Prioridad**: Alta
