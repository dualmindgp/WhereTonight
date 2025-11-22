# 🎯 ESTRATEGIA DE INCENTIVOS - WhereTonight

**Fecha:** Noviembre 2025  
**Objetivo:** Resolver el problema de incentivos para aumentar registros y engagement  
**Estado:** Sistema completo implementado ✅

---

## 📊 ANÁLISIS DEL PROBLEMA

### **Situación Actual:**
- ❌ Bajo incentivo para registrarse en la app
- ❌ Pocos usuarios comparten historias
- ❌ Falta de viralidad orgánica
- ❌ No hay motivación para engagement diario
- ❌ Retención limitada después del primer uso

### **Root Cause:**
La app ofrece valor (descubrir venues, comprar tickets) pero **no recompensa suficientemente** las acciones que generan valor para la comunidad (registros, contenido, invitaciones).

---

## 💡 SOLUCIÓN: SISTEMA DE INCENTIVOS 360°

Hemos implementado un sistema completo de gamificación con **4 pilares fundamentales**:

### **1. 🎁 Sistema de Referidos Viral**
### **2. ⭐ Badges y Logros Progresivos**
### **3. 🔥 Streaks y Engagement Diario**
### **4. 📸 Recompensas por Contenido**

---

## 🎁 1. SISTEMA DE REFERIDOS VIRAL

### **Concepto:**
Cada usuario obtiene un **código único de invitación** que puede compartir. Tanto el referrer como el referido ganan puntos.

### **Mecánica de Recompensas:**

#### **Para el Referido (quien se registra):**
- ✅ **Al registrarse:** +50 puntos inmediatos
- 🎉 Mensaje de bienvenida destacado
- 🎁 Bonificación visible desde el primer momento

#### **Para el Referrer (quien invita):**
- ✅ **El amigo se registra:** +50 puntos base
- ✅ **El amigo completa perfil:** +50 puntos
- ✅ **El amigo publica primera historia:** +75 puntos
- ✅ **El amigo compra primer ticket:** +100 puntos
- 🏆 **TOTAL POSIBLE:** 275 puntos por amigo activo

### **Badges de Referido:**
- 🥉 **Reclutador:** 1 amigo (+50 pts)
- 🥈 **Cazatalentos:** 5 amigos (+200 pts)
- 🥇 **Embajador:** 20 amigos (+1000 pts)

### **UI Implementada:**
```typescript
// Componente: ReferralCard.tsx
- Código grande y destacado
- Botón copiar + compartir
- Estadísticas en tiempo real
- Breakdown de recompensas
```

### **Viralidad Esperada:**
Con estas recompensas, cada usuario tiene **incentivo económico** para invitar amigos:
- 10 amigos activos = **2,750 puntos**
- 20 amigos activos = **5,500 puntos**

---

## ⭐ 2. BADGES Y LOGROS PROGRESIVOS

### **Categorías de Badges:**

#### **📸 Social (Creación de Contenido):**
| Badge | Condición | Rareza | Puntos |
|-------|-----------|--------|--------|
| Primera Historia | 1 historia | Common | +20 |
| Cuentacuentos | 10 historias | Rare | +50 |
| Influencer | 50 historias | Epic | +200 |
| Viral | 100 historias | Legendary | +500 |

#### **🗺️ Explorer (Descubrimiento):**
| Badge | Condición | Rareza | Puntos |
|-------|-----------|--------|--------|
| Ave Nocturna | 5 venues | Common | +30 |
| Explorador Urbano | 20 venues | Rare | +100 |
| Experto Nocturno | 50 venues | Epic | +250 |

#### **🔥 Loyalty (Fidelidad):**
| Badge | Condición | Rareza | Puntos |
|-------|-----------|--------|--------|
| Guerrero Semanal | 7 días racha | Rare | +75 |
| Maestro Mensual | 30 días racha | Epic | +300 |
| Dedicado | 100 días racha | Legendary | +1000 |

#### **🎁 Referral (Invitaciones):**
Ya descritos arriba (Reclutador, Cazatalentos, Embajador)

#### **💎 Premium (Exclusivos):**
| Badge | Condición | Rareza | Puntos |
|-------|-----------|--------|--------|
| Early Adopter | Primeros 100 users | Legendary | +500 |
| VIP | Miembro premium | Epic | 0 |

### **Sistema de Rareza:**
- **Common:** Gris - Fácil de obtener
- **Rare:** Azul - Requiere esfuerzo
- **Epic:** Morado - Muy difícil
- **Legendary:** Dorado - Elite

### **UI Implementada:**
```typescript
// Componente: BadgesShowcase.tsx
- Vista completa con progreso
- Filtros (todos/desbloqueados/bloqueados)
- Barra de progreso general
- Cards animados por rareza
- Vista compacta para perfil
```

---

