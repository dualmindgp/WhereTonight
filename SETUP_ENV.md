# 🔧 Configurar Variables de Entorno

## ⚠️ Error Actual
```
Error: Supabase URL and Anon Key must be provided!
```

## ✅ Solución Rápida

### Opción 1: Crear archivo .env.local manualmente

1. **Crea un archivo llamado `.env.local`** en la raíz del proyecto:
   - Ruta: `c:\Users\guill\Desktop\WhereTonight\.env.local`

2. **Añade este contenido** (reemplaza con tus credenciales reales):

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

3. **Obtén tus credenciales de Supabase**:
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto WhereTonight
   - Ve a Settings → API
   - Copia:
     - **Project URL** → Pégalo como `NEXT_PUBLIC_SUPABASE_URL`
     - **Project API keys → anon public** → Pégalo como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Guarda el archivo y reinicia el servidor**:
   - Presiona `Ctrl+C` en la terminal
   - Ejecuta `npm run dev` de nuevo

### Opción 2: Usar PowerShell para crear el archivo

Ejecuta este comando en PowerShell desde la carpeta del proyecto:

```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
"@ | Out-File -FilePath .env.local -Encoding utf8
```

Luego edita el archivo `.env.local` y reemplaza las credenciales.

## 📝 Nota Importante

El archivo `.env.local` NO se sube a Git (está en .gitignore), por eso debes crearlo manualmente en cada instalación.
