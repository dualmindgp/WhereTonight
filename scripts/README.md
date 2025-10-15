# 📁 Scripts de Seeding

Esta carpeta contiene los scripts para poblar la base de datos de Supabase con locales nocturnos usando **Google Places API**.

---

## 📋 Scripts disponibles

### 🏙️ `seed-varsovia.ts`
Pobla la base de datos con locales de **Varsovia**.

**Ejecutar:**
```bash
npm run seed:varsovia
```

**Locales incluidos:**
- MultiPub "Pod Grubą Kaśką"
- Teatro Cubano
- Club Room 13
- BLU Club
- Chicas & Gorillas
- Level 27

---

### 🏙️ `seed-madrid.ts`
Pobla la base de datos con locales de **Madrid**.

**Ejecutar:**
```bash
npm run seed:madrid
```

**Locales incluidos:**
- Teatro Kapital
- Fabrik
- Joy Eslava
- Goya Social Club
- Barceló Teatro
- Mondo Disco
- Sala Cool
- El Sol
- Stardust
- Shoko
- Opium

---

## 🚀 Cómo funcionan los scripts

1. **Lee la lista de locales** definida en `VENUES_TO_SEARCH`
2. **Busca cada local** en Google Places API usando `searchText`
3. **Obtiene información completa**:
   - 📸 Fotos (hasta 10 por local)
   - ⭐ Rating de Google
   - 📍 Coordenadas GPS exactas
   - 💰 Nivel de precio
   - 🌐 Sitio web
   - 🗺️ URL de Google Maps
4. **Guarda en Supabase** usando `upsert`:
   - Si el local ya existe (mismo `place_id`), lo actualiza
   - Si no existe, lo crea nuevo

---

## 📝 Cómo replicar para otra ciudad

### Ejemplo: Añadir Barcelona

1. **Copia uno de los scripts existentes:**
   ```bash
   cp scripts/seed-madrid.ts scripts/seed-barcelona.ts
   ```

2. **Edita el nuevo archivo** `seed-barcelona.ts`:

   **a) Cambia el comentario inicial:**
   ```typescript
   /**
    * 🏙️ SEED BARCELONA - Script para poblar la base de datos con locales de Barcelona
    * ...
    */
   ```

   **b) Actualiza la lista de locales:**
   ```typescript
   const VENUES_TO_SEARCH = [
     'Razzmatazz Barcelona',
     'Opium Barcelona',
     'Pacha Barcelona',
     'Shoko Barcelona',
     'Sutton Barcelona',
     // ... más locales
   ]
   ```

   **c) Cambia las coordenadas del `locationBias`:**
   
   Busca esta sección en el código:
   ```typescript
   locationBias: {
     rectangle: {
       low: { latitude: 40.3, longitude: -3.85 },  // SW de Madrid
       high: { latitude: 40.55, longitude: -3.55 }  // NE de Madrid
     }
   }
   ```

   Y cámbiala por las coordenadas de Barcelona:
   ```typescript
   locationBias: {
     rectangle: {
       low: { latitude: 41.32, longitude: 2.05 },  // SW de Barcelona
       high: { latitude: 41.45, longitude: 2.25 }  // NE de Barcelona
     }
   }
   ```

   **d) Actualiza el mensaje final:**
   ```typescript
   console.log('🎉 BARCELONA VENUES SEEDING COMPLETED!')
   ```

3. **Añade el comando en `package.json`:**
   ```json
   "scripts": {
     "seed:varsovia": "tsx scripts/seed-varsovia.ts",
     "seed:madrid": "tsx scripts/seed-madrid.ts",
     "seed:barcelona": "tsx scripts/seed-barcelona.ts"  // ← Nuevo
   }
   ```

4. **Ejecuta el script:**
   ```bash
   npm run seed:barcelona
   ```

---

## 🗺️ Coordenadas de ciudades comunes

Para facilitar la creación de nuevos scripts, aquí tienes las coordenadas aproximadas de algunas ciudades:

| Ciudad | SW (low) | NE (high) |
|--------|----------|-----------|
| **Madrid** | `40.3, -3.85` | `40.55, -3.55` |
| **Barcelona** | `41.32, 2.05` | `41.45, 2.25` |
| **Varsovia** | `52.0977, 20.8638` | `52.3678, 21.2708` |
| **Londres** | `51.38, -0.35` | `51.65, 0.15` |
| **París** | `48.81, 2.22` | `48.90, 2.47` |
| **Berlín** | `52.40, 13.23` | `52.62, 13.55` |
| **Ámsterdam** | `52.30, 4.75` | `52.43, 5.05` |

---

## ⚙️ Requisitos

Para que los scripts funcionen, necesitas estas variables en `.env.local`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Service role key (NO anon key)
GOOGLE_MAPS_API_KEY=AIzaSyXXX...     # Con Places API (New) activado
```

---

## 🔍 Solución de problemas

### ❌ Error: "GOOGLE_MAPS_API_KEY not found"
- Verifica que `.env.local` existe en la raíz del proyecto
- Asegúrate de que la variable está definida correctamente

### ❌ Error: "Places API search error: 403"
- Tu API key no tiene permisos para Places API
- Ve a Google Cloud Console → APIs & Services → Enable APIs
- Busca "Places API (New)" y actívala

### ❌ Error: "No place found for: [nombre del local]"
- El nombre del local puede estar mal escrito
- Intenta añadir la ciudad al final: `"Nombre Local Madrid"`
- Verifica que el local existe en Google Maps

### ❌ Los locales se insertan pero sin fotos
- Verifica que el `place_id` se está guardando correctamente
- Comprueba que `/api/photo` está funcionando
- Revisa los logs del script para ver si hay errores al obtener fotos

---

## 📊 Ejemplo de salida exitosa

```
🚀 Starting Madrid venues seeding process with Google Places API...

✅ Supabase client initialized with SERVICE ROLE KEY

🔍 Searching for: Teatro Kapital Madrid
✅ Found place_id: ChIJ4RUenCgmQg0RdI4x7geRUEA
✅ Processed: Kapital
   📍 C. de Atocha, 125, 7º, Centro, 28012 Madrid, Spain
   ⭐ Rating: 3.7
   💰 Price Level: 3
   📸 Photos: 10 images
   🗺️  Maps URL: https://www.google.com/maps/place/?q=place_id:ChIJ4RUenCgmQg0RdI4x7geRUEA
✅ Upserted: Kapital

[... más locales ...]

==================================================
🎉 MADRID VENUES SEEDING COMPLETED!
==================================================
📊 SUMMARY:
   ✅ Inserted: 0
   🔄 Updated: 11
   ❌ Failed: 0
```

---

## 💡 Consejos

- **Usa nombres específicos**: Añade la ciudad al nombre del local para mejores resultados
- **Verifica en Google Maps**: Antes de añadir un local, búscalo en Google Maps para confirmar que existe
- **Ejecuta de nuevo si falla**: Los scripts usan `upsert`, así que puedes ejecutarlos múltiples veces sin duplicar
- **Espera entre ejecuciones**: Google Places API tiene límites de rate, el script ya incluye delays automáticos
- **Revisa Supabase**: Después de ejecutar, verifica en el dashboard de Supabase que los locales se insertaron correctamente

---

## 📞 Soporte

Si tienes problemas con los scripts, revisa:
1. Los logs de la consola al ejecutar el script
2. El dashboard de Supabase para ver si los datos se insertaron
3. Google Cloud Console para verificar el uso de la API
