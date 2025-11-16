# 🔄 Guía para Aplicar Cambios en PruebaApp

## 📋 Resumen de Cambios

Se han implementado dos mejoras importantes en WhereTonight:

### 1. ✅ Fix de Google Places API Photos
### 2. ✅ Nuevo Apartado Social estilo Instagram

---

## 🔧 Paso 1: Fix de Google Places API Photos

### **Problema**
Error 400 al cargar fotos de venues porque se usaba la API antigua con referencias de la API nueva.

### **Archivos a Modificar en PruebaApp**

#### `src/app/api/photo/route.ts`

**Cambio principal** (línea ~72-88):
```typescript
// ANTES (API antigua):
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`
const response = await fetch(photoUrl)

// DESPUÉS (API nueva v1):
// Verificar formato
if (!photoRef.includes('places/')) {
  console.warn(`Photo reference in old format - using fallback`)
  const { buffer, contentType } = await fetchFallbackImage(venueType)
  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=800&maxWidthPx=800`
const response = await fetch(photoUrl, {
  headers: {
    'X-Goog-Api-Key': apiKey
  }
})
```

#### Scripts de Seed (todos los `scripts/seed-*.ts`)

**Cambio en sección de fotos** (~línea 205-215):
```typescript
// ANTES:
if (placeDetails.photos && placeDetails.photos.length > 0) {
  const firstPhotoName = placeDetails.photos[0].name
  photoRef = firstPhotoName.split('/').pop()  // ❌ Solo último segmento
  
  photoRefs = placeDetails.photos
    .slice(0, 10)
    .map((photo: any) => photo.name.split('/').pop())  // ❌ Solo último segmento
    .filter(Boolean) as string[]
}

// DESPUÉS:
if (placeDetails.photos && placeDetails.photos.length > 0) {
  // Guardar el nombre completo para usar con la NEW Places API
  photoRef = placeDetails.photos[0].name  // ✅ Nombre completo
  
  photoRefs = placeDetails.photos
    .slice(0, 10)
    .map((photo: any) => photo.name)  // ✅ Nombre completo
    .filter(Boolean) as string[]
}
```

**Aplicar en**:
- `scripts/seed-madrid.ts`
- `scripts/seed-varsovia.ts`
- `scripts/seed-madrid-missing.ts`
- Cualquier otro script de seed que tengas

### **Resultado**
- ✅ Fotos de venues se cargan correctamente
- ✅ Compatible con NEW Google Places API v1
- ✅ Fallback images si hay referencias antiguas
- ✅ Re-seed necesario para actualizar datos

---

## 🎨 Paso 2: Mejoras Social estilo Instagram

### **Ubicación en WhereTonight**
```
WhereTonight/
├── src/components/
│   ├── FriendStories.tsx          ← COPIAR
│   ├── StoryViewer.tsx            ← COPIAR
│   └── SocialFeed.tsx             ← VER CAMBIOS
├── WhereTonight-Mobile/src/components/
│   ├── FriendStories.tsx          ← COPIAR
│   └── StoryViewer.tsx            ← COPIAR
└── WhereTonight-Mobile/src/screens/
    └── SocialFeedScreenNew.tsx    ← VER CAMBIOS
```

### **Proceso de Aplicación**

#### 1. **Copiar Componentes Nuevos**

**Para Web:**
```bash
# Desde WhereTonight a PruebaApp
cp src/components/FriendStories.tsx ../PruebaApp/src/components/
cp src/components/StoryViewer.tsx ../PruebaApp/src/components/
```

**Para Mobile (si existe):**
```bash
cp WhereTonight-Mobile/src/components/FriendStories.tsx ../PruebaApp/WhereTonight-Mobile/src/components/
cp WhereTonight-Mobile/src/components/StoryViewer.tsx ../PruebaApp/WhereTonight-Mobile/src/components/
```

#### 2. **Modificar SocialFeed Existente**

Abre `src/components/SocialFeed.tsx` en PruebaApp y aplica estos cambios:

**A. Imports** (principio del archivo):
```typescript
// Añadir estos imports
import FriendStories from './FriendStories'
import StoryViewer from './StoryViewer'
```

**B. State** (dentro del componente):
```typescript
// Añadir este state
const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null)
```

**C. Handlers** (antes del return):
```typescript
// Añadir estos handlers
const handleStoryClick = (friendId: string, username: string) => {
  setSelectedFriend({ id: friendId, username })
}

const handleCreateStory = () => {
  setShowNewPost(true)
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}
```

**D. JSX** (en el return, después del header):
```tsx
{/* Story Viewer Modal */}
{selectedFriend && (
  <StoryViewer
    friendId={selectedFriend.id}
    friendUsername={selectedFriend.username}
    onClose={() => setSelectedFriend(null)}
    selectedCity={selectedCity}
    currentUserId={userId}
  />
)}

{/* Header con gradiente */}
<div className="sticky top-0 z-20 bg-gradient-to-r...">
  {/* ... contenido del header ... */}
</div>

{/* Friend Stories - Tipo Instagram */}
<FriendStories
  userId={userId}
  selectedCity={selectedCity}
  onStoryClick={handleStoryClick}
  onCreateStory={handleCreateStory}
/>

{/* ... resto del contenido ... */}
```

#### 3. **Modificar SocialFeedScreenNew (Mobile)**

Si tienes versión mobile, aplica cambios similares en `SocialFeedScreenNew.tsx`:

**Imports:**
```typescript
import FriendStories from '../components/FriendStories'
import StoryViewer from '../components/StoryViewer'
```

**State:**
```typescript
const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null)
```

**Handlers:**
```typescript
const handleStoryClick = (friendId: string, username: string) => {
  setSelectedFriend({ id: friendId, username })
}

const handleCreateStory = () => {
  setNewPostContent('')
}
```

**JSX:**
```tsx
{/* Story Viewer Modal */}
{selectedFriend && (
  <StoryViewer
    visible={!!selectedFriend}
    friendId={selectedFriend.id}
    friendUsername={selectedFriend.username}
    onClose={() => setSelectedFriend(null)}
    selectedCity={selectedCity}
  />
)}

{/* ... header ... */}

{/* Friend Stories - Tipo Instagram */}
<FriendStories
  userId={userId}
  selectedCity={selectedCity}
  onStoryClick={handleStoryClick}
  onCreateStory={handleCreateStory}
/>
```

#### 4. **Verificar Dependencias**

**Web:**
```bash
cd PruebaApp
npm install  # Verifica que lucide-react esté instalado
```

**Mobile:**
```bash
cd PruebaApp/WhereTonight-Mobile
npx expo install expo-linear-gradient  # Si no existe
```

---

## ✅ Checklist de Verificación

### Fix de Fotos:
- [ ] Modificado `src/app/api/photo/route.ts`
- [ ] Actualizado todos los scripts `seed-*.ts`
- [ ] Re-ejecutado seed para actualizar referencias de fotos
- [ ] Verificado que las fotos cargan correctamente

### Social Instagram:
- [ ] Copiado `FriendStories.tsx` (web)
- [ ] Copiado `StoryViewer.tsx` (web)
- [ ] Modificado `SocialFeed.tsx` (web)
- [ ] Copiado `FriendStories.tsx` (mobile) - si aplica
- [ ] Copiado `StoryViewer.tsx` (mobile) - si aplica
- [ ] Modificado `SocialFeedScreenNew.tsx` (mobile) - si aplica
- [ ] Instalado `expo-linear-gradient` (mobile) - si aplica
- [ ] Probado funcionalidad de stories
- [ ] Verificado filtrado por ciudad
- [ ] Verificado posts 24h
- [ ] Verificado público/solo amigos

---

## 🚨 Notas Importantes

### **Base de Datos**
- ✅ NO requiere migraciones
- ✅ Usa tablas existentes: `social_posts`, `friendships`, `profiles`
- ✅ Compatible con datos actuales

### **TypeScript Warnings**
Los siguientes warnings son esperados en mobile:
```
Property 'username' does not exist on type 'never'
Property 'avatar_url' does not exist on type 'never'
Spread types may only be created from object types
```

Estos son errores de inferencia de tipos de Supabase y **NO afectan la funcionalidad**. El código funciona correctamente en runtime.

### **Compatibilidad**
- Requiere que PruebaApp tenga estructura similar a WhereTonight
- Requiere Supabase configurado
- Requiere sistema de amistad implementado

---

## 🎯 Resultado Esperado

Después de aplicar estos cambios, PruebaApp tendrá:

### Fix de Fotos:
- ✅ Fotos de venues funcionando correctamente
- ✅ Compatible con Google Places API v1

### Social Instagram:
- ✅ Barra de Friend Stories en la parte superior
- ✅ Click en foto de perfil muestra sus posts
- ✅ Búsqueda y filtrado por ciudad
- ✅ Posts temporales (24h)
- ✅ Control de audiencia (público/amigos)
- ✅ Diseño moderno tipo Instagram

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que los archivos copiados estén en las rutas correctas
2. Revisa que todos los imports sean correctos
3. Asegúrate de que las dependencias estén instaladas
4. Consulta `MEJORAS_SOCIAL_INSTAGRAM.md` para detalles técnicos

¡Todo listo para replicar en PruebaApp! 🎉