## 🔥 3. STREAKS Y ENGAGEMENT DIARIO

### **Tipos de Streaks:**

#### **Login Diario:**
- +2 puntos por día
- Bonus +50 pts a los 7 días
- Bonus +200 pts a los 30 días
- Bonus +1000 pts a los 100 días

#### **Historias Diarias:**
- Racha de compartir historias
- Tracking independiente
- Bonus progresivos

#### **Tickets Semanales:**
- Racha de usar tickets
- Incentivo a salir regularmente

### **Implementación Técnica:**
```sql
-- Tabla: user_streaks
-- Función: update_login_streak()
-- Se actualiza automáticamente cada login
```

---

## 📸 4. RECOMPENSAS POR CONTENIDO

### **Puntos por Historias:**

| Acción | Puntos | Descripción |
|--------|--------|-------------|
| Historia básica | +15 | Post de texto simple |
| Primera historia | +30 | Bonus one-time |
| Historia con foto | +20 | Más engagement |
| Historia en venue | +25 | Genera tráfico al venue |

### **Estrategia:**
Las historias generan **valor para la plataforma**:
- ✅ Contenido para otros usuarios
- ✅ Publicidad orgánica para venues
- ✅ Prueba social ("mis amigos están aquí")
- ✅ FOMO en otros usuarios

**Por eso se recompensa generosamente.**

### **Puntos por Interacción Social:**

| Acción | Puntos |
|--------|--------|
| Agregar amigo | +10 |
| Like a post | +2 |
| Comentar post | +5 |

---

## 📈 TABLA COMPLETA DE ACCIONES Y PUNTOS

### **Acciones Básicas:**
```
✓ Login diario: +2 pts
✓ Perfil completado: +20 pts
✓ Venue guardado: +5 pts
✓ Venue compartido: +5 pts
✓ Ticket usado: +10 pts
```

### **Contenido y Social:**
```
✓ Historia creada: +15 pts
✓ Primera historia: +30 pts (bonus)
✓ Historia con foto: +20 pts
✓ Historia en venue: +25 pts
✓ Amigo agregado: +10 pts
✓ Like dado: +2 pts
✓ Comentario: +5 pts
```

### **Referidos:**
```
✓ Registro con tu código: +50 pts (tú y tu amigo)
✓ Amigo completa perfil: +50 pts (solo tú)
✓ Amigo primera historia: +75 pts (solo tú)
✓ Amigo primer ticket: +100 pts (solo tú)
```

### **Logros:**
```
✓ Primer ticket usado: +50 pts
✓ Racha 7 días: +100 pts
✓ Racha 30 días: +200 pts
✓ Badge desbloqueado: +50-500 pts (según rareza)
✓ Challenge completado: +100+ pts
```

---

## 🎯 CHALLENGES (RETOS)

Sistema implementado en la base de datos, listo para activar:

### **Tipos de Challenges:**

#### **Daily Challenge:**
```
Título: "Historia del Día"
Objetivo: Comparte 1 historia hoy
Recompensa: +10 pts
```

#### **Weekly Challenge:**
```
Título: "Fiestero Semanal"
Objetivo: Usa 3 tickets esta semana
Recompensa: +100 pts
```

#### **Monthly Challenge:**
```
Título: "Trae a tus Amigos"
Objetivo: Invita a 3 amigos este mes
Recompensa: +300 pts + 7 días premium gratis
```

### **Tabla de Progreso:**
Los usuarios pueden ver su progreso en tiempo real:
- Barra de progreso visual
- Contador actual vs objetivo
- Tiempo restante
- Recompensa destacada

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### **PASO 1: Migrar Base de Datos**

```bash
# Ejecutar en Supabase SQL Editor:
# 1. incentives-system-migration.sql
```

Esto creará:
- ✅ Tablas de referidos
- ✅ Tablas de badges
- ✅ Tablas de challenges
- ✅ Tablas de streaks
- ✅ Funciones automáticas
- ✅ Triggers de auto-generación de códigos

### **PASO 2: Actualizar Código del Cliente**

#### **A. Integrar al Registro:**

```typescript
// En tu componente de registro/signup
import { applyReferralCode } from '@/lib/referral-system'

// Después de que el usuario se registre:
if (referralCodeFromUrl) {
  const result = await applyReferralCode(userId, referralCodeFromUrl)
  if (result.success) {
    // Mostrar notificación: "¡50 puntos de bienvenida!"
  }
}
```

#### **B. Integrar al Crear Historias:**

