'use client'

import React, { forwardRef, useEffect, useState } from 'react'
import { MapProps } from './Map'

const MapWrapper = forwardRef<any, MapProps>((props, ref) => {
  const [MapComponent, setMapComponent] = useState<any>(null)
  
  useEffect(() => {
    // Cargar el mapa dinámicamente solo en el cliente
    import('./Map').then((mod) => {
      setMapComponent(() => mod.default)
    })
  }, [])
  
  if (!MapComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-primary">
        <div className="animate-pulse text-neon-blue">Cargando mapa...</div>
      </div>
    )
  }

  return <MapComponent {...props} ref={ref} />
})

MapWrapper.displayName = 'MapWrapper'

export default MapWrapper
