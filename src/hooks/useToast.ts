/**
 * Hook para manejar toast notifications
 */
'use client'

import { useState, useCallback } from 'react'
import { ToastMessage, ToastType } from '@/components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Shortcuts para tipos específicos
  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
