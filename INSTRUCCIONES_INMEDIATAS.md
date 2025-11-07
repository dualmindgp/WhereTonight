# ⚡ INSTRUCCIONES INMEDIATAS - QUÉ HACER AHORA

**Fecha:** 7 de noviembre de 2025, 11:30pm  
**Prioridad:** ALTA

---

## ✅ LO QUE DEBES HACER AHORA (15 minutos)

### **1. Ejecutar Migración de Puntos en Supabase**

```bash
# Paso 1: Abrir Supabase
https://app.supabase.com

# Paso 2: Seleccionar proyecto WhereTonight

# Paso 3: SQL Editor → New Query

# Paso 4: Copiar TODO el contenido de este archivo:
c:\Users\guill\Desktop\WhereTonight\database\points-system-migration.sql

# Paso 5: Pegar en SQL Editor y hacer click "Run"

# Paso 6: Verificar que se crearon las tablas:
SELECT * FROM user_points LIMIT 5;
SELECT * FROM push_tokens LIMIT 5;

# Paso 7: Si no hay errores → ✅ COMPLETADO
```

### **2. Repetir para PruebaApp**

```bash
# Mismo proceso pero en el proyecto Supabase de PruebaApp
```

---

## ⚠️ LO QUE NO DEBES HACER

### **❌ NO Ejecutar Migración de Afiliados**

```bash
# ❌ NO ejecutar este archivo:
database/affiliate-system-migration.sql

# El archivo está guardado para futuro
# Se activará en fase posterior cuando lo decidas
```

---

## 🧪 TESTING Después de las Migraciones

### **Probar Sistema de Puntos:**

```bash
# 1. Iniciar app
cd c:\Users\guill\Desktop\WhereTonight
npm run dev

# 2. Abrir navegador: http://localhost:3001

# 3. Login con tu cuenta

# 4. Ir a pestaña "Perfil" (icono 👤)

# 5. Verificar que aparece:
#    - Card "⭐ 0 Puntos"
#    - Card "📈 Nivel 1"

# 6. Ir al Mapa

# 7. Click en un venue (marcador)

# 8. En VenueSheet, click en ⭐ (guardar favorito)

# 9. Verificar toast: "¡+5 puntos! ⭐"

# 10. Volver a Perfil

# 11. Verificar: "⭐ 5 Puntos"

# ✅ Si todo funciona → Sistema de puntos OK
```

---

## 📊 ESTADO ACTUAL

```
✅ Código implementado: 100%
✅ Documentación creada: 100%
⏳ Base de datos: 0% → Ejecutar SQL ahora
⏳ Firebase: 0% → Hacer después
⏳ Testing: 0% → Hacer después de SQL
```

---

## 📁 ARCHIVOS IMPORTANTES

### **EJECUTAR:**
- ✅ `database/points-system-migration.sql` → WhereTonight
- ✅ `database/points-system-migration.sql` → PruebaApp

### **NO EJECUTAR (guardar para futuro):**
- ⏸️ `database/affiliate-system-migration.sql`

### **LEER DESPUÉS:**
- 📖 `LISTO_PARA_VENTA.md` - Guía completa
- 📖 `GUIA_TESTING_COMPLETA.md` - Testing exhaustivo
- 📖 `PLAN_DOMINIO_MERCADO.md` - Roadmap largo plazo

---

## ⏰ TIMELINE

**AHORA (15 min):**
- Ejecutar SQL de puntos en ambos proyectos

**DESPUÉS (10 min):**
- Testing básico del sistema de puntos

**LUEGO (Variable):**
- Firebase setup
- Testing completo
- Preparación para lanzamiento

---

## ❓ SI TIENES PROBLEMAS

### **Error al ejecutar SQL:**
1. Verificar que estás en el proyecto correcto
2. Copiar TODO el contenido del archivo
3. Intentar ejecutar por partes si falla

### **Tablas no aparecen:**
1. Refrescar página de Supabase
2. Ir a Table Editor → Ver si aparecen
3. Verificar que no hay errores en SQL Editor

### **Sistema de puntos no funciona en app:**
1. Verificar que SQL se ejecutó sin errores
2. Hard refresh del navegador (Ctrl+F5)
3. Cerrar y abrir app completamente

---

## ✅ CHECKLIST

- [ ] SQL ejecutado en WhereTonight
- [ ] SQL ejecutado en PruebaApp
- [ ] Tablas verificadas en Supabase
- [ ] App iniciada en modo dev
- [ ] Login exitoso
- [ ] Puntos visibles en perfil (0 inicialmente)
- [ ] Guardar venue funciona
- [ ] Puntos aumentan a 5
- [ ] Todo funciona correctamente

---

**¡Empieza con el SQL y luego prueba! 🚀**
