@echo off
echo ============================================
echo Aplicando migracion de Friendships
echo ============================================
echo.
echo Esta migracion creara las tablas:
echo - friendships (sistema de amigos)
echo - favorites (favoritos de venues)
echo.
echo IMPORTANTE: Necesitas tener las credenciales de Supabase configuradas
echo.
pause

npx supabase db push --db-url postgresql://postgres.xfxttfvnaqltlzkxhzpc:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

echo.
echo ============================================
echo Migracion completada
echo ============================================
pause
