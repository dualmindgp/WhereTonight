-- ==========================================
-- SISTEMA DE AFILIADOS - MIGRACIÓN
-- ==========================================
-- ⚠️ NO EJECUTAR TODAVÍA - ARCHIVO GUARDADO PARA FUTURO
-- ⚠️ Este sistema se activará en una fase posterior
-- ==========================================
-- Este script crea las tablas necesarias para el sistema de afiliados
-- SOLO ejecutar cuando se decida activar el sistema de monetización

-- ==========================================
-- 1. TABLA DE PARTNERS/PLATAFORMAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.affiliate_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_endpoint TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_partners_slug ON public.affiliate_partners(slug);

-- ==========================================
-- 2. TABLA DE LINKS DE AFILIADO POR VENUE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.venue_affiliate_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  affiliate_url TEXT NOT NULL,
  event_id TEXT,
  event_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, partner_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_affiliate_links_venue_id ON public.venue_affiliate_links(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_affiliate_links_partner_id ON public.venue_affiliate_links(partner_id);

-- ==========================================
-- 3. TABLA DE TRACKING DE CLICKS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.venue_affiliate_links(id) ON DELETE SET NULL,
  
  click_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON public.affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_venue_id ON public.affiliate_clicks(venue_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_click_token ON public.affiliate_clicks(click_token);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_clicks(clicked_at DESC);

-- ==========================================
-- 4. TABLA DE CONVERSIONES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE CASCADE,
  
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  external_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_click_id ON public.affiliate_conversions(click_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON public.affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_converted_at ON public.affiliate_conversions(converted_at DESC);

-- ==========================================
-- 5. TABLA DE PAGOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  payment_method TEXT,
  payment_reference TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_partner_id ON public.affiliate_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_period ON public.affiliate_payouts(period_start, period_end);

-- ==========================================
-- RLS POLICIES
-- ==========================================

ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliate Partners (público para lectura)
CREATE POLICY "anyone_can_view_active_partners" ON public.affiliate_partners
  FOR SELECT USING (is_active = true);

-- Venue Affiliate Links (público para lectura)
CREATE POLICY "anyone_can_view_active_links" ON public.venue_affiliate_links
  FOR SELECT USING (is_active = true);

-- Affiliate Clicks (solo el usuario puede ver sus propios clicks)
CREATE POLICY "users_can_view_own_clicks" ON public.affiliate_clicks
  FOR SELECT USING (auth.uid() = user_id);

-- Affiliate Conversions (solo admin puede ver)
CREATE POLICY "service_role_can_manage_conversions" ON public.affiliate_conversions
  FOR ALL USING (true);

-- Affiliate Payouts (solo admin puede ver)
CREATE POLICY "service_role_can_manage_payouts" ON public.affiliate_payouts
  FOR ALL USING (true);

-- ==========================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ==========================================

CREATE TRIGGER update_affiliate_partners_updated_at
    BEFORE UPDATE ON public.affiliate_partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_affiliate_links_updated_at
    BEFORE UPDATE ON public.venue_affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_conversions_updated_at
    BEFORE UPDATE ON public.affiliate_conversions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_payouts_updated_at
    BEFORE UPDATE ON public.affiliate_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ==========================================

-- Insertar partners principales
INSERT INTO public.affiliate_partners (name, slug, commission_rate, is_active)
VALUES 
  ('Fever', 'fever', 12.00, true),
  ('Xceed', 'xceed', 15.00, true),
  ('Eventbrite', 'eventbrite', 10.00, true),
  ('Tablelist', 'tablelist', 12.00, true)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- SELECT * FROM affiliate_partners;
-- SELECT * FROM venue_affiliate_links LIMIT 5;
-- SELECT * FROM affiliate_clicks LIMIT 5;
-- SELECT * FROM affiliate_conversions LIMIT 5;
