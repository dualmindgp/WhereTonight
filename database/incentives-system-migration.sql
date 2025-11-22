-- ==========================================
-- SISTEMA DE INCENTIVOS COMPLETO
-- ==========================================
-- Fecha: Noviembre 2025
-- Descripción: Sistema de referidos, recompensas, badges y engagement
-- ==========================================

-- ==========================================
-- 1. TABLA DE CÓDIGOS DE REFERIDO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = ilimitado
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);

COMMENT ON TABLE public.referral_codes IS 'Códigos de referido únicos por usuario';
COMMENT ON COLUMN public.referral_codes.code IS 'Código alfanumérico único para compartir (ej: GUILLE2024)';
COMMENT ON COLUMN public.referral_codes.uses_count IS 'Número de veces que se ha usado el código';
COMMENT ON COLUMN public.referral_codes.max_uses IS 'Límite de usos (NULL = ilimitado)';

-- ==========================================
-- 2. TABLA DE REFERIDOS (quien invitó a quién)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Quien invita
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE, -- Quien fue invitado
  referral_code TEXT REFERENCES public.referral_codes(code),
  
  -- Tracking de recompensas
  referrer_rewarded BOOLEAN DEFAULT false,
  referred_rewarded BOOLEAN DEFAULT false,
  referrer_reward_points INTEGER DEFAULT 0,
  referred_reward_points INTEGER DEFAULT 0,
  
  -- Milestones del referido
  referred_first_login TIMESTAMP WITH TIME ZONE,
  referred_completed_profile TIMESTAMP WITH TIME ZONE,
  referred_first_story TIMESTAMP WITH TIME ZONE,
  referred_first_ticket TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

COMMENT ON TABLE public.referrals IS 'Registro de quien invitó a cada usuario';

-- ==========================================
-- 3. TABLA DE BADGES/LOGROS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT, -- Nombre del icono (lucide-react)
  category TEXT CHECK (category IN ('social', 'explorer', 'influencer', 'loyalty', 'referral', 'premium')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_reward INTEGER DEFAULT 0,
  
  -- Condiciones para obtenerlo (JSON)
  unlock_conditions JSONB NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges(rarity);

COMMENT ON TABLE public.badges IS 'Catálogo de badges/logros disponibles';
COMMENT ON COLUMN public.badges.unlock_conditions IS 'Condiciones JSON para desbloquear (ej: {"stories_count": 10})';

-- ==========================================
-- 4. TABLA DE BADGES DE USUARIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked_at ON public.user_badges(unlocked_at DESC);

COMMENT ON TABLE public.user_badges IS 'Badges desbloqueados por cada usuario';

-- ==========================================
-- 5. TABLA DE CHALLENGES/RETOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly', 'special', 'permanent')),
  
  -- Objetivos
  goal_type TEXT NOT NULL, -- 'stories', 'tickets', 'friends', 'venues_visited', etc.
  goal_count INTEGER NOT NULL,
  
  -- Recompensas
  points_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES public.badges(id),
  premium_days_reward INTEGER DEFAULT 0, -- Días de premium gratis
  
  -- Periodo de validez
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = permanente
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active, starts_at, ends_at);

COMMENT ON TABLE public.challenges IS 'Retos/desafíos disponibles para usuarios';

-- ==========================================
-- 6. TABLA DE PROGRESO DE CHALLENGES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  
  current_count INTEGER DEFAULT 0,
  goal_count INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recompensa reclamada
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON public.user_challenge_progress(completed);

-- ==========================================
-- 7. TABLA DE STREAKS (Rachas)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Racha de login diario
  current_login_streak INTEGER DEFAULT 0,
  longest_login_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  
  -- Racha de historias diarias
  current_story_streak INTEGER DEFAULT 0,
  longest_story_streak INTEGER DEFAULT 0,
  last_story_date DATE,
  
  -- Racha de tickets semanales
  current_ticket_streak INTEGER DEFAULT 0,
  longest_ticket_streak INTEGER DEFAULT 0,
  last_ticket_week INTEGER,
  last_ticket_year INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.user_streaks IS 'Rachas de actividad de usuarios';

