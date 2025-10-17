/**
 * Sistema de logging centralizado para WhereTonight
 * 
 * Proporciona funciones para registrar errores, warnings e info
 * con contexto adicional. Fácil integrar con Sentry más adelante.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Registra un error con contexto adicional
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    console.error(`[ERROR] ${message}`, {
      error: errorObj,
      stack: errorObj.stack,
      context,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrar con Sentry cuando esté listo
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(errorObj, {
    //     extra: { message, ...context }
    //   })
    // }
  }

  /**
   * Registra una advertencia
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Registra información general
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context)
    }
  }

  /**
   * Registra información de debugging (solo en desarrollo)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context)
    }
  }

  /**
   * Registra una acción del usuario para analytics
   */
  trackEvent(eventName: string, properties?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[EVENT] ${eventName}`, properties)
    }

    // TODO: Integrar con Google Analytics o Plausible
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', eventName, properties)
    // }
  }

  /**
   * Registra el tiempo de una operación
   */
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  /**
   * Termina el registro de tiempo de una operación
   */
  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Exportar función helper para capturar errores async
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: LogContext
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    logger.error(errorMessage, error, context)
    return null
  }
}

// Helper para operaciones síncronas
export function tryCatch<T>(
  operation: () => T,
  errorMessage: string,
  context?: LogContext
): T | null {
  try {
    return operation()
  } catch (error) {
    logger.error(errorMessage, error, context)
    return null
  }
}
