# 🤝 SISTEMA DE AFILIADOS - IMPLEMENTACIÓN COMPLETA

**Prioridad:** 🔥🔥🔥🔥🔥 CRÍTICA  
**ROI:** Inmediato  
**Timeline:** 2 semanas

---

## 📋 RESUMEN EJECUTIVO

El sistema de afiliados transforma WhereTonight de una app de descubrimiento a una plataforma de monetización, generando ingresos por cada entrada o reserva comprada a través de la app.

### **Flujo de Usuario:**
```
Usuario ve local → Click "Comprar Entrada" → 
Redirige a plataforma con link afiliado → 
Usuario compra → Nosotros recibimos comisión (5-20%)
```

---

## 🗄️ SCHEMA DE BASE DE DATOS

Ver archivo adjunto: `database/affiliate-system-migration.sql`

**Tablas principales:**
- `affiliate_partners` - Plataformas (Fever, Xceed, etc.)
- `venue_affiliate_links` - Links por venue
- `affiliate_clicks` - Tracking de clicks
- `affiliate_conversions` - Ventas completadas
- `affiliate_payouts` - Pagos recibidos

---

## 💻 COMPONENTE FRONTEND

```typescript
// src/components/AffiliateButton.tsx
'use client'

import { ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function AffiliateButton({ 
  venueId, 
  partnerId,
  partnerName,
  buttonText = 'Comprar Entrada'
}: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    
    const response = await fetch('/api/affiliates/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId, partnerId })
    })

    const { affiliateUrl } = await response.json()
    window.open(affiliateUrl, '_blank')
    
    setIsLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      <ExternalLink /> {buttonText}
    </button>
  )
}
```

---

## 🤝 PLATAFORMAS DE AFILIADOS

### **Principales:**

1. **Fever** (fever.com)
   - Comisión: 10-15%
   - API: Sí
   - Contacto: partnerships@fever.com
   - Web: https://feverup.com/es/partners

2. **Xceed** (xceed.me)
   - Comisión: 15-20%
   - API: Sí
   - Contacto: info@xceed.me

3. **Eventbrite**
   - Comisión: 10-12%
   - API: Muy completa
   - Afiliados: https://www.eventbrite.com/affiliates

4. **Tablelist** (Reservas VIP)
   - Comisión: 10-15%
   - Contacto: partnerships@tablelist.com

5. **Discotech**
   - Comisión: 15%
   - Contacto: info@discotech.me

### **España:**

6. **Tootoot**
   - Email: info@tootoot.fm
   - Comisión: 15-20%

7. **Enterticket**
   - Email: comercial@enterticket.es

8. **Atrapalo**
   - Web: https://www.atrapalo.com/colabora-con-atrapalo

---

## 📧 EMAIL TEMPLATE PARA CONTACTO

```
Asunto: Partnership Opportunity - WhereTonight App

Hola [Nombre],

Soy [Tu Nombre], fundador de WhereTonight, app de vida nocturna con 
[X] usuarios activos en [ciudades].

Queremos integrar [Plataforma] en nuestra app mediante sistema de afiliados:

BENEFICIOS PARA [PLATAFORMA]:
- Nuevo canal de distribución
- Tráfico cualificado
- Solo comisión por conversión

PROPUESTA:
- Comisión estándar (10-15%)
- Integración vía API
- Tracking completo

¿15 minutos esta semana para discutir detalles?

Saludos,
[Tu Nombre]
```

---

## 🚀 IMPLEMENTACIÓN EN 3 PASOS

### **1. Base de Datos (15 min)**
```sql
-- Ver: database/affiliate-system-migration.sql
-- Ejecutar en Supabase SQL Editor
```

### **2. Backend API (2 horas)**
```typescript
// /api/affiliates/track-click
// /api/affiliates/webhook/[partner]
// /api/affiliates/stats
```

### **3. Frontend Integration (1 hora)**
```typescript
// Añadir AffiliateButton a VenueSheet
// Mostrar links disponibles
// Tracking de clicks
```

---

## 📈 PROYECCIÓN DE INGRESOS

### **Realista:**
- **Mes 1:** €100-300
- **Mes 3:** €2K-5K
- **Mes 6:** €10K-20K
- **Mes 12:** €50K+

### **KPIs:**
- CTR: 5-10%
- Conversion Rate: 2-5%
- AOV: €20-50
- Commission: 10-15%

---

## ✅ CHECKLIST DE ACCIÓN

### **Esta Semana:**
- [ ] Crear schema de base de datos
- [ ] Implementar AffiliateButton
- [ ] Contactar Fever y Eventbrite

### **Próximas 2 Semanas:**
- [ ] API routes completas
- [ ] Webhooks de conversión
- [ ] Testing con 10 venues piloto
- [ ] Primera conversión

---

**Archivos relacionados:**
- `database/affiliate-system-migration.sql` - Schema completo
- `src/components/AffiliateButton.tsx` - Componente
- `src/app/api/affiliates/` - API routes
