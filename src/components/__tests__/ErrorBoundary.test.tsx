import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../ErrorBoundary'

// Componente que lanza un error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suprimir console.error para los tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renderiza UI de error cuando hay un error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText(/Ha ocurrido un error inesperado/i)).toBeInTheDocument()
  })

  it('muestra botones de acción', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
    expect(screen.getByText('Ir al inicio')).toBeInTheDocument()
  })

  it('reinicia el error boundary al hacer click en Reintentar', async () => {
    const user = userEvent.setup()
    
    // Usar un componente que pueda cambiar su estado
    let shouldThrow = true
    const TestComponent = () => {
      if (shouldThrow) throw new Error('Test error')
      return <div>No error</div>
    }
    
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    // Verificar que está en estado de error
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Reintentar')
    
    // Cambiar el estado antes de hacer click
    shouldThrow = false
    
    await user.click(retryButton)
    
    // El componente debería renderizar sin error
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renderiza fallback custom si se proporciona', () => {
    const customFallback = <div>Custom error UI</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('llama a onError callback cuando ocurre un error', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('Test error')
  })

  it('muestra detalles del error solo en desarrollo', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Debe haber un elemento <details> para mostrar el error
    const details = screen.getByText(/Ver detalles del error \(solo en desarrollo\)/i)
    expect(details).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })
})
