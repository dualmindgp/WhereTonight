'use client'

import React, { useState, useEffect } from 'react'
import { X, QrCode, Camera } from 'lucide-react'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSupport()
  }, [])

  useEffect(() => {
    if (isOpen && isSupported) {
      startScan()
    }
    
    return () => {
      stopScan()
    }
  }, [isOpen, isSupported])

  const checkSupport = async () => {
    try {
      const { supported } = await BarcodeScanner.isSupported()
      setIsSupported(supported)
      
      if (!supported) {
        setError('Tu dispositivo no soporta escaneo de códigos QR')
      }
    } catch (err) {
      console.error('Error checking barcode scanner support:', err)
      setIsSupported(false)
      setError('Error verificando soporte de escáner')
    }
  }

  const startScan = async () => {
    try {
      setIsScanning(true)
      setError(null)

      // Solicitar permisos
      const { camera } = await BarcodeScanner.requestPermissions()
      
      if (camera === 'granted' || camera === 'limited') {
        // Hacer el fondo del body transparente
        document.body.classList.add('qr-scanner-active')
        
        // Comenzar el escaneo
        const result = await BarcodeScanner.scan()
        
        if (result.barcodes && result.barcodes.length > 0) {
          const code = result.barcodes[0]
          if (code.rawValue) {
            onScan(code.rawValue)
            handleClose()
          }
        }
      } else {
        setError('Se necesitan permisos de cámara para escanear QR')
      }
    } catch (err: any) {
      console.error('Error scanning:', err)
      if (err.message !== 'USER_CANCELLED') {
        setError('Error al escanear el código QR')
      }
      handleClose()
    } finally {
      setIsScanning(false)
    }
  }

  const stopScan = async () => {
    try {
      document.body.classList.remove('qr-scanner-active')
      await BarcodeScanner.stopScan()
    } catch (err) {
      console.error('Error stopping scan:', err)
    }
  }

  const handleClose = async () => {
    await stopScan()
    setIsScanning(false)
    onClose()
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
              <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : isScanning ? (
            <div className="text-center">
              {/* Marco del escáner */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-neon-blue rounded-2xl opacity-50"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                
                {/* Línea de escaneo animada */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-neon-blue animate-scan"></div>
              </div>
              
              <QrCode className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
              <p className="text-white text-lg">Apunta la cámara al código QR</p>
              <p className="text-gray-400 text-sm mt-2">El escaneo es automático</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
              <p className="text-white text-lg">Iniciando cámara...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <p className="text-gray-300 text-center text-sm">
            Mantén el código QR dentro del marco
          </p>
        </div>
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
