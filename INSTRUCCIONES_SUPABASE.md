# 📋 Instrucciones para Arreglar la Biografía en Supabase

## 🔧 Problema
La tabla `profiles` en tu base de datos de Supabase no tiene todos los campos necesarios, incluyendo `bio`, `avatar_url` y `language`.

## ✅ Solución

### Paso 1: Accede a Supabase
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto **WhereTonight**
3. En el menú lateral, haz click en **SQL Editor**

### Paso 2: Ejecuta el Script SQL
1. Haz click en **"New Query"** (Nueva consulta)
2. Copia TODO el contenido del archivo `supabase/fix_profiles.sql`
3. Pégalo en el editor SQL
4. Haz click en **"Run"** (Ejecutar) o presiona `Ctrl+Enter`

### Paso 3: Verifica que Funcionó
En la parte inferior del editor verás un mensaje como:
```
total_users | total_profiles
------------|---------------
     5      |      5
```

Los números deben ser iguales. Esto significa que todos los usuarios tienen su perfil creado.

### Paso 4: Verifica la Estructura
1. En el menú lateral, haz click en **Table Editor**
2. Selecciona la tabla `profiles`
3. Deberías ver estas columnas:
   - ✅ `id`
   - ✅ `username`
   - ✅ `avatar_url`
   - ✅ `bio`
   - ✅ `language`
   - ✅ `created_at`

## 📱 En la Aplicación

Después de ejecutar el script:

1. **Biografía**: Ahora podrás editar y guardar tu biografía (máximo 80 caracteres)
2. **Avatar**: Podrás subir fotos de perfil
3. **Idioma**: El idioma se guardará en tu perfil

### Cambio de Idioma
Cuando cambies el idioma (ES/EN), verás un mensaje pidiendo que **recargues la aplicación** para que el mapa también cambie de idioma. Esto es normal en muchas apps.

## ❓ Si Tienes Problemas

### Error: "permission denied for table profiles"
Necesitas ejecutar también estos comandos en el SQL Editor:
```sql
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
```

### Error: "duplicate key value violates unique constraint"
Significa que algunos perfiles ya existen. Esto es normal, el script maneja esto con `ON CONFLICT DO NOTHING`.

### La biografía sigue sin guardarse
1. Verifica que el script se ejecutó correctamente
2. Cierra sesión y vuelve a iniciar sesión en la app
3. Si aún no funciona, envíame el error que aparece en la consola del navegador (F12 → Console)

## 🎉 ¡Listo!
Una vez ejecutado el script, todo debería funcionar correctamente. Los nuevos usuarios que se registren tendrán su perfil creado automáticamente.
