# 🔍 Diagnóstico: Marcadores no aparecen en el mapa

## Pasos para verificar:

### 1. Abre la consola del navegador
- Presiona `F12` en tu navegador
- Ve a la pestaña **Console**

### 2. Verifica si hay venues cargándose
Ejecuta este código en la consola:

```javascript
fetch('http://localhost:3001/api/venues')
  .then(r => r.json())
  .then(data => {
    console.log('Total venues:', data.length)
    console.log('Venues:', data)
  })
```

### 3. Resultados posibles:

#### ✅ Si ves venues (array con datos):
- El problema es del renderizado del mapa
- Necesitamos verificar el componente Map

#### ❌ Si ves array vacío `[]`:
- **No hay venues en la base de datos**
- Necesitas ejecutar el script de seeding

#### ❌ Si ves un error:
- Problema con la conexión a Supabase
- Verifica las credenciales en `.env.local`

---

## 🔧 Solución si NO hay venues:

### Opción 1: Ejecutar script de seeding
```bash
npm run seed:venues
```

### Opción 2: Insertar venues manualmente en Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto WhereTonight
3. Ve a **Table Editor** → **venues**
4. Verifica si hay registros

Si la tabla está vacía, ejecuta esto en **SQL Editor**:

```sql
-- Ver si existen venues
SELECT COUNT(*) FROM venues;

-- Ver si existen y están activos
SELECT id, name, is_active FROM venues;
```

---

## 📝 Dime qué ves en la consola
Copia y pega aquí el resultado para que pueda ayudarte mejor.
