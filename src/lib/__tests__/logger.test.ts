import { logger, withErrorHandling, tryCatch } from '../logger'

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance
  let consoleDebugSpy: jest.SpyInstance
  let consoleTimeSpy: jest.SpyInstance
  let consoleTimeEndSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation()
    consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('error', () => {
    it('registra errores con console.error', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error)
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR] Error occurred')
    })

    it('incluye contexto adicional', () => {
      const error = new Error('Test error')
      const context = { userId: '123', action: 'test' }
      
      logger.error('Error occurred', error, context)
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy.mock.calls[0][1]).toMatchObject({
        context,
        error,
      })
    })

    it('convierte strings a Error objects', () => {
      logger.error('Error occurred', 'String error')
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy.mock.calls[0][1].error).toBeInstanceOf(Error)
    })

    it('incluye timestamp', () => {
      logger.error('Error occurred', new Error('Test'))
      
      expect(consoleErrorSpy.mock.calls[0][1].timestamp).toBeDefined()
    })
  })

  describe('warn', () => {
    it('registra warnings con console.warn', () => {
      logger.warn('Warning message')
      
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN] Warning message')
    })

    it('incluye contexto', () => {
      const context = { detail: 'test' }
      logger.warn('Warning', context)
      
      expect(consoleWarnSpy.mock.calls[0][1]).toMatchObject({ context })
    })
  })

  describe('info', () => {
    it.skip('registra info en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logger.info('Info message')
      
      expect(consoleLogSpy).toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('debug', () => {
    it.skip('registra debug solo en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logger.debug('Debug message')
      
      expect(consoleDebugSpy).toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('trackEvent', () => {
    it.skip('registra eventos con propiedades', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logger.trackEvent('button_click', { buttonId: 'submit' })
      
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[EVENT] button_click')
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('time y timeEnd', () => {
    it.skip('registra tiempo de operaciones en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logger.time('operation')
      logger.timeEnd('operation')
      
      expect(consoleTimeSpy).toHaveBeenCalledWith('operation')
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('operation')
      
      process.env.NODE_ENV = originalEnv
    })
  })
})

describe('withErrorHandling', () => {
  it('retorna el resultado de operaciones exitosas', async () => {
    const operation = jest.fn().mockResolvedValue('success')
    
    const result = await withErrorHandling(operation, 'Test operation')
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalled()
  })

  it('retorna null y registra errores cuando falla', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('Operation failed')
    const operation = jest.fn().mockRejectedValue(error)
    
    const result = await withErrorHandling(operation, 'Test operation')
    
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('incluye contexto en el log de error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const operation = jest.fn().mockRejectedValue(new Error('Failed'))
    const context = { userId: '123' }
    
    await withErrorHandling(operation, 'Test', context)
    
    expect(consoleErrorSpy.mock.calls[0][1]).toMatchObject({
      context,
    })
    
    consoleErrorSpy.mockRestore()
  })
})

describe('tryCatch', () => {
  it('retorna el resultado de operaciones exitosas', () => {
    const operation = jest.fn().mockReturnValue('success')
    
    const result = tryCatch(operation, 'Test operation')
    
    expect(result).toBe('success')
  })

  it('retorna null y registra errores cuando falla', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const operation = jest.fn().mockImplementation(() => {
      throw new Error('Failed')
    })
    
    const result = tryCatch(operation, 'Test operation')
    
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })
})
