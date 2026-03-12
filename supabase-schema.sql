-- 1. EXTENSIONES Y FUNCIONES BASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. TABLA DE PERFILES (VINCULADA A AUTH.USERS)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  user_role text DEFAULT 'buyer' CHECK (user_role IN ('buyer', 'seller', 'admin')),
  category text CHECK (category IN ('Marketing', 'UX/UI', 'Audiovisual', 'General')),
  is_verified boolean DEFAULT false,
  bio text,
  rating decimal DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- 3. TABLA DE LEADS (INTERÉS DE COMPRA)
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  mensaje text NOT NULL,
  servicio_interes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- 4. TABLA DE TRANSACCIONES (ESCROW SIMPLE)
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  amount decimal NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'disputed', 'refunded')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para transactions
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- 5. SEGURIDAD DE FILA (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS PARA LEADS
CREATE POLICY "Vendedores ven leads recibidos" ON leads FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Compradores ven leads enviados" ON leads FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Compradores pueden enviar leads" ON leads FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- POLÍTICAS PARA TRANSACCIONES (SEGURIDAD AI & ADMIN)
CREATE POLICY "Buyers can see their own transactions" ON transactions FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can see their own transactions" ON transactions FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all transactions" ON transactions
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin'));
