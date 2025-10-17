/**
 * Error Boundary para capturar errores de React
 * Previene que toda la app se crashee
 */
'use client'

import React, { Component, ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log el error
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    // Callback opcional
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback custom, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Oops! Algo salió mal
              </h1>
              
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado. No te preocupes, puedes intentar recargar la página o volver al inicio.
              </p>

              {/* Mostrar error solo en desarrollo */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-red-600 font-mono mb-2">
                    Ver detalles del error (solo en desarrollo)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-xs font-mono overflow-auto">
                    <p className="font-bold mb-2">{this.state.error.message}</p>
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <p className="font-bold mt-3 mb-2">Component Stack:</p>
                        <pre className="whitespace-pre-wrap text-gray-700">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook helper para usar Error Boundary funcionalmente
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
