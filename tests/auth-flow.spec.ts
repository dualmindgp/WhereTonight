import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000) // Esperar splash screen
  })

  test('debe mostrar errores de validación en formulario vacío', async ({ page }) => {
    // Abrir modal
    await page.getByRole('button', { name: /Inicia sesión/i }).first().click()
    
    // Intentar enviar sin llenar
    const submitButton = page.getByRole('button', { name: /Entrar/i })
    await submitButton.click()
    
    // Verificar que no se cierra el modal (validación HTML5)
    await expect(page.getByPlaceholder(/tu@email.com/i)).toBeVisible()
  })

  test('debe cambiar entre login y registro', async ({ page }) => {
    await page.getByRole('button', { name: /Inicia sesión/i }).first().click()
    
    // Verificar modo login
    await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible()
    
    // Cambiar a registro
    await page.getByText(/¿No tienes cuenta?/i).click()
    
    // Verificar modo registro
    await expect(page.getByRole('button', { name: /Crear cuenta/i })).toBeVisible()
  })

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.getByRole('button', { name: /Inicia sesión/i }).first().click()
    
    // Llenar con credenciales inválidas
    await page.getByPlaceholder(/tu@email.com/i).fill('test@example.com')
    await page.getByPlaceholder(/Tu contraseña/i).fill('wrongpassword')
    
    // Submit
    await page.getByRole('button', { name: /Entrar/i }).click()
    
    // Esperar mensaje de error
    await expect(page.getByText(/error|invalid|incorrecto/i)).toBeVisible({ timeout: 5000 })
  })

  test('debe poder usar autenticación con Google', async ({ page }) => {
    await page.getByRole('button', { name: /Inicia sesión/i }).first().click()
    
    // Verificar que existe el botón de Google
    const googleButton = page.getByRole('button', { name: /Google/i })
    await expect(googleButton).toBeVisible()
  })
})