```typescript
// En tu componente de crear historia/post
import { addPoints, PointAction } from '@/lib/points-system'
import { rewardReferrerMilestone } from '@/lib/referral-system'
import { checkAndUnlockBadges } from '@/lib/badge-system'

// Después de crear la historia:
const hasPhoto = story.image_url !== null
const hasVenue = story.venue_id !== null

// Puntos base
await addPoints(userId, PointAction.STORY_CREATED)

// Bonos
if (hasPhoto) {
  await addPoints(userId, PointAction.STORY_WITH_PHOTO)
}
if (hasVenue) {
  await addPoints(userId, PointAction.STORY_WITH_VENUE)
}

// Primera historia?
const isFirstStory = await checkIfFirstStory(userId)
if (isFirstStory) {
  await addPoints(userId, PointAction.FIRST_STORY)
  await rewardReferrerMilestone(userId, 'first_story')
}

// Verificar badges desbloqueados
const newBadges = await checkAndUnlockBadges(userId)
if (newBadges.length > 0) {
  // Mostrar notificación de badges
}
```

#### **C. Integrar al Login:**

```typescript
// En tu componente de login/auth
import { supabase } from '@/lib/supabase'

// Después del login exitoso:
const { data } = await supabase.rpc('update_login_streak', {
  p_user_id: userId
})

// Retorna la racha actual
const streak = data
if (streak === 7 || streak === 30 || streak === 100) {
  // Mostrar notificación de milestone
}
```

#### **D. Mostrar en Perfil:**

```typescript
// En tu pantalla de perfil
import ReferralCard from '@/components/ReferralCard'
import BadgesShowcase from '@/components/BadgesShowcase'
import PointsBadge from '@/components/PointsBadge'

<PointsBadge userId={userId} />
<ReferralCard userId={userId} />
<BadgesShowcase userId={userId} variant="compact" />
```

### **PASO 3: Deep Links para Invitaciones**

```typescript
// Crear página: /invite/[code]/page.tsx
// Al cargar, verificar código y guardarlo en localStorage
// Al registrarse, aplicar el código automáticamente
```

---

## 📊 MÉTRICAS DE ÉXITO

### **KPIs a Trackear:**

#### **Registros:**
- **Baseline:** X usuarios/día
- **Target 30 días:** +100% registros
- **Métrica:** % de registros con código de referido

#### **Contenido:**
- **Baseline:** Y historias/día
- **Target 30 días:** +200% historias
- **Métrica:** Historias por usuario activo

#### **Retención:**
- **Baseline:** Z% D7 retention
- **Target 30 días:** +50% retention
- **Métrica:** % usuarios con racha >7 días

#### **Viralidad:**
- **K-Factor Target:** >1.0 (cada usuario invita >1 amigo)
- **Métrica:** Promedio de referidos por usuario activo

---

## 💰 ECONOMÍA DE PUNTOS

### **Generación de Puntos (Input):**

**Usuario Super Activo (por semana):**
```
Login diario x7:           +14 pts
Historias x7:              +105 pts (15 x 7)
Tickets x2:                +20 pts
Invitar 1 amigo activo:    +275 pts
Badges desbloqueados:      +100 pts
TOTAL SEMANAL:             ~514 pts
```

**Usuario Medio (por semana):**
```
Login x5:                  +10 pts
Historias x2:              +30 pts
Tickets x1:                +10 pts
Interacciones sociales:    +20 pts
TOTAL SEMANAL:             ~70 pts
```

### **Uso de Puntos (Output):**

**Ideas para Canjear Puntos:**
```
500 pts  = 1 ticket gratis
1000 pts = 1 semana premium
2000 pts = Descuento 20% en ticket
5000 pts = Evento VIP exclusivo
```

### **Equilibrio:**
- Usuario medio: 70 pts/semana = 280 pts/mes
- Ticket gratis: 500 pts = ~2 meses
- **Ratio:** Justo para mantener engagement sin devaluar puntos

---

## 🎨 EXPERIENCIA DE USUARIO

### **Onboarding con Código de Referido:**

```
1. Usuario recibe link: wheretonight.app/invite/GUILLE2024
2. Landing page especial: "Guillermo te invita" + "Gana 50 puntos"
3. Registro simplificado
4. ¡Bienvenida con confetti!
5. Notificación: "Has ganado 50 puntos 🎉"
6. Tutorial rápido de la app
7. Prompt: "Invita a tus amigos y gana más puntos"
```

### **Primera Historia:**

```
1. Usuario crea su primera historia
2. Animación de puntos: +15 pts (base)
3. Badge desbloqueado: "Primera Historia" +20 pts
4. Si fue referido: "Tu amigo ganó 75 puntos por invitarte"
5. Progreso visible hacia próximo badge
```

### **Notificaciones Push:**

```
Día 6 de racha:
"¡6 días seguidos! Mañana ganas bonus de 50 pts 🔥"

Amigo usa tu código:
"¡María se registró con tu código! +50 pts 🎁"

Badge próximo:
"Solo 3 historias más para ser Cuentacuentos 📸"
```

---

## 🔄 BUCLE DE ENGAGEMENT