-- ==========================================
-- 8. TABLA DE RECOMPENSAS RECLAMABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'premium_days', 'free_ticket', 'badge', 'discount')),
  reward_value TEXT NOT NULL, -- JSON con detalles de la recompensa
  
  source TEXT NOT NULL, -- 'referral', 'challenge', 'streak', 'milestone', 'promotion'
  source_id UUID, -- ID de la fuente (challenge_id, badge_id, etc.)
  
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_claimed ON public.user_rewards(claimed);
CREATE INDEX IF NOT EXISTS idx_user_rewards_expires_at ON public.user_rewards(expires_at);

COMMENT ON TABLE public.user_rewards IS 'Recompensas pendientes de reclamar por usuarios';

-- ==========================================
-- 9. FUNCIÓN: Generar código de referido único
-- ==========================================

CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID, p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_attempt INTEGER := 0;
BEGIN
  LOOP
    -- Generar código basado en username + random
    IF v_attempt = 0 AND p_username IS NOT NULL THEN
      -- Primer intento: username limpio
      v_code := UPPER(REGEXP_REPLACE(p_username, '[^a-zA-Z0-9]', '', 'g'));
      v_code := SUBSTRING(v_code FROM 1 FOR 10);
    ELSE
      -- Intentos siguientes: username + número random
      v_code := UPPER(REGEXP_REPLACE(p_username, '[^a-zA-Z0-9]', '', 'g'));
      v_code := SUBSTRING(v_code FROM 1 FOR 6) || FLOOR(RANDOM() * 10000)::TEXT;
    END IF;
    
    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    -- Si no existe, salir del loop
    EXIT WHEN NOT v_exists;
    
    v_attempt := v_attempt + 1;
    
    -- Máximo 10 intentos
    IF v_attempt > 10 THEN
      -- Generar código completamente random
      v_code := 'WT' || FLOOR(RANDOM() * 1000000)::TEXT;
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 10. FUNCIÓN: Procesar referido nuevo
-- ==========================================

