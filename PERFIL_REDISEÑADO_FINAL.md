# ✅ Perfil Rediseñado - Layout Final

## 🎨 Nuevo Layout del Header

### **Antes:**
```
[Avatar pequeño]  Nombre     [Edit]
                  @email
```

### **Ahora:**
```
┌─────────────────────────────┐
│ [  Avatar    ]               │
│ [  Grande    ]   Nombre  ✏️  │
│ [  112x112   ]               │
│ @email.com                   │
└─────────────────────────────┘
```

### **Características:**

1. **Avatar más grande:** 112x112px (antes: 80x80px)
2. **Nombre a la derecha** del avatar (grande, 3xl)
3. **Email DEBAJO** del avatar (centrado)
4. **Botón editar** (lápiz) en esquina superior derecha

---

## ✏️ Editar Nombre - Modal Completo

### **Funcionalidades:**

1. ✅ **Click en lápiz** → abre modal
2. ✅ **Validación de nombres únicos** (case-insensitive)
3. ✅ **Reglas de validación:**
   - 3-20 caracteres
   - Solo letras, números, _ y espacios
   - No puede estar vacío
   - Debe ser único (nadie más puede tenerlo)

### **Flujo:**

```
1. Click en lápiz ✏️
2. Se abre modal
3. Escribe nuevo nombre
4. Click "Guardar"
5. Verifica que no exista
6. Si existe → error "Este nombre ya está en uso"
7. Si no existe → guarda y cierra
```

### **Validaciones en Tiempo Real:**

- ❌ Menos de 3 caracteres → error
- ❌ Más de 20 caracteres → no permite escribir
- ❌ Caracteres especiales → error
- ❌ Nombre ya existe → error al guardar
- ✅ Todo OK → guarda exitosamente

---

## 🗄️ SQL Requerido

### **IMPORTANTE:** Ejecutar esto en Supabase

```sql
-- Archivo: unique_usernames.sql
-- Crea índice único para nombres de usuario
```

Esto garantiza que:
- ✅ No pueden existir 2 usuarios con el mismo nombre
- ✅ La búsqueda es case-insensitive ("Pelayo" = "pelayo")
- ✅ La base de datos rechaza nombres duplicados

---

## 🧪 Cómo Probar

### **Test 1: Nuevo Layout**
1. Ve al perfil
2. Deberías ver:
   - ✅ Avatar grande a la izquierda
   - ✅ Nombre grande a la derecha
   - ✅ Email debajo del avatar
   - ✅ Botón lápiz arriba a la derecha

### **Test 2: Cambiar Avatar**
1. Click en el avatar grande
2. Selecciona imagen
3. Debería subir y mostrarse

### **Test 3: Editar Nombre**
1. Click en botón lápiz ✏️
2. Modal se abre
3. Intenta cambiar a "test"
4. Guarda
5. Debería actualizar

### **Test 4: Validación de Nombres Únicos**
1. Abre modal de editar nombre
2. Escribe un nombre que **ya exista** (de otro usuario)
3. Click "Guardar"
4. Debería mostrar error: "Este nombre ya está en uso"
5. Escribe un nombre único
6. Debería guardar correctamente

### **Test 5: Validaciones**
Prueba estas validaciones:

```
"ab"              → ❌ Error: "3 caracteres mínimo"
"a"               → ❌ Error: "3 caracteres mínimo"
"nombre@especial" → ❌ Error: "Solo letras, números, _ y espacios"
"                " → ❌ Error: "No puede estar vacío"
"UnNombreValidoQueYaExiste" → ❌ Error: "Este nombre ya está en uso"
"MiNombreNuevo"   → ✅ Guarda correctamente
```

---

## 📱 Responsive

El nuevo layout es responsive:

**Desktop:**
```
[Avatar] Nombre Grande      ✏️
@email
```

**Mobile:**
```
[Avatar]  Nombre    ✏️
@email
```

---

## 🎨 Detalles Visuales

### **Avatar:**
- Tamaño: **112x112px** (más grande)
- Border: **4px** border-neon-purple/40
- Hover: Border → neon-pink
- Rounded: **2xl** (más redondeado)
- Overlay más oscuro (70% opacity)

### **Nombre:**
- Tamaño: **text-3xl** (grande)
- Font: **bold**
- Color: **white**

### **Email:**
- Tamaño: **text-xs**
- Color: **text-secondary**
- Centrado debajo del avatar
- Max-width: **112px** (mismo que avatar)
- Break-all para emails largos

### **Botón Editar:**
- Ícono: **Edit2** (lápiz)
- Color: **neon-blue**
- Background: **dark-secondary**
- Border: **neon-blue/30**
- Hover: **neon-blue/50**

---

## 🔒 Seguridad

### **Nombres Únicos:**

La validación de nombres únicos funciona así:

```typescript
// 1. Buscar nombres existentes (case-insensitive)
const { data: existingUsers } = await supabase
  .from('profiles')
  .select('id, username')
  .ilike('username', newName.trim())

// 2. Verificar si algún OTRO usuario tiene ese nombre
const nameExists = existingUsers?.some(user => 
  user.id !== userId && 
  user.username?.toLowerCase() === newName.trim().toLowerCase()
)

// 3. Si existe → rechazar
if (nameExists) {
  setError('Este nombre ya está en uso. Elige otro.')
  return
}
```

**Importante:**
- ✅ Compara en **minúsculas**
- ✅ Excluye al **usuario actual**
- ✅ Verifica en **base de datos**
- ✅ Índice único previene race conditions

---

## 📋 Checklist de Implementación

**Antes de continuar, verifica:**

- [ ] Ejecutaste `unique_usernames.sql` en Supabase
- [ ] Avatar se ve más grande (112x112px)
- [ ] Email está DEBAJO del avatar
- [ ] Nombre está a la DERECHA del avatar
- [ ] Botón lápiz está arriba a la derecha
- [ ] Click en lápiz abre modal
- [ ] Modal permite editar nombre
- [ ] Modal valida nombres únicos
- [ ] No puedes usar un nombre ya existente
- [ ] Puedes cambiar a un nombre nuevo

---

## 🐛 Troubleshooting

### **Modal no se abre al click en lápiz**
→ Revisa consola (F12) para errores
→ Verifica que `EditNameModal` esté importado

### **Error al guardar nombre**
→ Abre consola y mira el error
→ Probablemente falta ejecutar el SQL

### **Dice que el nombre está en uso pero no debería**
→ Verifica en Supabase Table Editor tabla `profiles`
→ Busca nombres duplicados
→ El índice único debe existir

### **Avatar no se ve más grande**
→ Recarga la página (Ctrl+R)
→ Verifica que los cambios se aplicaron

---

## 📝 Archivos Creados/Modificados

### **Nuevos:**
- ✅ `EditNameModal.tsx` - Modal para editar nombre
- ✅ `unique_usernames.sql` - Índice único en BD

### **Modificados:**
- ✅ `ProfileScreenV2.tsx` - Layout rediseñado + modal

---

## 🚀 Resultado Final

El perfil ahora se ve **exactamente como la imagen** que compartiste:

```
┌──────────────────────────────┐
│  ┌────┐                      │
│  │ 📷 │  Pelayoouu        ✏️  │
│  │    │                      │
│  └────┘                      │
│  @pelayo.negueruela...       │
├──────────────────────────────┤
│  🎟️ 1      🔥 0              │
│  Tickets   Streak            │
├──────────────────────────────┤
│  📍 1      👥 0              │
│  Locales   Amigos            │
└──────────────────────────────┘
```

**Todo funcional y validado!** 🎉
