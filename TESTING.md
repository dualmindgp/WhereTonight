# 🧪 Testing en WhereTonight

Este documento describe cómo ejecutar y escribir tests para el proyecto WhereTonight.

---

## 📋 Tipos de Tests

### 1. **Tests Unitarios y de Integración (Jest + React Testing Library)**

Ubicados en: `src/**/__tests__/**/*.test.tsx`

**Ejecutar tests:**
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Ejecutar tests con reporte de coverage
npm run test:coverage
```

**Tests existentes:**
- ✅ `AuthModal.test.tsx` - Tests del modal de autenticación
- ✅ `Toast.test.tsx` - Tests del sistema de notificaciones
- ✅ `ErrorBoundary.test.tsx` - Tests del error boundary
- ✅ `useToast.test.ts` - Tests del hook de toasts
- ✅ `logger.test.ts` - Tests del sistema de logging

---

### 2. **Tests End-to-End (Playwright)**

Ubicados en: `tests/**/*.spec.ts`

**Ejecutar tests E2E:**
```bash
# Ejecutar todos los tests E2E (headless)
npm run test:e2e

# Ejecutar tests con UI interactiva
npm run test:e2e:ui

# Ejecutar tests con navegador visible
npm run test:e2e:headed
```

**Tests existentes:**
- ✅ `home.spec.ts` - Tests de la página principal
- ✅ `auth-flow.spec.ts` - Tests del flujo de autenticación
- ✅ `venues.spec.ts` - Tests del flujo de venues

---

## 🏗️ Estructura de Tests

### Tests Unitarios

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MiComponente from '../MiComponente'

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    render(<MiComponente />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })

  it('debe manejar clicks', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<MiComponente onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Tests E2E

```typescript
import { test, expect } from '@playwright/test'

test.describe('Mi Feature', () => {
  test('debe hacer algo', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /click me/i }).click()
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

---

## 🎯 Buenas Prácticas

### Tests Unitarios

1. **Describe bloques claros**: Agrupa tests relacionados
2. **Nombres descriptivos**: `debe hacer X cuando Y`
3. **Arrange-Act-Assert**: Estructura clara de preparación, acción y verificación
4. **Mock de dependencias**: Aísla el componente bajo test
5. **Limpieza**: Usa `beforeEach` y `afterEach` para estado limpio

### Tests E2E

1. **Usa selectores semánticos**: `getByRole`, `getByLabel` mejor que CSS
2. **Espera inteligente**: Usa `waitFor` en lugar de `waitForTimeout` cuando sea posible
3. **Tests independientes**: Cada test debe poder ejecutarse solo
4. **Datos de prueba**: Usa datos realistas
5. **Screenshots en fallos**: Ya configurado automáticamente

---

## 🔧 Configuración

### Jest (`jest.config.js`)
- Configurado con Next.js
- Soporte para TypeScript
- Path aliases (`@/*`)
- Coverage configurado

### Playwright (`playwright.config.ts`)
- Tests en Chrome, Firefox, Safari
- Tests móviles (iOS y Android)
- Screenshots automáticos en fallos
- Traces para debugging

---

## 📊 Coverage

**Ver reporte de coverage:**
```bash
npm run test:coverage
```

El reporte se genera en: `coverage/lcov-report/index.html`

**Meta de coverage:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## 🚀 CI/CD

Los tests se pueden integrar fácilmente en CI/CD:

**GitHub Actions ejemplo:**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## 🐛 Debugging Tests

### Jest
```bash
# Ejecutar un archivo específico
npm test AuthModal.test.tsx

# Ejecutar tests con un patrón
npm test -- --testNamePattern="debe mostrar error"

# Modo debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright
```bash
# Debug mode con Playwright Inspector
npx playwright test --debug

# Ejecutar un test específico
npx playwright test tests/home.spec.ts

# Ver trace de un test fallido
npx playwright show-trace trace.zip
```

---

## ✍️ Escribir Nuevos Tests

### 1. Para un nuevo componente:

```bash
# Crear archivo de test
src/components/MiNuevoComponente.tsx
src/components/__tests__/MiNuevoComponente.test.tsx
```

### 2. Para un nuevo flujo E2E:

```bash
# Crear spec file
tests/mi-nuevo-flujo.spec.ts
```

### 3. Ejecutar solo tus tests:

```bash
# Jest
npm test -- MiNuevoComponente

# Playwright
npm run test:e2e -- mi-nuevo-flujo
```

---

## 🔌 Mocks Configurados

### Supabase
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      // ...
    },
  },
}))
```

### Window APIs
- `matchMedia` ✅
- `IntersectionObserver` ✅
- `ResizeObserver` ✅

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🆘 Problemas Comunes

### "Cannot find module '@/...'"
- Verifica que `tsconfig.json` tenga los paths configurados
- Reinicia el servidor de Jest

### "Element not found" en tests
- Usa `screen.debug()` para ver el DOM actual
- Verifica que el componente renderiza correctamente
- Usa queries más específicas

### Tests E2E fallan aleatoriamente
- Añade más esperas (`waitFor`)
- Verifica que el servidor dev está corriendo
- Ejecuta con `--headed` para ver qué pasa

---

**¿Preguntas?** Consulta la documentación o contacta al equipo.
