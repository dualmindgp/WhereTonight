import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('debe cargar la página principal correctamente', async ({ page }) => {
    await page.goto('/')
    
    // Esperar a que termine el splash screen
    await page.waitForTimeout(3000)
    
    // Verificar que el mapa se carga
    await expect(page.locator('.maplibregl-canvas, .mapboxgl-canvas')).toBeVisible({ timeout: 10000 })
    
    // Verificar que hay venues listados
    await expect(page.getByText(/locales/i).first()).toBeVisible()
  })

  test('debe mostrar el modal de autenticación', async ({ page }) => {
    await page.goto('/')
    
    // Esperar a que termine el splash screen
    await page.waitForTimeout(3000)
    
    // Click en botón de login
    const loginButton = page.getByRole('button', { name: /Inicia sesión/i }).first()
    await loginButton.click()
    
    // Verificar que el modal aparece
    await expect(page.getByPlaceholder(/tu@email.com/i)).toBeVisible()
  })

  test('debe poder cerrar el modal de autenticación', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    
    // Abrir modal
    const loginButton = page.getByRole('button', { name: /Inicia sesión/i }).first()
    await loginButton.click()
    
    // Cerrar modal
    const closeButton = page.locator('button:has-text("×")').first()
    await closeButton.click()
    
    // Verificar que el modal se cerró
    await expect(page.getByPlaceholder(/tu@email.com/i)).not.toBeVisible()
  })
})
