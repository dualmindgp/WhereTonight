# WhereTonight Mobile 📱

Aplicación móvil de WhereTonight desarrollada con React Native y Expo.

## ✨ Estado de la Migración

✅ **Completado:**
- Estructura base con React Native + Expo
- 4 pantallas principales (Mapa, Búsqueda, Favoritos, Perfil)
- Navegación con tabs inferior
- Contextos (VenueContext, ToastContext)
- Sistema de notificaciones (Toast)
- Configuración de Supabase
- Permisos de ubicación

⏳ **En Progreso:**
- Integración completa con Supabase
- Autenticación
- Funcionalidades sociales

## 🚀 Instalación Rápida

```bash
cd WhereTonight-Mobile
npm install
npm start
```

## 📱 Ejecutar en tu iPhone

### Opción 1: Escanear QR (Recomendado)

1. Descarga **Expo Go** desde App Store
2. Ejecuta: `npm start`
3. Escanea el QR con la **Cámara del iPhone**
4. Se abrirá automáticamente en Expo Go

### Opción 2: Conexión Manual

1. Ejecuta: `npm start`
2. Abre **Expo Go** en tu iPhone
3. Ve a **Projects**
4. Busca y toca **WhereTonight-Mobile**

### Opción 3: Modo LAN (Si tienes problemas de red)

```bash
npm start -- --lan
```

Luego escanea el nuevo QR.

## 📂 Estructura del Proyecto

```
WhereTonight-Mobile/
├── src/
│   ├── screens/          # 4 pantallas principales
│   ├── navigation/       # Navegación con tabs
│   ├── components/       # Toast, etc.
│   ├── contexts/         # VenueContext, ToastContext
│   ├── hooks/           # useToast
│   ├── lib/             # Supabase config
│   └── types/           # TypeScript types
├── App.tsx              # Punto de entrada
└── app.json             # Config de Expo
```

## 🎯 Características

- 🗺️ **Mapa interactivo** con ubicación en tiempo real
- 🔍 **Búsqueda** de locales
- ❤️ **Favoritos** guardados
- 👤 **Perfil** de usuario
- 📱 **Navegación** con tabs inferior
- 🔔 **Notificaciones** (Toast)

## 🔧 Configuración de Variables de Entorno

Edita `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key
```

## 📊 Próximos Pasos

1. Conectar Supabase con datos reales
2. Implementar autenticación
3. Añadir funcionalidades sociales
4. Publicar en App Store y Play Store

## 🐛 Troubleshooting

**"Opening project" pero no carga:**
- Verifica que estés en la misma WiFi
- Intenta: `npm start -- --clear`
- O usa: `npm start -- --lan`

**Errores de módulos:**
```bash
npm install
```

**Firewall bloqueando conexión:**
- Windows: Permite Node.js en Firewall
- O usa modo LAN

## 📝 Comandos

```bash
npm start              # Inicia servidor
npm start -- --clear  # Limpia caché
npm run android       # Emulador Android
npm run ios          # Simulador iOS (Mac)
```

---

**Desarrollado con ❤️ para WhereTonight**
