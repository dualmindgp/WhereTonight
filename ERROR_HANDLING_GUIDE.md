# 🛡️ Guía de Error Handling y Toast Notifications

Esta guía explica cómo usar el nuevo sistema de error handling y notificaciones implementado en WhereTonight.

---

## 📚 Componentes Disponibles

### 1. **Logger** (`src/lib/logger.ts`)
Sistema centralizado de logging para errores, warnings e info.

### 2. **Toast Notifications** (`src/components/Toast.tsx`)
Sistema de notificaciones temporales para feedback al usuario.

### 3. **Error Boundary** (`src/components/ErrorBoundary.tsx`)
Captura errores de React y previene crasheos de la app.

---

## 🎯 Cómo Usar

### Logger

```typescript
import { logger, withErrorHandling, tryCatch } from '@/lib/logger'

// Registrar un error
try {
  // Código que puede fallar
} catch (error) {
  logger.error('Failed to load venues', error, {
    userId: user?.id,
    timestamp: Date.now()
  })
}

// Registrar warning
logger.warn('API rate limit approaching', { remaining: 10 })

// Registrar info (solo en desarrollo)
logger.info('Component mounted', { componentName: 'VenueList' })

// Track events para analytics
logger.trackEvent('button_click', { 
  buttonId: 'use_ticket',
  venueId: venue.id 
})

// Helper para operaciones async
const venues = await withErrorHandling(
  async () => {
    const { data, error } = await supabase.from('venues').select()
    if (error) throw error
    return data
  },
  'Failed to fetch venues',
  { source: 'VenueList' }
)

// Helper para operaciones síncronas
const result = tryCatch(
  () => JSON.parse(localStorage.getItem('settings')),
  'Failed to parse settings',
  { key: 'settings' }
)
```

---

### Toast Notifications

```typescript
import { useToastContext } from '@/contexts/ToastContext'

function MiComponente() {
  const toast = useToastContext()

  const handleSuccess = () => {
    toast.success('¡Operación exitosa!')
  }

  const handleError = () => {
    toast.error('Algo salió mal', 10000) // 10 segundos
  }

  const handleWarning = () => {
    toast.warning('Ten cuidado con esto')
  }

  const handleInfo = () => {
    toast.info('Información útil')
  }

  // O usar el método genérico
  const handleCustom = () => {
    toast.showToast('Mensaje custom', 'success', 5000)
  }

  return (
    <button onClick={handleSuccess}>
      Mostrar notificación
    </button>
  )
}
```

---

### Error Boundary

**Ya está configurado globalmente** en `layout.tsx`, pero puedes usar múltiples:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary
      fallback={<div>Algo salió mal en esta sección</div>}
      onError={(error, errorInfo) => {
        // Log adicional o reportar a servicio externo
        console.log('Error capturado:', error)
      }}
    >
      <ComponenteQuePuedeFallar />
    </ErrorBoundary>
  )
}
```

---

## 🔄 Ejemplo Completo: Refactorizar Componente

**Antes:**
```typescript
const handleSubmit = async () => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert({ venue_id: venueId, user_id: userId })
    
    if (error) {
      console.error('Error:', error)
      alert('Error al usar ticket')
      return
    }
    
    console.log('Ticket usado!')
  } catch (err) {
    console.error('Error inesperado:', err)
  }
}
```

**Después:**
```typescript
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

const toast = useToastContext()

const handleSubmit = async () => {
  logger.info('User attempting to use ticket', { venueId, userId })
  
  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('tickets')
        .insert({ venue_id: venueId, user_id: userId })
      
      if (error) throw error
      return data
    },
    'Failed to use ticket',
    { venueId, userId }
  )
  
  if (result) {
    toast.success('¡Ticket usado exitosamente!')
    logger.trackEvent('ticket_used', { venueId, userId })
  } else {
    toast.error('No se pudo usar el ticket. Intenta de nuevo.')
  }
}
```

---

## 🎨 Personalizar Toasts

Los toasts tienen 4 tipos con diferentes estilos:

- **success** 🟢 - Verde, para operaciones exitosas
- **error** 🔴 - Rojo, para errores
- **warning** 🟡 - Amarillo, para advertencias
- **info** 🔵 - Azul, para información general

Se cierran automáticamente después de 5 segundos (configurable).

---

## 🚨 Mejores Prácticas

### 1. **Siempre proporciona contexto**
```typescript
// ❌ Mal
logger.error('Error', error)

