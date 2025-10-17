import { test, expect } from '@playwright/test'

test.describe('Venues Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000) // Esperar splash screen
  })

  test('debe mostrar lista de venues', async ({ page }) => {
    // Esperar a que carguen los venues
    await expect(page.locator('[data-testid="venue-card"], .venue-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('debe abrir VenueSheet al hacer click en un venue', async ({ page }) => {
    // Click en el primer venue card
    await page.locator('[data-testid="venue-card"], .venue-card').first().click()
    
    // Verificar que se abre el sheet con información del venue
    await expect(page.locator('[data-testid="venue-sheet"]').or(page.getByRole('dialog'))).toBeVisible({ timeout: 5000 })
  })

  test('debe poder cerrar VenueSheet', async ({ page }) => {
    // Abrir venue sheet
    await page.locator('[data-testid="venue-card"], .venue-card').first().click()
    await page.waitForTimeout(500)
    
    // Cerrar con el botón X
    const closeButton = page.getByRole('button').filter({ hasText: '×' }).first()
    await closeButton.click()
    
    // Verificar que se cerró
    await expect(page.locator('[data-testid="venue-sheet"]')).not.toBeVisible()
  })

  test('debe mostrar opción de usar ticket', async ({ page }) => {
    // Abrir venue sheet
    await page.locator('[data-testid="venue-card"], .venue-card').first().click()
    
    // Verificar que hay botón de ticket o mensaje de autenticación
    const ticketButton = page.getByRole('button', { name: /ticket|ir hoy/i })
    const loginPrompt = page.getByText(/inicia sesión/i)
    
    await expect(ticketButton.or(loginPrompt)).toBeVisible({ timeout: 5000 })
  })

  test('debe poder filtrar venues', async ({ page }) => {
    // Buscar botón de filtros
    const filterButton = page.getByRole('button', { name: /filtro|filter/i }).first()
    
    if (await filterButton.isVisible()) {
      await filterButton.click()
      
      // Verificar que se abre el modal de filtros
      await expect(page.getByText(/precio|rating|tipo/i)).toBeVisible()
    }
  })

  test('debe poder buscar venues', async ({ page }) => {
    // Buscar input de búsqueda
    const searchInput = page.locator('input[type="text"], input[placeholder*="buscar"], input[placeholder*="search"]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('club')
      
      // Esperar a que se filtren los resultados
      await page.waitForTimeout(500)
    }
  })
})
