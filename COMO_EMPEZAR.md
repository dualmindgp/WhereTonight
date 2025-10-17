# 🚀 Cómo Empezar - Testing y Error Handling

## ⚡ Quick Start (5 minutos)

### 1️⃣ Ejecutar Tests Unitarios

```bash
npm test
```

Deberías ver algo como:
```
PASS  src/components/__tests__/Toast.test.tsx
PASS  src/hooks/__tests__/useToast.test.ts
PASS  src/lib/__tests__/logger.test.ts
PASS  src/components/__tests__/ErrorBoundary.test.tsx
PASS  src/components/__tests__/AuthModal.test.tsx

Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
```

### 2️⃣ Ver Coverage

```bash
npm run test:coverage
```

Abre el reporte: `coverage/lcov-report/index.html`

### 3️⃣ Ejecutar Tests E2E (Necesita servidor)

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run test:e2e
```

---

## 📖 Usar el Nuevo Sistema en tu Código

### Ejemplo 1: Mostrar Notificación Toast

```typescript
import { useToastContext } from '@/contexts/ToastContext'

function MiComponente() {
  const toast = useToastContext()
  
  const handleClick = () => {
    toast.success('¡Operación exitosa!')
  }
  
  return <button onClick={handleClick}>Click</button>
}
```

### Ejemplo 2: Logging de Errores

```typescript
import { logger } from '@/lib/logger'

try {
  // Tu código
} catch (error) {
  logger.error('Error al cargar datos', error, { 
    userId: user.id 
  })
}
```

### Ejemplo 3: Manejo Seguro de Async

```typescript
import { withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

const toast = useToastContext()

const cargarDatos = async () => {
  const data = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.from('venues').select()
      if (error) throw error
      return data
    },
    'Error al cargar locales',
    { fuente: 'MiComponente' }
  )
  
  if (data) {
    toast.success('Datos cargados')
  } else {
    toast.error('Error al cargar datos')
  }
}
```

---

## 🎯 Migrar un Componente Existente

### Paso 1: Reemplazar console.error

**Antes:**
```typescript
console.error('Error:', error)
```

**Después:**
```typescript
import { logger } from '@/lib/logger'
logger.error('Error al procesar', error, { context: 'info' })
```

### Paso 2: Reemplazar alert()

**Antes:**
```typescript
alert('Error al guardar')
```

**Después:**
```typescript
import { useToastContext } from '@/contexts/ToastContext'
const toast = useToastContext()
toast.error('Error al guardar')
```

### Paso 3: Envolver código peligroso

**Antes:**
```typescript
function ComponentePeligroso() {
  // Código que puede fallar
}
```

**Después:**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ComponentePeligroso />
    </ErrorBoundary>
  )
}
```

---

## ✅ Checklist de Migración

Para cada componente que actualices:

- [ ] ✅ Reemplazar `console.error` → `logger.error`
- [ ] ✅ Reemplazar `console.log` → `logger.info`
- [ ] ✅ Reemplazar `alert()` → `toast.error()` o `toast.success()`
- [ ] ✅ Usar `withErrorHandling` para async operations
- [ ] ✅ Añadir contexto a los logs (userId, venueId, etc.)
- [ ] ✅ Escribir tests para el componente
- [ ] ✅ Verificar que los tests pasan

---

## 📚 Documentación Completa

| Documento | Contenido |
|-----------|-----------|
| **TESTING.md** | Guía completa de testing |
| **ERROR_HANDLING_GUIDE.md** | Guía de error handling |
| **IMPLEMENTACION_TESTING_ERROR_HANDLING.md** | Resumen técnico |
| **Este archivo** | Quick start |

---

## 🎨 Tipos de Toasts Disponibles

```typescript
const toast = useToastContext()

// 🟢 Éxito (verde)
toast.success('¡Guardado correctamente!')

// 🔴 Error (rojo)
toast.error('Error al procesar la solicitud')

// 🟡 Advertencia (amarillo)
toast.warning('Esta acción no se puede deshacer')

// 🔵 Info (azul)
toast.info('Consejo: Puedes usar atajos de teclado')
```

---

## 🧪 Escribir tu Primer Test

Crea: `src/components/__tests__/MiComponente.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import MiComponente from '../MiComponente'

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    render(<MiComponente />)
    expect(screen.getByText('Hola Mundo')).toBeInTheDocument()
  })
})
```

Ejecuta:
```bash
npm test MiComponente
```

---

## 🔥 Comandos Más Usados

```bash
# Desarrollo con tests en watch mode
npm run test:watch

# Antes de commit
npm test
npm run lint

# Ver qué tests fallan
npm test -- --verbose

# Ejecutar un test específico
npm test -- MiComponente

# Ejecutar tests E2E con UI
npm run test:e2e:ui
```

---

## 💡 Tips Rápidos

### 1. Debug en tests
```typescript
import { screen } from '@testing-library/react'

// Ver el DOM actual
screen.debug()

// Ver un elemento específico
screen.debug(screen.getByRole('button'))
```

### 2. Simular clicks de usuario
```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(screen.getByRole('button'))
await user.type(screen.getByRole('textbox'), 'Hello')
```

### 3. Esperar cambios async
```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

---

## 🎓 Aprender Más

### Videos Recomendados
- [Jest Crash Course](https://www.youtube.com/watch?v=7r4xVDI2vho)
- [React Testing Library Tutorial](https://www.youtube.com/watch?v=JKOwJUM4_RM)
- [Playwright E2E Testing](https://www.youtube.com/watch?v=wawbt1cATsk)

### Documentación Oficial
- [Jest Docs](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

---

## 🆘 Problemas Comunes

### "Cannot find module '@/...'"
```bash
# Reinicia Jest
npx jest --clearCache
```

### Tests pasan localmente pero fallan en CI
```bash
# Ejecuta con las mismas condiciones
CI=true npm test
```

### Playwright no encuentra elementos
```typescript
// Añade más tiempo de espera
await expect(element).toBeVisible({ timeout: 10000 })
```

---

## 🎉 ¡Listo para Empezar!

1. Ejecuta `npm test` para verificar que todo funciona
2. Lee `ERROR_HANDLING_GUIDE.md` para ejemplos
3. Empieza a migrar un componente pequeño
4. Escribe tu primer test
5. ¡Disfruta de código más confiable!

---

**¿Dudas?** Revisa la documentación completa en los archivos MD de la raíz del proyecto.
