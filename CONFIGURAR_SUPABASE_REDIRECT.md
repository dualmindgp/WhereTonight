# 🔐 CONFIGURAR REDIRECT URLs EN SUPABASE

**PASO A PASO para que el login de Google funcione** ✅

---

## 🎯 ¿QUÉ VAMOS A HACER?

Configurar las **Redirect URLs** en Supabase para que cuando hagas login con Google, puedas volver a la app correctamente.

**Tiempo estimado:** 2-3 minutos ⏱️

---

## 📋 PASO 1: IR A SUPABASE DASHBOARD

### **1.1 Abrir Supabase**
```
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión si no lo estás
3. Verás la lista de tus proyectos
```

### **1.2 Seleccionar tu proyecto**
```
1. Click en el proyecto de WhereTonight
   (probablemente se llama "wheretonight" o similar)
```

---

## 📋 PASO 2: IR A AUTHENTICATION

### **2.1 Menú lateral izquierdo**
```
1. Busca el icono de un escudo 🛡️
2. Click en "Authentication"
```

### **2.2 Ir a URL Configuration**
```
1. Dentro de Authentication
2. Click en "URL Configuration"
   (está en el menú lateral, abajo de "Providers")
```

---

## 📋 PASO 3: AÑADIR REDIRECT URLs

Verás una sección llamada **"Redirect URLs"**

### **3.1 Añadir la URL para móvil**

1. **Busca el campo "Redirect URLs"**
2. **Click en "+ Add URL"** o similar
3. **Pega esta URL exacta:**
   ```
   com.wheretonight.app://login-callback
   ```

### **IMPORTANTE:**
- ✅ Debe ser **EXACTAMENTE** como está arriba
- ✅ **SIN** `http://` o `https://`
- ✅ **CON** `://` en medio
- ✅ **CON** `-callback` al final

### **Debería quedar así:**
```
Redirect URLs:
- http://localhost:3000/** (si ya existe)
- com.wheretonight.app://login-callback (← LA QUE ACABAS DE AÑADIR)
```

---

## 📋 PASO 4: GUARDAR

1. **Click en "Save"** o **"Update"**
2. Espera la confirmación (puede tardar 1-2 segundos)
3. ✅ **¡Listo!**

---

## 🔍 VERIFICAR QUE ESTÁ BIEN

### **Después de guardar, verifica que en "Redirect URLs" aparezca:**

```
✅ com.wheretonight.app://login-callback
```

Si aparece, **¡perfecto!** Ya está configurado.

---

## ⚠️ SI GOOGLE OAUTH NO ESTÁ CONFIGURADO

### **Verificar si Google está habilitado:**

1. **En Supabase Dashboard**
2. **Authentication → Providers**
3. **Busca "Google"**
4. **Debe estar:**
   - ✅ **Enabled:** ON (activado)
   - ✅ **Client ID:** (debe tener un valor)
   - ✅ **Client Secret:** (debe tener un valor)

### **Si NO está configurado:**

#### **A. Ir a Google Cloud Console**
```
1. Ve a: https://console.cloud.google.com
2. Selecciona tu proyecto (o crea uno)
```

#### **B. Crear OAuth 2.0 Client ID**
```
1. Menú lateral → APIs & Services → Credentials
2. Click en "+ CREATE CREDENTIALS"
3. Selecciona "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Name: "WhereTonight"
```

#### **C. Configurar Authorized redirect URIs**

Añade ESTAS 3 URLs:

```
Para desarrollo web:
http://localhost:3000/auth/callback

Para Supabase (IMPORTANTE):
https://TU-PROYECTO.supabase.co/auth/v1/callback

Para móvil:
com.wheretonight.app://login-callback
```

**⚠️ IMPORTANTE:** Reemplaza `TU-PROYECTO` con el nombre real de tu proyecto.

**Ejemplo:**
```
https://wheretonight-abc123.supabase.co/auth/v1/callback
```

#### **D. Copiar credenciales**
```
1. Copia el "Client ID" (empieza con números)
2. Copia el "Client Secret"
```

