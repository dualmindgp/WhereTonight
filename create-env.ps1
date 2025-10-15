# Script temporal para crear .env.local
$envContent = @"
# Frontend (Next.js) - Variables públicas
NEXT_PUBLIC_SUPABASE_URL=https://gbhffekgxwbeehzzogsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaGZmZWtneHdiZWVoenpvZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDUyMDYsImV4cCI6MjA3NDcyMTIwNn0.ScAFfbLDFaKTHvO8Mj-o0uvTMs4ujZ-hjAi9EibCJVI

# Backend (Scripts de seeding) - Variables privadas
SUPABASE_URL=https://gbhffekgxwbeehzzogsp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaGZmZWtneHdiZWVoenpvZ3NwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0NTIwNiwiZXhwIjoyMDc0NzIxMjA2fQ.rUz4gd4_49enC1d0dH5vgJQuC1kNaCI2agZKxqOqkcQ

# Google Places API
GOOGLE_MAPS_API_KEY=AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
Write-Host "✅ Archivo .env.local actualizado con todas las variables"
