-- ==============================================================================
-- SCRIPT UNIFICADO SUPABASE - PROSUL WEB
-- Cole este código inteiro de uma vez no seu SQL Editor do Supabase
-- ==============================================================================

-- 1. DELETAR DE ANTEMÃO O GATILHO ANTIGO PARA EVITAR CONFLITOS DE COMPILAÇÃO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- 2. CRIAR AS TABELAS DO BANCO DE DADOS (SE NÃO EXISTIREM)

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    vehicle TEXT,
    plate TEXT,
    city TEXT,
    date TEXT,
    called BOOLEAN DEFAULT false,
    session_id TEXT UNIQUE
);

-- Garantir coluna cidade caso a tabela já exista
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS public.config (
    id INT PRIMARY KEY DEFAULT 1,
    whatsapp TEXT,
    whatsapp_options JSONB DEFAULT '[]'::jsonb,
    whatsapp_contact TEXT,
    benefits JSONB,
    google_sheets_url TEXT,
    google_sheets_active BOOLEAN DEFAULT false,
    "cleanCarImg" TEXT,
    "crashedCarImg" TEXT
);

-- Garantir que todos os campos existem se a tabela de configurações já existir
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS whatsapp_options JSONB;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS whatsapp_contact TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS benefits JSONB;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS google_sheets_url TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS google_sheets_active BOOLEAN DEFAULT false;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "cleanCarImg" TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "crashedCarImg" TEXT;

-- Tabela de Perfis de Administradores
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. HABILITAR SEGURANÇA EM NÍVEL DE LINHA (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- 4. CONFIGURAR POLÍTICAS DE ACESSO (POLICIES)

-- Políticas para LEADS
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to leads" ON public.leads;
CREATE POLICY "Allow public update to leads" ON public.leads
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select to leads" ON public.leads;
CREATE POLICY "Allow public select to leads" ON public.leads
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Full access for authenticated users" ON public.leads;
CREATE POLICY "Full access for authenticated users" ON public.leads
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Políticas para CONFIG
DROP POLICY IF EXISTS "Allow public read config" ON public.config;
CREATE POLICY "Allow public read config" ON public.config
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow admins to manage config" ON public.config;
CREATE POLICY "Allow admins to manage config" ON public.config
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Políticas para ADMIN_PROFILES
DROP POLICY IF EXISTS "Admins podem ler perfis" ON public.admin_profiles;
CREATE POLICY "Admins podem ler perfis" ON public.admin_profiles 
    FOR SELECT 
    USING (auth.role() = 'authenticated');


-- 5. RECONSTRUIR GATILHOS (TRIGGERS) PARA SINCRONIZAÇÃO AUTOMÁTICA DE ADMINS
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, email, created_at)
  VALUES (new.id, new.email, new.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 6. CRIAR FUNÇÃO RPC PARA ADICIONAR ADMINISTRADORES VIA PAINEL
CREATE OR REPLACE FUNCTION public.create_new_admin(new_email TEXT, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado. Apenas administradores podem criar novos acessos.';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'O usuário com este e-mail já existe.';
  END IF;

  uid := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', new_email, extensions.crypt(new_password, extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''
  );
  
  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid::text, uid, format('{"sub":"%s","email":"%s"}', uid::text, new_email)::jsonb, 'email', NOW(), NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_new_admin(TEXT, TEXT) TO authenticated;


-- 7. CRIAR FUNÇÃO RPC PARA DELETAR ADMINISTRADORES VIA PAINEL
CREATE OR REPLACE FUNCTION public.delete_admin(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado. Apenas administradores podem remover acessos.';
  END IF;

  IF target_email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Você não pode remover a si mesmo.';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = target_email;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  DELETE FROM auth.users WHERE id = target_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_admin(TEXT) TO authenticated;


-- 8. GARANTIR EXTENSÃO PG_CRYPTO INSTALADA
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


-- 9. CONFIGURAR E DELETAR/ATUALIZAR CONTAS DE ADMINISTRADORES ATUAIS
DO $$
DECLARE
  uid UUID;
BEGIN
  -- A. REMOVER ADMINISTRADORES ANTIGOS (Ex: mateusviana@gmail.com)
  -- Como a tabela 'admin_profiles' tem FK com 'ON DELETE CASCADE', este delete limpará tudo automaticamente.
  DELETE FROM auth.users WHERE email = 'mateusviana@gmail.com';

  -- B. CADASTRAR OU ATUALIZAR: lucasconstantinoprosul@gmail.com
  DECLARE
    admin_email TEXT := 'lucasconstantinoprosul@gmail.com';
    admin_password TEXT := 'prosul123456';
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
      uid := gen_random_uuid();
      
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', admin_email, extensions.crypt(admin_password, extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''
      );
      
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), uid::text, uid, format('{"sub":"%s","email":"%s"}', uid::text, admin_email)::jsonb, 'email', NOW(), NOW(), NOW()
      );

      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    ELSE
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;
      
      SELECT id INTO uid FROM auth.users WHERE email = admin_email;
      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END;

  -- C. CADASTRAR OU ATUALIZAR: brtreino@gmail.com
  DECLARE
    admin_email TEXT := 'brtreino@gmail.com';
    admin_password TEXT := 'Escroto12.';
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
      uid := gen_random_uuid();
      
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', admin_email, extensions.crypt(admin_password, extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''
      );
      
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), uid::text, uid, format('{"sub":"%s","email":"%s"}', uid::text, admin_email)::jsonb, 'email', NOW(), NOW(), NOW()
      );

      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    ELSE
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;

      SELECT id INTO uid FROM auth.users WHERE email = admin_email;
      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END;

  -- D. CADASTRAR OU ATUALIZAR: admincaio@prosul.com
  DECLARE
    admin_email TEXT := 'admincaio@prosul.com';
    admin_password TEXT := 'Santacruz12.';
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
      uid := gen_random_uuid();
      
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', admin_email, extensions.crypt(admin_password, extensions.gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''
      );
      
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), uid::text, uid, format('{"sub":"%s","email":"%s"}', uid::text, admin_email)::jsonb, 'email', NOW(), NOW(), NOW()
      );

      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    ELSE
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;

      SELECT id INTO uid FROM auth.users WHERE email = admin_email;
      INSERT INTO public.admin_profiles (id, email, created_at)
      VALUES (uid, admin_email, NOW())
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END;

END
$$;


-- 10. GARANTIR LINHA DE CONFIGURAÇÃO PADRÃO SE NÃO EXISTIR SIMULANDO COMPILAÇÃO DINÂMICA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.config WHERE id = 1) THEN
    EXECUTE 'INSERT INTO public.config (id, whatsapp, benefits, google_sheets_url, google_sheets_active) VALUES (1, ''5581900000000'', ''[]''::jsonb, '''', false)';
  END IF;
END
$$;


-- 11. RECARREGAR O CACHE DO POSTGREST PARA GARANTIR MAPEAMENTO DE ROTAS E REGRAS
NOTIFY pgrst, 'reload schema';