// ✅ Bien
logger.error('Failed to load user profile', error, {
  userId: user.id,
  action: 'profile_load',
  timestamp: Date.now()
})
```

### 2. **Usa toasts para feedback del usuario**
```typescript
// ❌ Mal - el usuario no sabe qué pasó
await deleteVenue(id)

// ✅ Bien - feedback claro
const success = await deleteVenue(id)
if (success) {
  toast.success('Local eliminado correctamente')
} else {
  toast.error('No se pudo eliminar el local')
}
```

### 3. **No abuses de los toasts**
```typescript
// ❌ Mal - demasiados toasts
toast.info('Cargando...')
await loadData()
toast.success('Datos cargados')

// ✅ Bien - solo notificar acciones importantes
await loadData()
// Solo notificar si hay error
```

### 4. **Usa Error Boundaries para componentes críticos**
```typescript
// ✅ Proteger componentes complejos
<ErrorBoundary>
  <ComplexMapComponent />
</ErrorBoundary>
```

### 5. **Track eventos importantes**
```typescript
logger.trackEvent('page_view', { page: 'profile' })
logger.trackEvent('search_performed', { query, resultsCount })
logger.trackEvent('ticket_used', { venueId, venueName })
```

---

## 🔌 Integración con Sentry (Futuro)

El logger está preparado para integrar con Sentry:

```typescript
// src/lib/logger.ts
import * as Sentry from '@sentry/nextjs'

error(message: string, error?: Error, context?: LogContext) {
  console.error(`[ERROR] ${message}`, { error, context })
  
  // Enviar a Sentry
  if (typeof window !== 'undefined') {
    Sentry.captureException(error, {
      extra: { message, ...context }
    })
  }
}
```

**Setup de Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 📊 Ejemplos por Tipo de Operación

### Llamadas a API

```typescript
const handleApiCall = async () => {
  const data = await withErrorHandling(
    async () => {
      const response = await fetch('/api/venues')
      if (!response.ok) throw new Error('API error')
      return response.json()
    },
    'Failed to fetch venues from API',
    { endpoint: '/api/venues' }
  )
  
  if (data) {
    toast.success('Datos cargados')
  } else {
    toast.error('Error al cargar datos')
  }
}
```

### Operaciones de Supabase

```typescript
const handleSupabaseOp = async () => {
  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, venue_id: venueId })
      
      if (error) throw error
      return data
    },
    'Failed to add to favorites',
    { userId, venueId }
  )
  
  if (result) {
    toast.success('Añadido a favoritos')
    logger.trackEvent('favorite_added', { venueId })
  }
}
```

### Validación de Formularios

```typescript
const handleFormSubmit = (e: FormEvent) => {
  e.preventDefault()
  
  const result = tryCatch(
    () => {
      if (!email) throw new Error('Email required')
      if (!password) throw new Error('Password required')
      return { email, password }
    },
    'Form validation failed'
  )
  
  if (!result) {
    toast.warning('Por favor completa todos los campos')
    return
  }
  
  // Continuar con el submit
}
```

---

## 🧪 Testing con el Nuevo Sistema

```typescript
// Mock del logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
  withErrorHandling: jest.fn((fn) => fn()),
}))

// Mock del toast context
jest.mock('@/contexts/ToastContext', () => ({
  useToastContext: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}))
```

---

## 📝 Checklist de Migración

Al actualizar un componente existente:

- [ ] Reemplazar `console.error` con `logger.error`
- [ ] Reemplazar `console.log` con `logger.info` o `logger.debug`
- [ ] Reemplazar `alert()` con `toast.error()` o `toast.warning()`
- [ ] Envolver operaciones async con `withErrorHandling`
- [ ] Añadir contexto a los logs (userId, venueId, etc.)
- [ ] Track eventos importantes con `logger.trackEvent()`
- [ ] Envolver componentes críticos con `<ErrorBoundary>`

---

## 🆘 Troubleshooting

### "useToastContext must be used within ToastProvider"
- Verifica que el componente está dentro del árbol de `<ToastProvider>`
- Ya está configurado en `layout.tsx`

### Los toasts no aparecen
- Verifica que `<ToastContainer>` está renderizado
- Chequea que no hay estilos CSS conflictivos con `z-index`

### El logger no registra en producción
- Los métodos `info` y `debug` solo funcionan en desarrollo
- Usa `error` y `warn` para logs de producción

---

**¿Necesitas más ayuda?** Revisa los tests en `src/**/__tests__/` para ver más ejemplos.
