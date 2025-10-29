# 📍 UBICACIÓN EXACTA EN LA INTERFAZ

## 🎯 Dónde Ver Sistema de Puntos y QR Scanner

### 📱 PANTALLA: PERFIL (Pestaña con icono de usuario)

```
┌─────────────────────────────────────────┐
│  🔙 WhereTonight                     ⚙️ │
├─────────────────────────────────────────┤
│                                         │
│           [Foto de Perfil]              │
│                                         │
│         👤 Tu Nombre Usuario            │
│         Erasmus en Varsovia 🍻          │
│                                         │
│         ✏️ [Botón editar perfil]        │
│                                         │
├─────────────────────────────────────────┤
│  ⭐ SISTEMA DE PUNTOS ⭐                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ ⭐ 0        │  │ 📈 1        │   │  <--- AQUÍ ESTÁN
│  │ Puntos      │  │ Nivel       │   │  <--- LOS PUNTOS
│  └──────────────┘  └──────────────┘   │  <--- Y NIVEL
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  🔳 Escanear Código QR         │  │  <--- AQUÍ ESTÁ
│  └─────────────────────────────────┘  │  <--- EL BOTÓN QR
│                                         │
├─────────────────────────────────────────┤
│  👥 AMIGOS                              │
│  ┌─────────────────────────────────┐  │
│  │  ➕ Añadir Amigo                │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔍 Cómo Encontrarlos

### Paso 1: Ir a Perfil
1. Abrir la app (http://localhost:3000)
2. Iniciar sesión
3. Click en la pestaña **"Perfil"** (icono 👤) en la barra inferior

### Paso 2: Buscar la sección
**Scroll hacia abajo** después de tu foto y nombre

Verás en este orden:
1. ✅ Tu foto de perfil
2. ✅ Tu nombre y biografía
3. ✅ Botón de editar perfil
4. ✅ **LÍNEA SEPARADORA** ← después de esta línea...
5. ✅ **DOS CARDS AMARILLAS/NARANJAS** ← ⭐ PUNTOS Y NIVEL AQUÍ
6. ✅ **BOTÓN PÚRPURA** ← 🔳 QR SCANNER AQUÍ

---

## 🎨 Aspecto Visual

### Card de Puntos:
```
┌─────────────────────┐
│ ⭐ 0               │  <- Fondo amarillo/naranja degradado
│ Puntos             │  <- Borde amarillo
└─────────────────────┘
```

### Card de Nivel:
```
┌─────────────────────┐
│ 📈 1               │  <- Fondo naranja/rojo degradado
│ Nivel              │  <- Borde naranja
└─────────────────────┘
```

### Botón QR:
```
┌──────────────────────────────┐
│  🔳 Escanear Código QR      │  <- Fondo púrpura/rosa degradado
└──────────────────────────────┘  <- Borde púrpura
```

---

## ⚠️ Si NO Los Ves

### Problema 1: No aparecen
**Posible causa:** Proyecto no actualizado

**Solución:**
```bash
# Detener el servidor (Ctrl+C)
cd c:\Users\guill\Desktop\WhereTonight
npm run dev
```

### Problema 2: Aparecen pero puntos = 0
**Es NORMAL** ✅
- Los puntos empiezan en 0
- Debes GANAR puntos haciendo acciones

### Problema 3: Error en consola
Abre DevTools (F12) y envíame el error exacto

---

## 🎮 Cómo Probar Que Funcionan

### Probar Sistema de Puntos:

**ANTES:**
```
┌─────────────────┐
│ ⭐ 0           │  <- Puntos iniciales
└─────────────────┘
```

**ACCIONES:**
1. Ir al Mapa (pestaña 🗺️)
2. Click en un local
3. Click en ⭐ (guardar favorito)
4. Verás toast: "¡+5 puntos! ⭐"

**DESPUÉS:**
```
┌─────────────────┐
│ ⭐ 5           │  <- ¡Aumentó!
└─────────────────┘
```

### Probar QR Scanner:

1. Click en botón "🔳 Escanear Código QR"
2. Se abre pantalla negra
3. Permitir acceso a cámara
4. Verás video de tu cámara
5. Click en "🧪 Probar Escáner (Demo)"
6. Verás toast con código

---

## 📸 Ubicación en el Código

**Archivo:** `src/components/ProfileScreen.tsx`

**Líneas 300-330:**
```typescript
{/* Points and QR Section */}
<div className="border-t border-neon-blue/20 pt-6 mt-6">
  <div className="grid grid-cols-2 gap-3 mb-4">
    {/* Puntos Card */}
    <div className="bg-gradient-to-br from-yellow-500/10...">
      <Star className="w-5 h-5 text-yellow-400 fill-current" />
      <span>{points}</span>  ← AQUÍ SE MUESTRA
      <p>Puntos</p>
    </div>

    {/* Nivel Card */}
    <div className="bg-gradient-to-br from-orange-500/10...">
      <TrendingUp className="w-5 h-5 text-orange-400" />
      <span>{level}</span>  ← AQUÍ SE MUESTRA
      <p>Nivel</p>
    </div>
  </div>

  {/* QR Scanner Button */}
  <button onClick={() => setShowQRScanner(true)}>
    <QrCode className="w-5 h-5 text-purple-400" />
    <span>Escanear Código QR</span>  ← AQUÍ ESTÁ EL BOTÓN
  </button>
</div>
```

---

## 🐛 Debug: ¿Por qué no aparecen?

### Verificación 1: ¿Estás en ProfileScreen?
- La barra inferior debe mostrar **4 pestañas**
- La pestaña de Perfil (👤) debe estar **activa/resaltada**

### Verificación 2: ¿Hiciste scroll?
- Los elementos están **DEBAJO** de la foto de perfil
- Necesitas hacer **scroll hacia abajo**

### Verificación 3: ¿Proyecto correcto?
```bash
# Asegúrate de estar en el proyecto correcto
pwd  # Debe mostrar: .../WhereTonight o .../PruebaApp
```

### Verificación 4: ¿Cambios guardados?
- Todos los archivos deben estar guardados (sin •)
- El servidor debe haber recargado automáticamente

---

## 📊 Estado Esperado

### Al Iniciar Sesión:
```
Puntos: 0
Nivel: 1
QR Button: Visible
```

### Después de Guardar 1 Local:
```
Puntos: 5
Nivel: 1
Toast: "¡+5 puntos! ⭐"
```

### Después de Compartir 1 Local:
```
Puntos: 10
Nivel: 1
Toast: "¡+5 puntos! ⭐"
```

---

## 🆘 Necesitas Ayuda?

**Si siguen sin aparecer:**

1. **Toma screenshot** de la pantalla de Perfil
2. **Abre DevTools** (F12) → Pestaña Console
3. **Copia cualquier error** que aparezca en rojo
4. **Envíame:**
   - Screenshot
   - Errores de consola
   - Qué proyecto estás usando (WhereTonight o PruebaApp)

---

**Ubicación Confirmada:** ✅  
**Líneas de Código:** 300-330 de ProfileScreen.tsx  
**Funcionan:** ✅ (si están en el código)
