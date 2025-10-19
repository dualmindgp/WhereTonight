# WhereTonight Mobile 📱

Aplicación móvil de WhereTonight desarrollada con React Native y Expo.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias adicionales

```bash
cd WhereTonight-Mobile

# Instalar iconos
npx expo install @expo/vector-icons

# Instalar dependencias de navegación
npx expo install react-native-gesture-handler react-native-reanimated
```

### 2. Configurar variables de entorno

Edita el archivo `.env` y añade tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

Puedes copiar estos valores del archivo `.env.local` de tu proyecto web.

### 3. Configurar Google Maps (Opcional para ahora)

En `app.json`, reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API key de Google Maps cuando la tengas.

## 📱 Probar la Aplicación

### Opción 1: Expo Go (Recomendado para empezar)

1. **Descarga Expo Go** en tu móvil:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm start
   ```

3. **Escanea el QR:**
   - iOS: Usa la cámara del iPhone
   - Android: Usa la app Expo Go

4. **¡Listo!** La app se cargará en tu teléfono

### Opción 2: Emulador Android (Windows)

```bash
npm run android
```

### Opción 3: Simulador iOS (Solo Mac)

```bash
npm run ios
```

## 📂 Estructura del Proyecto

```
WhereTonight-Mobile/
├── src/
│   ├── screens/          # Pantallas principales
│   │   ├── MapScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/       # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── components/       # Componentes reutilizables
│   ├── contexts/         # Context API
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Configuración (Supabase, etc.)
│   │   └── supabase.ts
│   └── types/           # TypeScript types
├── App.tsx              # Punto de entrada
├── app.json             # Configuración de Expo
└── package.json
```

## 🎯 Pantallas Implementadas

- ✅ **Mapa**: Muestra tu ubicación actual
- ✅ **Búsqueda**: Buscar locales
- ✅ **Favoritos**: Tus locales guardados
- ✅ **Perfil**: Configuración de usuario

## 🔧 Próximos Pasos

1. ✅ Estructura básica creada
2. ⏳ Conectar con Supabase
3. ⏳ Migrar lógica de negocio
4. ⏳ Implementar listado de venues
5. ⏳ Implementar autenticación
6. ⏳ Añadir funcionalidades sociales

## 🐛 Solución de Problemas

### Error: "Cannot find module"
Ejecuta:
```bash
npm install
npx expo install @expo/vector-icons react-native-gesture-handler react-native-reanimated
```

### La app no carga en Expo Go
1. Asegúrate de estar en la misma red WiFi
2. Reinicia el servidor: `npm start` y presiona `r`
3. Limpia caché: `npm start -- --clear`

### Warnings de Node version
Los warnings de versión de Node son normales y no afectan el funcionamiento.

## 📝 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Limpiar caché
npm start -- --clear

# Ver logs
npm start -- --dev-client

# Build para producción (más adelante)
eas build --platform android
eas build --platform ios
```

## 🎨 Colores del Tema

- Primary: `#8B5CF6` (Púrpura)
- Background: `#FFFFFF`
- Text: `#000000`
- Secondary Text: `#999999`

---

**Desarrollado con ❤️ para WhereTonight**
