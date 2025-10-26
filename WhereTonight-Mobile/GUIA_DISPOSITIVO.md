# 📱 Guía - Conectar Dispositivo o Emulador

## 🚀 Opción 1: Usar Expo Go (MÁS RÁPIDO - 2 minutos)

### En tu computadora:
```bash
npm start
```

### En tu teléfono (iPhone o Android):
1. Descarga la app **"Expo Go"** desde App Store o Google Play
2. Abre la app
3. Escanea el código QR que aparece en la terminal
4. ¡La app se cargará automáticamente!

**Ventajas:**
- ✅ Más rápido
- ✅ No necesita emulador
- ✅ Cambios se reflejan al guardar (Hot Reload)
- ✅ Funciona en cualquier dispositivo

---

## 🤖 Opción 2: Emulador Android (Recomendado para Testing)

### Paso 1: Instalar Android Studio
1. Descarga desde: https://developer.android.com/studio
2. Instala siguiendo las instrucciones

### Paso 2: Crear Emulador
1. Abre Android Studio
2. Ve a: **Tools → Device Manager**
3. Haz clic en **"Create Device"**
4. Selecciona un dispositivo (ej: Pixel 6)
5. Selecciona una versión de Android (ej: Android 14)
6. Haz clic en **"Finish"**

### Paso 3: Iniciar Emulador
1. En Device Manager, haz clic en el botón **Play** ▶️
2. Espera a que el emulador inicie (2-3 minutos)

### Paso 4: Ejecutar la App
```bash
npm run android
```

**Ventajas:**
- ✅ Testing completo
- ✅ Simula dispositivo real
- ✅ Acceso a todas las APIs

---

## 📱 Opción 3: Dispositivo Android Físico

### Paso 1: Habilitar Depuración USB
1. En tu teléfono Android, ve a **Configuración**
2. Busca **"Número de compilación"** (generalmente en "Acerca de")
3. Toca 7 veces hasta que aparezca "Eres desarrollador"
4. Ve a **Configuración → Opciones de desarrollador**
5. Activa **"Depuración USB"**

### Paso 2: Conectar por USB
1. Conecta tu teléfono a la computadora con cable USB
2. Selecciona **"Transferir archivos"** o **"Depuración USB"** en el teléfono
3. Autoriza el acceso en el teléfono

### Paso 3: Verificar Conexión
```bash
adb devices
```

Deberías ver tu dispositivo en la lista.

### Paso 4: Ejecutar la App
```bash
npm run android
```

**Ventajas:**
- ✅ Testing en dispositivo real
- ✅ Mejor rendimiento
- ✅ Acceso a sensores reales

---

## 🍎 Opción 4: iPhone (Si tienes Mac)

### Paso 1: Instalar Xcode
```bash
xcode-select --install
```

### Paso 2: Ejecutar en Simulador
```bash
npm run ios
```

### Paso 3: Conectar Dispositivo (Opcional)
1. Conecta tu iPhone por USB
2. Confía en la computadora
3. Ejecuta: `npm run ios`

---

## ⚠️ Problemas Comunes

### Error: "device offline"
**Solución:**
```bash
# Desconecta y reconecta el dispositivo
# O reinicia ADB:
adb kill-server
adb devices
```

### Error: "No emulators could be started"
**Solución:**
1. Abre Android Studio
2. Crea un emulador en Device Manager
3. Inicia el emulador manualmente
4. Luego ejecuta: `npm run android`

### La app no se carga
**Solución:**
```bash
# Limpia caché y reinicia
npm start -- --clear

# En otra terminal:
npm run android
```

### Puerto 8081 en uso
**Solución:**
```bash
# Usa otro puerto
npm start -- --port 8082
```

---

## 🎯 Recomendación para Ti

**Dado que estás en Windows:**

### Opción A (Más Rápido - Recomendado):
```bash
npm start
# Escanea QR con Expo Go en tu teléfono
```

### Opción B (Si tienes tiempo):
1. Instala Android Studio
2. Crea un emulador
3. Ejecuta: `npm run android`

---

## 📋 Checklist

- [ ] Descargué Expo Go (Opción 1)
- [ ] O instalé Android Studio (Opción 2)
- [ ] O conecté dispositivo físico (Opción 3)
- [ ] Ejecuté `npm start` o `npm run android`
- [ ] La app se cargó correctamente

---

## 🔧 Comandos Útiles

```bash
# Ver dispositivos conectados
adb devices

# Reiniciar ADB
adb kill-server
adb devices

# Ver logs en tiempo real
adb logcat

# Limpiar caché de Expo
npm start -- --clear

# Usar puerto diferente
npm start -- --port 8082

# Modo verbose (más información)
npm start -- --verbose
```

---

## 💡 Tips

1. **Desarrollo Rápido**: Usa Expo Go + `npm start`
2. **Testing Completo**: Usa emulador Android
3. **Dispositivo Real**: Conecta por USB
4. **Hot Reload**: Los cambios se reflejan automáticamente
5. **Debugging**: Presiona `d` en la terminal para abrir DevTools

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el dispositivo/emulador esté conectado
2. Ejecuta: `adb devices`
3. Reinicia: `adb kill-server && adb devices`
4. Limpia caché: `npm start -- --clear`
5. Reinicia la terminal

---

**Generado**: 2025-01-26
**Recomendación**: Usa Expo Go para empezar rápido
