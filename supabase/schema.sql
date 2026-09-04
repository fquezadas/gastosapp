-- ==========================================
-- GASTOSAPP - SUPABASE DATABASE SCHEMA
-- ==========================================

-- 1. Tabla de Gastos / Transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  place TEXT,
  time TEXT,
  category TEXT NOT NULL CHECK (category IN ('cafe', 'snacks', 'bebidas', 'antojos', 'transporte', 'otros')),
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_today BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Configuración de Presupuesto
CREATE TABLE IF NOT EXISTS budget_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  daily_limit NUMERIC NOT NULL DEFAULT 10000,
  alert_at_80 BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Retos de Ahorro
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT,
  icon TEXT,
  current_day INT DEFAULT 0,
  total_days INT NOT NULL DEFAULT 7,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'suggested')),
  current_amount NUMERIC DEFAULT 0,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  reward_note TEXT,
  icon_bg_class TEXT,
  icon_text_class TEXT,
  est_monthly_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para desarrollo/uso personal
CREATE POLICY "Permitir todo acceso a transacciones" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a presupuesto" ON budget_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a retos" ON challenges FOR ALL USING (true) WITH CHECK (true);

-- Insertar configuración inicial por defecto
INSERT INTO budget_settings (id, daily_limit, alert_at_80)
VALUES ('default', 10000, true)
ON CONFLICT (id) DO NOTHING;

-- Insertar retos iniciales
INSERT INTO challenges (id, title, subtitle, category, icon, current_day, total_days, status, current_amount, target_amount, reward_note, icon_bg_class, icon_text_class, est_monthly_savings)
VALUES
  ('ch-1', 'Reto 7 días sin antojos', 'Día 4 de 7 completados', 'antojos', 'local_cafe', 4, 7, 'active', 15000, 26000, 'Faltan 3 días para reclamar recompensa', 'bg-[#ffdcc5]/50', 'text-[#944a00]', 60000),
  ('ch-2', 'Fin de semana sin delivery', 'Día 2 de 2 completados', 'delivery', 'two_wheeler', 2, 2, 'completed', 45000, 45000, '¡Recompensa desbloqueada!', 'bg-[#dee8ff]', 'text-[#006c49]', 45000),
  ('sug-1', 'Adiós Botellas de Plástico', 'Ahorra llevando tu propio termo', 'bebidas', 'water_drop', 0, 30, 'suggested', 0, 20000, 'Ahorro estimado mensual', 'bg-[#ffdcc5]/50', 'text-[#944a00]', 20000),
  ('sug-2', 'Desafío Cero Suscripciones Fantasmas', 'Cancela lo que no usas', 'servicios', 'bolt', 0, 1, 'suggested', 0, 50000, 'Ahorro recurrente mensual', 'bg-[#6ffbbe]/30', 'text-[#006c49]', 50000)
ON CONFLICT (id) DO NOTHING;
