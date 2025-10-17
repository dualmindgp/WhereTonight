import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast', () => {
  it('inicializa con array vacío de toasts', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toEqual([])
  })

  it('añade un toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Test message', 'info')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Test message')
    expect(result.current.toasts[0].type).toBe('info')
  })

  it('añade múltiples toasts', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Message 1', 'success')
      result.current.showToast('Message 2', 'error')
      result.current.showToast('Message 3', 'warning')
    })
    
    expect(result.current.toasts).toHaveLength(3)
  })

  it('remueve un toast por id', () => {
    const { result } = renderHook(() => useToast())
    
    let toastId: string = ''
    
    act(() => {
      result.current.showToast('Test message', 'info')
    })
    
    toastId = result.current.toasts[0].id
    
    expect(result.current.toasts).toHaveLength(1)
    
    act(() => {
      result.current.removeToast(toastId)
    })
    
    expect(result.current.toasts).toHaveLength(0)
  })

  it('método success crea un toast de tipo success', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.success('Success message')
    })
    
    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].message).toBe('Success message')
  })

  it('método error crea un toast de tipo error', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.error('Error message')
    })
    
    expect(result.current.toasts[0].type).toBe('error')
    expect(result.current.toasts[0].message).toBe('Error message')
  })

  it('método warning crea un toast de tipo warning', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.warning('Warning message')
    })
    
    expect(result.current.toasts[0].type).toBe('warning')
    expect(result.current.toasts[0].message).toBe('Warning message')
  })

  it('método info crea un toast de tipo info', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.info('Info message')
    })
    
    expect(result.current.toasts[0].type).toBe('info')
    expect(result.current.toasts[0].message).toBe('Info message')
  })

  it('cada toast tiene un id único', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Message 1', 'info')
      result.current.showToast('Message 2', 'info')
    })
    
    const ids = result.current.toasts.map(t => t.id)
    expect(new Set(ids).size).toBe(2) // Todos los ids son únicos
  })

  it('respeta la duración custom', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('Test message', 'info', 10000)
    })
    
    expect(result.current.toasts[0].duration).toBe(10000)
  })
})
