# 📋 Instalación Paso a Paso

## Fase 1: Preparación (2 minutos)

### Paso 1.1: Abre la terminal en el proyecto
```bash
cd c:\Users\pelay\OneDrive\Escritorio\WhereTonight\WhereTonight-Mobile
```

### Paso 1.2: Verifica que tienes Node.js
```bash
node --version  # Debe ser v16 o superior
npm --version   # Debe ser v8 o superior
```

---

## Fase 2: Reemplazar Archivos (1 minuto)

### Paso 2.1: Reemplazar App.tsx
```bash
# Windows
copy AppNew.tsx App.tsx

# Mac/Linux
cp AppNew.tsx App.tsx
```

### Paso 2.2: Reemplazar AppNavigator.tsx
```bash
# Windows
copy src\navigation\AppNavigatorNew.tsx src\navigation\AppNavigator.tsx

# Mac/Linux
cp src/navigation/AppNavigatorNew.tsx src/navigation/AppNavigator.tsx
```

---

## Fase 3: Renombrar Pantallas (1 minuto)

### Paso 3.1: Renombrar FavoritesScreen
```bash
# Windows
ren src\screens\FavoritesScreenNew.tsx FavoritesScreen.tsx

# Mac/Linux
mv src/screens/FavoritesScreenNew.tsx src/screens/FavoritesScreen.tsx
```

### Paso 3.2: Renombrar FriendsScreen
```bash
# Windows
ren src\screens\FriendsScreenNew.tsx FriendsScreen.tsx

# Mac/Linux
mv src/screens/FriendsScreenNew.tsx src/screens/FriendsScreen.tsx
```

### Paso 3.3: Renombrar ProfileScreen
```bash
# Windows
ren src\screens\ProfileScreenNew.tsx ProfileScreen.tsx

# Mac/Linux
mv src/screens/ProfileScreenNew.tsx src/screens/ProfileScreen.tsx
```

---

## Fase 4: Instalar Dependencias (3 minutos)

### Paso 4.1: Instalar paquetes
```bash
npm install
```

### Paso 4.2: Esperar a que termine
Esto puede tomar 2-3 minutos. No interrumpas el proceso.

---

## Fase 5: Verificar Configuración (1 minuto)

### Paso 5.1: Verificar .env
Abre el archivo `.env` y verifica que tenga:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Si no están, cópialas de tu proyecto Supabase.

### Paso 5.2: Verificar package.json
Verifica que tenga estos scripts:
```json
"scripts": {
  "android": "expo start --android",
  "ios": "expo start --ios",
  "start": "expo start"
}
```

---

## Fase 6: Ejecutar la App (2 minutos)

### Opción A: En Emulador Android
```bash
npm run android
```

Esto:
1. Inicia Metro Bundler
2. Compila la app
3. Abre en el emulador Android

### Opción B: Con Expo Go (Teléfono Real)
```bash
npm start
```

Luego:
1. Escanea el QR con Expo Go
2. La app se abre en tu teléfono

### Opción C: En Emulador iOS (Mac solo)
```bash
npm run ios
```

---

## Fase 7: Verificar que Funciona (5 minutos)

### Checklist de Verificación

- [ ] **Pantalla de Login aparece**
  - Si no aparece, verifica que AuthScreen.tsx existe

- [ ] **Puedo hacer login**
  - Usa email: test@example.com
  - Contraseña: password123
  - Si falla, verifica Supabase está configurado

- [ ] **Aparece el mapa**
  - Después de login, deberías ver el mapa

- [ ] **Puedo buscar locales**
  - Toca el tab "Buscar"
  - Escribe un nombre de local
  - Deberían aparecer resultados

- [ ] **Puedo ver favoritos**
  - Toca el tab "Perfil"
  - Toca "Mis Favoritos"
  - Deberían aparecer vacío (o tus favoritos si existen)

- [ ] **Puedo ver social**
  - Toca el tab "Social"
  - Deberías ver posts de la comunidad

- [ ] **Las notificaciones funcionan**
  - Intenta guardar un favorito
  - Deberías ver un toast verde diciendo "Guardado"

---

## 🐛 Solución de Problemas

### Problema: "Metro Bundler no inicia"
**Solución:**
```bash
# Limpia caché
npm start -- --reset-cache

# Si sigue fallando
npm install
npm start
```

### Problema: "Error: Cannot find module '@react-navigation/native'"
**Solución:**
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### Problema: "Supabase URL and Anon Key must be provided"
**Solución:**
1. Abre `.env`
2. Verifica que tenga las variables
3. Reinicia: `npm start -- --reset-cache`

### Problema: "Cannot find module 'LanguageContext'"
**Solución:**
1. Verifica que `src/contexts/LanguageContext.tsx` existe
2. Verifica que está importado en `App.tsx`
3. Reinicia: `npm start`

### Problema: "Emulador no abre"
**Solución:**
```bash
# Verifica que el emulador está corriendo
adb devices

# Si no aparece, abre Android Studio y abre un emulador manualmente
# Luego ejecuta:
npm run android
```

### Problema: "La app se congela"
**Solución:**
```bash
# Limpia todo y reinicia
npm install
npm start -- --reset-cache
```

---

## ✅ Verificación Final

Cuando todo esté funcionando, deberías ver:

1. **Pantalla de Login**
   - Campos de email y contraseña
   - Botón "Iniciar Sesión"

2. **Después de Login - Mapa**
   - Mapa interactivo
   - Marcadores de locales
   - Bottom tabs: Inicio, Buscar, Social, Perfil

3. **Tab Buscar**
   - Campo de búsqueda
   - Filtros (precio, rating, ordenamiento)
   - Lista de locales

4. **Tab Social**
   - Selector de ciudad
   - Botón para crear post
   - Feed de posts

5. **Tab Perfil**
   - Avatar y nombre
   - Botones: Mis Favoritos, Historial, Amigos
   - Botón Cerrar Sesión

---

## 🎉 ¡Éxito!

Si ves todo esto, la migración fue exitosa. 

**Próximos pasos:**
1. Prueba todas las funcionalidades
2. Personaliza según necesites
3. Compila para producción
4. Publica en stores

---

## 📞 Ayuda Rápida

| Problema | Solución |
|---|---|
| App no inicia | `npm install && npm start -- --reset-cache` |
| Error de Supabase | Verifica `.env` |
| Error de módulos | `npm install` |
| Emulador no funciona | Abre Android Studio manualmente |
| App se congela | Reinicia: `npm start` |

---

**¿Necesitas más ayuda?** Revisa `MIGRACION_COMPLETA.md` o `GUIA_RAPIDA.md`