CREATE OR REPLACE FUNCTION process_referral(
  p_referred_id UUID,
  p_referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_reward INTEGER := 100; -- Puntos para quien invita
  v_referred_reward INTEGER := 50;  -- Puntos para quien fue invitado
BEGIN
  -- Obtener el referrer_id del código
  SELECT user_id INTO v_referrer_id
  FROM referral_codes
  WHERE code = p_referral_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  -- Si no existe el código o no es válido
  IF v_referrer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- No puede referirse a sí mismo
  IF v_referrer_id = p_referred_id THEN
    RETURN false;
  END IF;
  
  -- Crear el registro de referido
  INSERT INTO referrals (referrer_id, referred_id, referral_code, referred_first_login)
  VALUES (v_referrer_id, p_referred_id, p_referral_code, NOW())
  ON CONFLICT (referred_id) DO NOTHING;
  
  -- Incrementar contador de usos del código
  UPDATE referral_codes
  SET uses_count = uses_count + 1
  WHERE code = p_referral_code;
  
  -- Dar puntos al referido inmediatamente (bienvenida)
  PERFORM add_user_points(p_referred_id, v_referred_reward);
  
  INSERT INTO points_transactions (user_id, action, points, metadata)
  VALUES (p_referred_id, 'referral_signup', v_referred_reward, jsonb_build_object('referral_code', p_referral_code));
  
  -- Actualizar registro de referido
  UPDATE referrals
  SET referred_rewarded = true,
      referred_reward_points = v_referred_reward
  WHERE referred_id = p_referred_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 11. FUNCIÓN: Recompensar al referrer
-- ==========================================

CREATE OR REPLACE FUNCTION reward_referrer(
  p_referred_id UUID,
  p_milestone TEXT -- 'completed_profile', 'first_story', 'first_ticket'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
  v_reward_points INTEGER;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Obtener referrer
  SELECT referrer_id, referrer_rewarded INTO v_referrer_id, v_already_rewarded
  FROM referrals
  WHERE referred_id = p_referred_id;
  
  -- Si no hay referrer o ya fue recompensado
  IF v_referrer_id IS NULL OR v_already_rewarded THEN
    RETURN false;
  END IF;
  
  -- Determinar puntos según milestone
  CASE p_milestone
    WHEN 'completed_profile' THEN
      v_reward_points := 50;
      UPDATE referrals SET referred_completed_profile = NOW() WHERE referred_id = p_referred_id;
    WHEN 'first_story' THEN
      v_reward_points := 75;
      UPDATE referrals SET referred_first_story = NOW() WHERE referred_id = p_referred_id;
    WHEN 'first_ticket' THEN
      v_reward_points := 100;
      UPDATE referrals SET referred_first_ticket = NOW() WHERE referred_id = p_referred_id;
      -- Si completó todos los milestones, marcar como recompensado totalmente
      UPDATE referrals
      SET referrer_rewarded = true,
          referrer_reward_points = referrer_reward_points + v_reward_points
      WHERE referred_id = p_referred_id;
    ELSE
      RETURN false;
  END CASE;
  
  -- Dar puntos al referrer
  PERFORM add_user_points(v_referrer_id, v_reward_points);
  
  INSERT INTO points_transactions (user_id, action, points, metadata)
  VALUES (v_referrer_id, 'referral_milestone', v_reward_points, 
          jsonb_build_object('milestone', p_milestone, 'referred_id', p_referred_id));
  
  -- Actualizar puntos acumulados
  UPDATE referrals
  SET referrer_reward_points = referrer_reward_points + v_reward_points
  WHERE referred_id = p_referred_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 12. FUNCIÓN: Actualizar racha de login
-- ==========================================

CREATE OR REPLACE FUNCTION update_login_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_login DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Obtener datos actuales
  SELECT last_login_date, current_login_streak
  INTO v_last_login, v_current_streak
  FROM user_streaks
  WHERE user_id = p_user_id;
  
  -- Si no existe registro, crear
  IF v_last_login IS NULL THEN
    INSERT INTO user_streaks (user_id, current_login_streak, longest_login_streak, last_login_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
    RETURN 1;
  END IF;
  
  -- Si ya hizo login hoy, no hacer nada
  IF v_last_login = CURRENT_DATE THEN
    RETURN v_current_streak;
  END IF;
  
  -- Si hizo login ayer, incrementar racha
  IF v_last_login = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Se rompió la racha
    v_new_streak := 1;
  END IF;
  
  -- Actualizar registro
  UPDATE user_streaks
  SET current_login_streak = v_new_streak,
      longest_login_streak = GREATEST(longest_login_streak, v_new_streak),
      last_login_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Dar puntos por login diario (2 puntos)
  PERFORM add_user_points(p_user_id, 2);
  
  INSERT INTO points_transactions (user_id, action, points, metadata)
  VALUES (p_user_id, 'daily_login', 2, jsonb_build_object('streak', v_new_streak));
  
  -- Bonos por milestones de racha
  IF v_new_streak = 7 THEN
    PERFORM add_user_points(p_user_id, 50); -- Bonus semana
  ELSIF v_new_streak = 30 THEN
    PERFORM add_user_points(p_user_id, 200); -- Bonus mes
  ELSIF v_new_streak = 100 THEN
    PERFORM add_user_points(p_user_id, 1000); -- Bonus 100 días
  END IF;
  
  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 13. TRIGGER: Auto-crear código de referido al registrarse
-- ==========================================

CREATE OR REPLACE FUNCTION auto_create_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_code TEXT;
BEGIN
  -- Obtener username del metadata
  v_username := NEW.raw_user_meta_data->>'username';
  
  -- Si no hay username, usar email
  IF v_username IS NULL OR v_username = '' THEN
    v_username := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  -- Generar código
  v_code := generate_referral_code(NEW.id, v_username);
  
  -- Insertar código
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.id, v_code)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger (solo si no existe)
DROP TRIGGER IF EXISTS trigger_auto_create_referral_code ON auth.users;
CREATE TRIGGER trigger_auto_create_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_referral_code();

-- ==========================================
-- 14. INSERTAR BADGES PREDEFINIDOS
-- ==========================================

INSERT INTO public.badges (slug, name, description, icon_name, category, rarity, points_reward, unlock_conditions) VALUES

-- Social
('first_story', 'Primera Historia', 'Comparte tu primera historia', 'Camera', 'social', 'common', 20, '{"stories_count": 1}'),
('storyteller', 'Cuentacuentos', 'Comparte 10 historias', 'Book', 'social', 'rare', 50, '{"stories_count": 10}'),
('influencer', 'Influencer', 'Comparte 50 historias', 'Award', 'social', 'epic', 200, '{"stories_count": 50}'),
('viral', 'Viral', '100 historias compartidas', 'TrendingUp', 'social', 'legendary', 500, '{"stories_count": 100}'),

-- Explorer
('night_owl', 'Ave Nocturna', 'Visita 5 venues diferentes', 'Moon', 'explorer', 'common', 30, '{"venues_visited": 5}'),
('city_explorer', 'Explorador Urbano', 'Visita 20 venues', 'MapPin', 'explorer', 'rare', 100, '{"venues_visited": 20}'),
('nightlife_expert', 'Experto Nocturno', 'Visita 50 venues', 'Star', 'explorer', 'epic', 250, '{"venues_visited": 50}'),

-- Loyalty
('week_warrior', 'Guerrero Semanal', '7 días de racha de login', 'Calendar', 'loyalty', 'rare', 75, '{"login_streak": 7}'),
('month_master', 'Maestro Mensual', '30 días de racha', 'Trophy', 'loyalty', 'epic', 300, '{"login_streak": 30}'),
('dedicated', 'Dedicado', '100 días de racha', 'Flame', 'loyalty', 'legendary', 1000, '{"login_streak": 100}'),

-- Referral
('recruiter', 'Reclutador', 'Invita a 1 amigo', 'UserPlus', 'referral', 'common', 50, '{"referrals": 1}'),
('talent_scout', 'Cazatalentos', 'Invita a 5 amigos', 'Users', 'referral', 'rare', 200, '{"referrals": 5}'),
('ambassador', 'Embajador', 'Invita a 20 amigos', 'Crown', 'referral', 'epic', 1000, '{"referrals": 20}'),

-- Premium
('early_adopter', 'Early Adopter', 'Entre los primeros 100 usuarios', 'Zap', 'premium', 'legendary', 500, '{"user_number": 100}'),
('vip', 'VIP', 'Miembro premium activo', 'Sparkles', 'premium', 'epic', 0, '{"is_premium": true}')

ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 15. INSERTAR CHALLENGES INICIALES
-- ==========================================

-- Challenge Diario: Compartir 1 historia
INSERT INTO public.challenges (slug, title, description, type, goal_type, goal_count, points_reward, is_active)
VALUES ('daily_story', 'Historia del Día', 'Comparte 1 historia hoy', 'daily', 'stories', 1, 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Challenge Semanal: 3 tickets
INSERT INTO public.challenges (slug, title, description, type, goal_type, goal_count, points_reward, is_active)
VALUES ('weekly_tickets', 'Fiestero Semanal', 'Usa 3 tickets esta semana', 'weekly', 'tickets', 3, 100, true)
ON CONFLICT (slug) DO NOTHING;

-- Challenge Mensual: Invitar 3 amigos
INSERT INTO public.challenges (slug, title, description, type, goal_type, goal_count, points_reward, premium_days_reward, is_active)
VALUES ('monthly_referrals', 'Trae a tus Amigos', 'Invita a 3 amigos este mes', 'monthly', 'referrals', 3, 300, 7, true)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 16. RLS POLICIES
-- ==========================================

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas Referral Codes
CREATE POLICY "users_can_view_own_code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "anyone_can_verify_codes" ON public.referral_codes
  FOR SELECT USING (is_active = true);

-- Políticas Referrals
CREATE POLICY "users_can_view_own_referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Políticas Badges (todos pueden ver badges)
CREATE POLICY "anyone_can_view_badges" ON public.badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "users_can_view_all_user_badges" ON public.user_badges
  FOR SELECT USING (true);

-- Políticas Challenges
CREATE POLICY "users_can_view_active_challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "users_can_view_own_progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas Streaks
CREATE POLICY "users_can_view_all_streaks" ON public.user_streaks
  FOR SELECT USING (true);

CREATE POLICY "users_can_update_own_streak" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Políticas Rewards
CREATE POLICY "users_can_view_own_rewards" ON public.user_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de Incentivos Instalado:';
  RAISE NOTICE '   📋 Tablas: 8 creadas';
  RAISE NOTICE '   🎯 Badges: % insertados', (SELECT COUNT(*) FROM badges);
  RAISE NOTICE '   🏆 Challenges: % creados', (SELECT COUNT(*) FROM challenges);
  RAISE NOTICE '   ⚙️  Funciones: 5 creadas';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 ¡Sistema listo para aumentar el engagement!';
END $$;
