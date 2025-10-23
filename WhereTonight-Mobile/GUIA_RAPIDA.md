# 🚀 Guía Rápida - Migración Completa

## En 5 Minutos

### 1️⃣ Reemplazar archivos principales
```bash
cd WhereTonight-Mobile

# Reemplazar App.tsx
cp AppNew.tsx App.tsx

# Reemplazar navegación
cp src/navigation/AppNavigatorNew.tsx src/navigation/AppNavigator.tsx
```

### 2️⃣ Renombrar pantallas
```bash
# Pantallas nuevas
mv src/screens/FavoritesScreenNew.tsx src/screens/FavoritesScreen.tsx
mv src/screens/FriendsScreenNew.tsx src/screens/FriendsScreen.tsx
mv src/screens/ProfileScreenNew.tsx src/screens/ProfileScreen.tsx
```

### 3️⃣ Instalar dependencias
```bash
npm install
```

### 4️⃣ Ejecutar
```bash
npm run android
# o
npm start
```

---

## ✨ Lo que ya está hecho

| Funcionalidad | Estado | Archivo |
|---|---|---|
| 🔐 Autenticación | ✅ | AuthScreen.tsx |
| 🔍 Búsqueda avanzada | ✅ | SearchScreen.tsx |
| ❤️ Favoritos | ✅ | FavoritesScreenNew.tsx |
| 📅 Historial | ✅ | HistoryScreen.tsx |
| 💬 Feed Social | ✅ | SocialFeedScreen.tsx |
| 👥 Sistema de Amigos | ✅ | FriendsScreenNew.tsx |
| 👤 Perfil de Usuario | ✅ | ProfileScreenNew.tsx |
| 🗺️ Mapa | ✅ | MapScreen.tsx (existente) |
| 🌐 Multiidioma | ✅ | LanguageContext.tsx |
| 📢 Notificaciones | ✅ | ToastContext.tsx (existente) |

---

## 🎯 Funcionalidades Principales

### Autenticación
```typescript
// Login/Signup automático
// Email + Contraseña
// Integrado con Supabase
```

### Búsqueda
```typescript
// Filtrar por precio: $ $$ $$$ $$$$
// Filtrar por rating: 1-5 estrellas
// Ordenar por: Popularidad, Rating, Precio
```

### Favoritos
```typescript
// Guardar/eliminar favoritos
// Ver información del local
// Contador de personas hoy
```

### Historial
```typescript
// Ver dónde has estado
// Fechas formateadas
// Últimas 50 visitas
```

### Social
```typescript
// Crear posts públicos/privados
// Ver posts de la comunidad
// Eliminar posts propios
// Filtrar por ciudad
```

### Amigos
```typescript
// Buscar usuarios
// Enviar solicitudes
// Ver amigos aceptados
// Eliminar amigos
```

### Perfil
```typescript
// Editar nombre y bio
// Ver favoritos
// Ver historial
// Ver amigos
// Cerrar sesión
```

---

## 🔧 Configuración

### Variables de entorno (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key (opcional)
```

---

## 📱 Pantallas Disponibles

### Bottom Tabs (Siempre visible)
- 🏠 **Inicio** - Mapa interactivo
- 🔍 **Buscar** - Búsqueda con filtros
- 💬 **Social** - Feed de posts
- 👤 **Perfil** - Perfil de usuario

### Modales (Desde Perfil)
- ❤️ Mis Favoritos
- 📅 Historial
- 👥 Amigos
- ⚙️ Configuración

---

## 🎨 Temas y Colores

```
Fondo: #0f0f1e (dark-primary)
Tarjetas: #1a1a2e (dark-card)
Secundario: #16213e (dark-secondary)

Colores Neon:
- Azul: #00D9FF (neon-blue)
- Cian: #00D9FF (neon-cyan)
- Rosa: #FF1493 (neon-pink)
```

---

## 🌐 Idiomas

Cambiar idioma en `LanguageContext.tsx`:
```typescript
const [language, setLanguage] = useState<Language>('es') // o 'en'
```

Soportados:
- 🇪🇸 Español (es)
- 🇬🇧 Inglés (en)

---

## 🐛 Troubleshooting

### Error: "Supabase URL and Anon Key must be provided"
→ Verifica `.env` tiene las variables correctas

### Error: "Cannot find module"
→ Ejecuta `npm install`

### Error: "ReferenceError: useLanguage is not defined"
→ Asegúrate que `LanguageProvider` está en App.tsx

### Error de tipos TypeScript
→ Ejecuta `npm run type-check`

---

## 📚 Archivos Importantes

```
WhereTonight-Mobile/
├── App.tsx                          # Entry point (reemplazar)
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx          # Login/Signup
│   │   ├── MapScreen.tsx           # Mapa (existente)
│   │   ├── SearchScreen.tsx        # Búsqueda (actualizado)
│   │   ├── FavoritesScreenNew.tsx  # Favoritos
│   │   ├── HistoryScreen.tsx       # Historial
│   │   ├── SocialFeedScreen.tsx    # Social
│   │   ├── FriendsScreenNew.tsx    # Amigos
│   │   └── ProfileScreenNew.tsx    # Perfil
│   ├── contexts/
│   │   ├── VenueContext.tsx        # Venues (actualizado)
│   │   ├── ToastContext.tsx        # Notificaciones (existente)
│   │   └── LanguageContext.tsx     # Idiomas (nuevo)
│   ├── navigation/
│   │   └── AppNavigatorNew.tsx     # Navegación (reemplazar)
│   ├── types/
│   │   └── database.types.ts       # Tipos (actualizado)
│   └── lib/
│       └── supabase.ts             # Configuración Supabase
└── MIGRACION_COMPLETA.md           # Documentación completa
```

---

## ✅ Checklist Final

- [ ] Reemplazaste App.tsx
- [ ] Reemplazaste AppNavigator.tsx
- [ ] Renombraste las pantallas nuevas
- [ ] Instalaste dependencias (`npm install`)
- [ ] Verificaste .env
- [ ] Ejecutaste `npm run android` o `npm start`
- [ ] Probaste login
- [ ] Probaste búsqueda
- [ ] Probaste favoritos
- [ ] Probaste social

---

## 🎉 ¡Listo!

Tu aplicación WhereTonight está completamente migrada a React Native + Expo con todas las funcionalidades del proyecto web.

**Próximos pasos:**
1. Prueba todas las funcionalidades
2. Personaliza según necesites
3. Compila para iOS/Android
4. Publica en stores

---

**¿Necesitas ayuda?** Revisa `MIGRACION_COMPLETA.md` o `CAMBIOS_REALIZADOS.md`
