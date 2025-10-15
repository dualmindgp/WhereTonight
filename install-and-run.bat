@echo off
echo ============================================
echo Instalando dependencias...
echo ============================================
call npm install framer-motion

echo.
echo ============================================
echo Iniciando servidor de desarrollo...
echo ============================================
call npm run dev

pause