### **Ciclo Virtuoso:**

```
1. Usuario se registra (código de amigo) → +50 pts
2. Completa perfil → +20 pts
3. Ve notificación de "Crea tu primera historia"
4. Publica historia → +45 pts (base + bonus + badge)
5. Su amigo gana +75 pts → Le agradece → Más engagement
6. Usuario ve progreso hacia "Cuentacuentos" → Motivación
7. Comparte más historias
8. Desbloquea badge → +50 pts
9. Ve código de referido con stats
10. Invita a amigos para ganar más puntos
11. LOOP CONTINUES
```

---

## ⚠️ CONSIDERACIONES ANTI-SPAM

### **Límites Implementados:**

#### **Rate Limiting:**
- Máximo 10 historias por día
- Máximo 20 likes por hora
- Cooldown de 30 segundos entre historias

#### **Validaciones:**
- No self-referral (no puedes usar tu propio código)
- Código de referido solo válido al registro
- Verificación de dispositivo único
- Ban por comportamiento sospechoso

#### **Moderación:**
- Sistema de reportes
- Filtro de palabras prohibidas
- Revisión de cuentas con muchos referidos (>50)

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN

### **Semana 1: Setup Básico**
- [x] Migración de BD
- [x] Sistema de referidos
- [x] Sistema de puntos expandido
- [ ] Integrar en registro
- [ ] Integrar en creación de historias

### **Semana 2: Gamificación**
- [x] Sistema de badges
- [x] UI de badges
- [ ] Integrar verificación automática
- [ ] Sistema de notificaciones

### **Semana 3: Deep Links y Sharing**
- [ ] Página /invite/[code]
- [ ] Deep links mobile (Capacitor)
- [ ] Share sheet nativo
- [ ] Landing page optimizada

### **Semana 4: Challenges y Polish**
- [ ] Sistema de challenges activo
- [ ] UI de challenges
- [ ] Notificaciones push
- [ ] Analytics y tracking

---

## 🚀 QUICK START

### **Para empezar HOY:**

```bash
# 1. Migrar base de datos
# Ejecutar en Supabase:
database/incentives-system-migration.sql

# 2. Verificar instalación
SELECT COUNT(*) FROM badges; -- Debe ser ~15
SELECT COUNT(*) FROM challenges; -- Debe ser 3

# 3. Probar código de referido
# En tu código, después de registro:
import { getUserReferralCode } from '@/lib/referral-system'
const code = await getUserReferralCode(userId)
console.log('Tu código:', code.code)

# 4. Agregar puntos manualmente para testear
import { addPoints, PointAction } from '@/lib/points-system'
await addPoints(userId, PointAction.STORY_CREATED)
```

---

## 📞 RESUMEN EJECUTIVO

### **Problema:**
No hay suficiente motivación para que usuarios:
1. Se registren
2. Creen contenido
3. Inviten amigos

### **Solución:**
Sistema de incentivos de 4 capas:
1. **Referidos virales** (hasta 275 pts por amigo)
2. **Badges progresivos** (15 logros gamificados)
3. **Streaks diarios** (bonos exponenciales)
4. **Recompensas por contenido** (historias = puntos)

### **Resultados Esperados (90 días):**
- ✅ +100% en registros (viralidad orgánica)
- ✅ +200% en historias compartidas
- ✅ +50% en retención D7
- ✅ K-Factor >1.0 (crecimiento exponencial)

### **Inversión:**
- ⏱️ 2 semanas de desarrollo
- 💰 $0 en incentivos monetarios (solo puntos virtuales)
- 🎁 Opción de canjear puntos por tickets (costo marginal)

---

## 📚 ARCHIVOS CREADOS

### **Base de Datos:**
```
database/incentives-system-migration.sql
```

### **Lógica de Negocio:**
```
src/lib/referral-system.ts
src/lib/badge-system.ts
src/lib/points-system.ts (actualizado)
```

### **Componentes UI:**
```
src/components/ReferralCard.tsx
src/components/BadgesShowcase.tsx
src/components/PointsRewardNotification.tsx
src/components/PointsBadge.tsx (ya existía)
```

---

## 🎉 CONCLUSIÓN

Has creado un **sistema de incentivos clase mundial** que:

✅ Resuelve el problema de adquisición (referidos virales)  
✅ Aumenta el engagement (badges, streaks, recompensas)  
✅ Retiene usuarios (gamificación progresiva)  
✅ Genera contenido (puntos por historias)  
✅ Es escalable (todo automatizado)  
✅ Es medible (métricas claras)

**El sistema está listo para implementar. Solo falta integrar los componentes en tu app existente.**

---

**¿Listo para crecer exponencialmente?** 🚀

_Implementa el sistema, trackea las métricas, y ajusta las recompensas según los datos reales._
