-- ==========================================
-- SISTEMA DE PUNTOS - MIGRACIÓN
-- ==========================================
-- Este script crea las tablas necesarias para el sistema de puntos
-- Ejecutar en Supabase SQL Editor

-- Tabla de puntos del usuario
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de transacciones de puntos (historial)
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON public.points_transactions(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_points
CREATE POLICY "users_can_view_own_points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_view_all_points_for_leaderboard" ON public.user_points
  FOR SELECT USING (true); -- Permitir ver todos para el ranking

-- Políticas RLS para points_transactions
CREATE POLICY "users_can_view_own_transactions" ON public.points_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_transactions" ON public.points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para añadir puntos atómicamente
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  -- Insertar o actualizar puntos del usuario
  INSERT INTO user_points (user_id, total_points, updated_at)
  VALUES (p_user_id, p_points, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    updated_at = NOW()
  RETURNING total_points INTO v_new_total;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION add_user_points(UUID, INTEGER) TO authenticated;

-- ==========================================
-- TABLA DE TOKENS PUSH NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

-- Habilitar RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para push_tokens
CREATE POLICY "users_can_manage_own_tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- ==========================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a user_points
DROP TRIGGER IF EXISTS update_user_points_updated_at ON public.user_points;
CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a push_tokens
DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON public.push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
-- Ejecuta estas queries para verificar que todo se creó correctamente:

-- SELECT * FROM user_points LIMIT 5;
-- SELECT * FROM points_transactions LIMIT 5;
-- SELECT * FROM push_tokens LIMIT 5;

-- ==========================================
-- FIN DE MIGRACIÓN
-- ==========================================
