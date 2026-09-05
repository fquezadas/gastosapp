-- ========================================================
-- GASTOSAPP - SUPABASE MULTI-TENANT DATABASE SCHEMA (RLS)
-- ========================================================

-- 1. Tabla de Gastos / Transacciones por usuario
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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

-- Si la columna user_id no existe por migraciones previas, agregarla
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='user_id') THEN
    ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- 2. Tabla de Configuración de Presupuesto por usuario
CREATE TABLE IF NOT EXISTS budget_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  daily_limit NUMERIC NOT NULL DEFAULT 10000,
  alert_at_80 BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si budget_settings tenía columna id de esquema previo, adaptar
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budget_settings' AND column_name='user_id') THEN
    ALTER TABLE budget_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- 3. Tabla de Retos de Ahorro por usuario
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- Si la columna user_id no existía en challenges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='challenges' AND column_name='user_id') THEN
    ALTER TABLE challenges ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD Y AISLAMIENTO
-- ========================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores
DROP POLICY IF EXISTS "Permitir todo acceso a transacciones" ON transactions;
DROP POLICY IF EXISTS "Permitir todo acceso a presupuesto" ON budget_settings;
DROP POLICY IF EXISTS "Permitir todo acceso a retos" ON challenges;
DROP POLICY IF EXISTS "Usuarios gestionan sus propias transacciones" ON transactions;
DROP POLICY IF EXISTS "Usuarios gestionan su propio presupuesto" ON budget_settings;
DROP POLICY IF EXISTS "Usuarios gestionan sus propios retos" ON challenges;

-- Políticas multi-usuario estrictas (Cada usuario SOLO ve y manipula sus datos)
CREATE POLICY "Usuarios gestionan sus propias transacciones" 
  ON transactions FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan su propio presupuesto" 
  ON budget_settings FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus propios retos" 
  ON challenges FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
