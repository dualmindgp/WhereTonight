# Instrucciones para activar la funcionalidad de Posts Sociales

## ⚠️ IMPORTANTE: Ejecutar Migración en Supabase

Para que la nueva funcionalidad de posts sociales funcione correctamente, **DEBES ejecutar la migración SQL en tu base de datos de Supabase**.

### Pasos a seguir:

1. **Accede a tu panel de Supabase**
   - Ve a [https://supabase.com](https://supabase.com)
   - Abre tu proyecto de WhereTonight

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Crea una nueva consulta

3. **Ejecuta la migración**
   - Abre el archivo: `supabase/migrations/005_social_posts.sql`
   - Copia TODO el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "RUN" para ejecutar la migración

4. **Verifica la instalación**
   - Ve a "Table Editor" en Supabase
   - Deberías ver una nueva tabla llamada `social_posts`
   - También deberías ver una nueva vista llamada `social_posts_with_user`

### ✅ ¿Qué hace esta migración?

- **Crea la tabla `social_posts`**: Almacena los mensajes de los usuarios con filtros por ciudad y audiencia
- **Configura RLS (Row Level Security)**: Protege los datos con políticas de seguridad
- **Crea índices**: Optimiza las consultas por ciudad y fecha
- **Crea vista `social_posts_with_user`**: Une los posts con la información del perfil del usuario
- **Configura triggers**: Actualiza automáticamente el campo `updated_at`

### 🎯 Funcionalidades implementadas:

1. **Filtro por ciudad**: Los usuarios pueden seleccionar una ciudad para ver y publicar mensajes
2. **Control de audiencia**: 
   - **Público**: Todos pueden ver el mensaje
   - **Solo amigos**: Solo los amigos aceptados pueden ver el mensaje
3. **Interfaz completa**:
   - Selector de ciudad con búsqueda en tiempo real (OpenStreetMap)
   - Formulario para crear posts con contador de caracteres (máx. 500)
   - Visualización de posts con avatar, nombre, timestamp
   - Opción de eliminar posts propios
   - Separación entre "Mensajes de la comunidad" y "Actividad de amigos"

### 📝 Notas adicionales:

- Los usuarios no autenticados solo verán posts públicos
- Los usuarios autenticados verán posts públicos + posts de amigos + posts propios
- La búsqueda de ciudades se realiza mediante la API de Nominatim (OpenStreetMap)
- Los posts están limitados a 500 caracteres
- El sistema soporta imágenes (aunque la carga de imágenes requiere configuración adicional de almacenamiento)

### ⏱️ Sistema de 24 Horas

**IMPORTANTE**: Tanto los posts sociales como las actividades de amigos tienen una duración de 24 horas:
- Solo se muestran mensajes y actividades de las últimas 24 horas
- Esto crea mayor urgencia y mantiene el contenido fresco
- Indicadores visuales "⏱️ Últimas 24h" en la interfaz

#### Limpieza Automática (Opcional)

Para limpiar automáticamente los datos antiguos de la base de datos:

1. **Ejecuta la migración**: `supabase/migrations/006_cleanup_old_posts.sql`
2. **Planes Pro de Supabase**: El script incluye configuración con `pg_cron` para limpieza automática cada hora
3. **Planes gratuitos**: Ejecuta manualmente las funciones periódicamente:
   ```sql
   SELECT cleanup_old_social_posts();
   SELECT cleanup_old_activities();
   ```

**Nota**: La limpieza de base de datos es opcional. El filtro de 24h en el frontend ya oculta el contenido antiguo.

---

**¡Una vez ejecutada la migración, la funcionalidad estará lista para usar! 🚀**
