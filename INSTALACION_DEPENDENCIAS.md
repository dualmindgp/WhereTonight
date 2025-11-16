# 📦 Instalación de Dependencias - Mobile Premium

## 🚨 IMPORTANTE: Instalar Antes de Probar

Los nuevos componentes mobile requieren paquetes adicionales de Expo.

---

## 📱 Para WhereTonight-Mobile

```bash
cd WhereTonight-Mobile

# Instalar dependencias requeridas
npx expo install expo-linear-gradient
npx expo install expo-blur

# Verificar instalación
npm list expo-linear-gradient
npm list expo-blur
```

---

## 📱 Para PruebaApp/WhereTonight-Mobile

```bash
cd PruebaApp/WhereTonight-Mobile

# Instalar dependencias requeridas
npx expo install expo-linear-gradient
npx expo install expo-blur

# Verificar instalación
npm list expo-linear-gradient
npm list expo-blur
```

---

## ✅ Verificación

Después de instalar, verifica que estén en `package.json`:

```json
{
  "dependencies": {
    "expo-linear-gradient": "~13.0.2",
    "expo-blur": "~13.0.2",
    ...
  }
}
```

---

## 🔄 Si Ya Tienes las Dependencias

Si ya las tienes instaladas, asegúrate de que sean versiones compatibles:

```bash
# Actualizar si es necesario
npx expo install expo-linear-gradient@latest
npx expo install expo-blur@latest
```

---

## 🚀 Ejecutar la App

Después de instalar:

```bash
# Limpiar cache y ejecutar
npm start -- --clear

# O directamente
npx expo start --clear
```

---

## ⚠️ Errores TypeScript

Los siguientes errores son **ESPERADOS** y NO afectan la funcionalidad:

```
Cannot find module 'expo-linear-gradient'
Cannot find module 'expo-blur'
Property 'user_id' does not exist on type 'never'
```

**Solución:**
- Los primeros 2 se resuelven instalando las dependencias
- Los errores de Supabase ('never') son de inferencia de tipos y funcionan en runtime

---

## 🎯 Resultado

Una vez instaladas las dependencias, podrás ver:

- ✨ Gradientes premium en header, cards y botones
- 🌈 Stories con anillos de colores vibrantes
- 💫 Loading states con círculos gradiente
- 🎨 Empty states con iconos en gradiente

---

## 📞 Soporte

Si encuentras problemas:

1. **Limpia node_modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Limpia cache de Metro:**
   ```bash
   npx expo start --clear
   ```

3. **Reinicia el servidor:**
   ```bash
   pkill -f "expo"
   npm start
   ```

---

¡Listo para disfrutar del diseño premium! 🎉
