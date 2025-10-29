'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, QrCode, Camera, AlertCircle } from 'lucide-react'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNative, setIsNative] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Detectar si es nativo (Capacitor)
    const checkNative = () => {
      if (typeof window !== 'undefined') {
        const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.()
        setIsNative(isCapacitor)
      }
    }
    checkNative()
  }, [])

  useEffect(() => {
    if (isOpen) {
      startWebScan()
    }
    
    return () => {
      stopWebScan()
    }
  }, [isOpen])

  const startWebScan = async () => {
    try {
      setIsScanning(true)
      setError(null)

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Cámara trasera
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Comenzar a escanear cada 500ms
        scanIntervalRef.current = setInterval(() => {
          scanFrame()
        }, 500)
      }
    } catch (err: any) {
      console.error('Error starting camera:', err)
      if (err.name === 'NotAllowedError') {
        setError('Se necesitan permisos de cámara para escanear QR')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara')
      } else {
        setError('Error al acceder a la cámara')
      }
      setIsScanning(false)
    }
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // Ajustar canvas al tamaño del video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Dibujar el frame actual
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Intentar leer el código QR usando la API experimental
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // Aquí podrías usar una librería de detección de QR
      // Por ahora, simulamos la funcionalidad básica
    } catch (err) {
      console.error('Error scanning frame:', err)
    }
  }

  const stopWebScan = () => {
    // Detener el intervalo de escaneo
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    // Detener el stream de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleClose = () => {
    stopWebScan()
    setIsScanning(false)
    onClose()
  }

  // Función de simulación para testing (temporal)
  const handleTestScan = () => {
    const testCode = `WHERETONIGHT-${Date.now()}`
    onScan(testCode)
    handleClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay para web (móvil usa cámara nativa) */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-10">
          <h2 className="text-white text-xl font-bold">Escanear Código QR</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          {error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="text-center w-full">
              {/* Video de la cámara */}
              <div className="relative w-full max-w-sm mx-auto mb-6">
                <video 
                  ref={videoRef}
                  className="w-full rounded-2xl"
                  playsInline
                  muted
                />
                <canvas 
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Marco del escáner sobre el video */}
                {isScanning && (
                  <div className="absolute inset-4">
                    <div className="absolute inset-0 border-4 border-neon-blue rounded-2xl opacity-50"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                  </div>
                )}
              </div>
              
              {isScanning ? (
                <>
                  <QrCode className="w-12 h-12 text-white mx-auto mb-3 animate-pulse" />
                  <p className="text-white text-lg mb-2">Apunta la cámara al código QR</p>
                  <p className="text-gray-400 text-sm mb-4">El escaneo es automático</p>
                  
                  {/* Botón de prueba (temporal para desarrollo) */}
                  <button
                    onClick={handleTestScan}
                    className="bg-neon-blue text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    🧪 Probar Escáner (Demo)
                  </button>
                </>
              ) : (
                <>
                  <Camera className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
                  <p className="text-white text-lg">Iniciando cámara...</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        {!error && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <p className="text-gray-300 text-center text-sm">
              Mantén el código QR dentro del marco para escanearlo
            </p>
          </div>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        
        :global(body.qr-scanner-active) {
          background: transparent;
        }
      `}</style>
    </>
  )
}
