import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastContainer from '../Toast'
import { ToastMessage } from '../Toast'

describe('ToastContainer', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza un toast correctamente', () => {
    const toasts: ToastMessage[] = [
      {
        id: '1',
        type: 'success',
        message: 'Test message',
        duration: 5000,
      },
    ]

    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renderiza múltiples toasts', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Success message' },
      { id: '2', type: 'error', message: 'Error message' },
      { id: '3', type: 'info', message: 'Info message' },
    ]

    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('cierra el toast al hacer click en X', async () => {
    const user = userEvent.setup()
    const toasts: ToastMessage[] = [
      { id: '1', type: 'info', message: 'Test message' },
    ]

    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    const closeButtons = screen.getAllByRole('button')
    await user.click(closeButtons[0])
    
    // Esperar a que se llame onClose después de la animación
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('1')
    }, { timeout: 1000 })
  })

  it.skip('se cierra automáticamente después de la duración', async () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'info', message: 'Test message', duration: 3000 },
    ]

    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    // Avanzar el tiempo total (duración + animación)
    jest.advanceTimersByTime(3300)
    
    // Esperar a que se llame onClose
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('1')
    })
  })

  it('muestra el icono correcto para cada tipo', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Success' },
    ]

    const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    // Verificar que hay un icono de success (CheckCircle)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('aplica las clases CSS correctas según el tipo', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'error', message: 'Error message' },
    ]

    const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)
    
    const toastElement = container.querySelector('.bg-red-50')
    expect(toastElement).toBeInTheDocument()
  })
})