#### **E. Pegar en Supabase**
```
1. Vuelve a Supabase Dashboard
2. Authentication → Providers → Google
3. Pega Client ID
4. Pega Client Secret
5. Enabled: ON
6. Save
```

---

## 🧪 PROBAR QUE FUNCIONA

### **Después de configurar:**

1. **Abre tu app en el navegador:**
   ```
   http://localhost:3001
   ```

2. **Prueba el login con Google:**
   - Click en "Login"
   - Click en "Continuar con Google"
   - Selecciona tu cuenta
   - **Debería funcionar** ✅

3. **En móvil (cuando hagas build):**
   - La app se abrirá
   - Login con Google
   - Se abre navegador
   - Seleccionas cuenta
   - **Vuelve a la app automáticamente** ✅

---

## ❓ PROBLEMAS COMUNES

### **Problema: "redirect_uri_mismatch"**

**Significa:** La URL en Google Cloud no coincide con Supabase

**Solución:**
1. Ve a Google Cloud Console
2. Edita tu OAuth 2.0 Client ID
3. Verifica que tengas:
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   com.wheretonight.app://login-callback
   ```
4. Guarda

---

### **Problema: "Access blocked: This app's request is invalid"**

**Significa:** OAuth Client no está configurado correctamente

**Solución:**
1. Verifica que Google Provider esté **habilitado** en Supabase
2. Verifica que tengas **Client ID** y **Client Secret**
3. Verifica que las redirect URIs en Google Cloud sean correctas

---

### **Problema: "This app hasn't been verified by Google"**

**Esto es NORMAL en desarrollo** ✅

**Qué hacer:**
1. Aparece pantalla de advertencia
2. Click en **"Advanced"**
3. Click en **"Go to WhereTonight (unsafe)"**
4. Continúa normalmente

**Nota:** Esto solo pasa en desarrollo. En producción puedes solicitar verificación de Google.

---

## ✅ CHECKLIST COMPLETO

Antes de cerrar, verifica que:

**En Supabase Dashboard:**
- [ ] Authentication → URL Configuration abierto
- [ ] Redirect URL añadida: `com.wheretonight.app://login-callback`
- [ ] Guardado con "Save"
- [ ] Google Provider habilitado (si usas Google)
- [ ] Client ID y Secret configurados (si usas Google)

**En Google Cloud Console (si usas Google):**
- [ ] OAuth 2.0 Client ID creado
- [ ] Authorized redirect URIs incluyen:
  - [ ] `https://TU-PROYECTO.supabase.co/auth/v1/callback`
  - [ ] `com.wheretonight.app://login-callback`

---

## 🎯 RESUMEN RÁPIDO

**Lo mínimo que necesitas:**

1. ✅ Supabase Dashboard → Authentication → URL Configuration
2. ✅ Añadir: `com.wheretonight.app://login-callback`
3. ✅ Save
4. ✅ ¡Listo!

**Si usas Google OAuth:**

5. ✅ Google Cloud Console → OAuth 2.0 Client ID
6. ✅ Añadir redirect URIs (Supabase + móvil)
7. ✅ Copiar Client ID y Secret a Supabase
8. ✅ ¡Listo!

---

## 🚀 SIGUIENTE PASO

Después de configurar:

**Para web:**
```bash
npm run dev
# Prueba login con Google
```

**Para móvil (cuando migres a Capacitor):**
```bash
npm run build
npx cap sync
npx cap open android
# Prueba login con Google en dispositivo
```

---

## 📸 REFERENCIA VISUAL

### **Así debe verse en Supabase:**

```
┌─────────────────────────────────────────┐
│ Authentication → URL Configuration      │
├─────────────────────────────────────────┤
│                                         │
│ Site URL:                               │
│ https://wheretonight.com               │
│                                         │
│ Redirect URLs:                          │
│ • http://localhost:3000/**             │
│ • com.wheretonight.app://login-callback │ ← NUEVA
│                                         │
│         [+ Add URL]    [Save]          │
└─────────────────────────────────────────┘
```

---

**¡Eso es todo!** Con esto configurado, el login de Google funcionará tanto en web como en móvil. 🎉

**¿Alguna duda?** Revisa la sección de "Problemas Comunes" arriba. 🔧
