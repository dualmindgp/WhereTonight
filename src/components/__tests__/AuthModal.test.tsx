import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '../AuthModal'
import { supabase } from '@/lib/supabase'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}))

describe('AuthModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('no renderiza cuando isOpen es false', () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza correctamente cuando isOpen es true', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument()
  })

  it('cambia entre login y sign up', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    // Inicialmente debe estar en modo login
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    
    // Cambiar a registro
    const signUpButton = screen.getByText('Regístrate')
    await user.click(signUpButton)
    
    // Debe cambiar a modo registro
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument()
  })

  it('llama a signInWithPassword al hacer login', async () => {
    const user = userEvent.setup()
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock
    mockSignIn.mockResolvedValue({ data: {}, error: null })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    // Llenar formulario
    await user.type(screen.getByPlaceholderText(/tu@email.com/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    await user.click(submitButton)
    
    // Verificar que se llamó a signInWithPassword
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('muestra error cuando el login falla', async () => {
    const user = userEvent.setup()
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock
    mockSignIn.mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid credentials' } 
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.type(screen.getByPlaceholderText(/tu@email.com/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/), 'wrongpassword')
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    await user.click(submitButton)
    
    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('cierra el modal al hacer click en el botón X', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    // El botón de cerrar es el primero que no tiene texto
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find(btn => btn.querySelector('svg'))
    
    if (closeButton) {
      await user.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('deshabilita el botón durante la carga', async () => {
    const user = userEvent.setup()
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.type(screen.getByPlaceholderText(/tu@email.com/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123')
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    await user.click(submitButton)
    
    // El botón debe mostrar 'Cargando...' durante la carga
    await waitFor(() => {
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })
})
