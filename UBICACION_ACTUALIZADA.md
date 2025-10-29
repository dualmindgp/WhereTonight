# ✅ UBICACIÓN ACTUALIZADA - Sistema de Puntos y QR

**Archivo modificado:** `src/components/ProfileScreenV2.tsx`

---

## 📱 UBICACIÓN EXACTA en la Pantalla de Perfil

```
┌────────────────────────────────────────┐
│  [Avatar] u8209214427                  │
│          [Editar]                      │
├────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐            │
│  │ 1       │  │ 1🔥     │            │
│  │ Tickets │  │ Streak  │            │
│  └─────────┘  └─────────┘            │
│  ┌─────────┐  ┌─────────┐            │
│  │ 1       │  │ 1       │            │
│  │ Locales │  │ Amigos  │            │
│  └─────────┘  └─────────┘            │
├────────────────────────────────────────┤
│ ⭐ AQUÍ ESTÁN AHORA ⭐                │
├────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  │
│  │ ⭐ 0        │  │ 📈 1        │  │  ← PUNTOS Y NIVEL
│  │ Puntos      │  │ Nivel       │  │  ← (cards amarillo/naranja)
│  └──────────────┘  └──────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  🔳 Escanear Código QR         │ │  ← BOTÓN QR
│  └─────────────────────────────────┘ │  ← (púrpura/rosa)
│                                       │
├────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐      │
│  │ 📌        │  │ 🕐        │      │
│  │ Favoritos │  │ Historial │      │
│  └────────────┘  └────────────┘      │
│                                       │
│  ⚙️ Ajustes                           │
│  🔗 Invitar amigos                    │
│  🚪 Cerrar sesión                     │
│                                       │
│  👑 WhereTonight PREMIUM              │
└────────────────────────────────────────┘
```

---

## 🎯 Cómo Verlos AHORA

### Paso 1: Reiniciar el servidor
```bash
# Detener el servidor actual (Ctrl+C)
cd c:\Users\guill\Desktop\WhereTonight
npm run dev
```

### Paso 2: Refrescar navegador
- Abrir http://localhost:3000
- Presionar **Ctrl+R** o **F5** para refrescar
- Iniciar sesión

### Paso 3: Ir a Perfil
- Click en la pestaña **"Perfil"** (👤) abajo
- **Scroll hacia abajo** después de los cards de Amigos

### Paso 4: ¡Verlos!
Deberías ver **EN ESTE ORDEN:**
1. ✅ Avatar y nombre
2. ✅ 4 cards: Tickets, Streak, Locales, Amigos
3. ✅ **2 CARDS NUEVAS:** ⭐ Puntos y 📈 Nivel (amarillo/naranja)
4. ✅ **BOTÓN NUEVO:** 🔳 Escanear Código QR (púrpura)
5. ✅ Favoritos e Historial
6. ✅ Menú de opciones

---

## 🧪 Probar Que Funcionan

### Probar Sistema de Puntos:

**1. Ver puntos iniciales:**
- Ir a Perfil
- Scroll hasta ver "⭐ 0 Puntos"
- Verificar "📈 1 Nivel"

**2. Ganar puntos:**
- Ir al Mapa
- Abrir un local
- Click en **bookmark** (⭐) para guardar
- Verás: "¡Guardado en favoritos!" + "¡+5 puntos! ⭐"
- Volver a Perfil
- **Puntos = 5** ✅

**3. Ganar más puntos:**
- Abrir otro local
- Click en **share** (🔗) para compartir
- Verás: "¡+5 puntos! ⭐"
- Volver a Perfil
- **Puntos = 10** ✅

### Probar QR Scanner:

**1. Abrir scanner:**
- Click en "🔳 Escanear Código QR"
- Se abre pantalla negra
- Permitir acceso a cámara

**2. Ver cámara:**
- Deberías ver video de tu cámara
- Marco azul sobre el video

**3. Probar:**
- Click en "🧪 Probar Escáner (Demo)"
- Verás toast: "Código escaneado: WHERETONIGHT-123456789"

---

## 📋 Qué Cambié

### Archivo: `src/components/ProfileScreenV2.tsx`

**Imports agregados:**
```typescript
import { Star, TrendingUp, QrCode } from 'lucide-react'
import QRScanner from './QRScanner'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'
```

**Estados agregados:**
```typescript
const [showQRScanner, setShowQRScanner] = useState(false)
const [points, setPoints] = useState(0)
const [level, setLevel] = useState(1)
```

**En useEffect de stats (líneas 205-212):**
```typescript
// 6. Puntos y nivel
try {
  const totalPoints = await getUserPoints(user.id)
  setPoints(totalPoints)
  setLevel(getLevelFromPoints(totalPoints))
} catch (error) {
  console.error('Error loading points:', error)
}
```

**UI agregada (líneas 348-376):**
- Grid con cards de Puntos y Nivel
- Botón de QR Scanner

**Componente agregado (líneas 472-481):**
```typescript
<QRScanner
  isOpen={showQRScanner}
  onClose={() => setShowQRScanner(false)}
  onScan={(code) => {
    toast.success(`Código escaneado: ${code}`)
    setShowQRScanner(false)
  }}
/>
```

---

## ✅ Checklist Final

Antes de probar:

- [ ] Servidor detenido y reiniciado
- [ ] Navegador refrescado (Ctrl+R)
- [ ] Sesión iniciada
- [ ] En la pestaña Perfil
- [ ] Hice scroll después de los cards de Amigos

Deberías ver:

- [ ] Card amarilla "⭐ 0 Puntos"
- [ ] Card naranja "📈 1 Nivel"
- [ ] Botón púrpura "🔳 Escanear Código QR"

---

## 🆘 Si NO aparecen

1. **Verifica el archivo correcto:**
   ```bash
   # Debe decir "ProfileScreenV2.tsx"
   grep -r "ProfileScreenV2" src/app/page.tsx
   ```

2. **Verifica errores en consola:**
   - Presiona F12
   - Pestaña "Console"
   - Copia cualquier error en rojo

3. **Verifica que guardaste:**
   - Todos los archivos sin • en el nombre
   - El servidor debe haber recargado automáticamente

---

**Fecha:** 29 de octubre 2025, 12:15 PM  
**Estado:** ✅ IMPLEMENTADO en ProfileScreenV2.tsx  
**Ubicación:** Después de cards de Amigos, antes de Favoritos
