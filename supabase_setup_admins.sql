----------------------------------------------------------------------------------------------------------------
-- 1. CRIAR TABELA DE ADMINISTRADORES
----------------------------------------------------------------------------------------------------------------
-- Cria uma tabela para espelhar os perfis de administrador, útil para listagem no painel
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar segurança a nível de linha para admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Excluir políticas antigas se você for executar este script mais de uma vez
DROP POLICY IF EXISTS "Admins podem ler perfis" ON public.admin_profiles;

-- Política: Administradores logados podem ver a lista de administradores
CREATE POLICY "Admins podem ler perfis" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles));


----------------------------------------------------------------------------------------------------------------
-- 2. FUNÇÃO E GATILHO PARA ADICIONAR ADMINISTRADORES AUTOMATICAMENTE (QUANDO CRIADO)
----------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, email, created_at)
  VALUES (new.id, new.email, new.created_at);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Excluir o gatilho se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Cria o gatilho que executa sempre que um novo usuário for inserido no Auth do Supabase
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


----------------------------------------------------------------------------------------------------------------
-- 3. CRIAR O ADMINISTRADOR PRINCIPAL (Você pode editar e-mail e senha abaixo)
----------------------------------------------------------------------------------------------------------------
-- Garante que temos a extensão pgcrypto instalada para criar as senhas corretamente
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- IMPORTANTE: Mude o "seu_email@aqui.com" e "SuaSenhaAqui"
DO $$
DECLARE
  uid UUID;
BEGIN
  -- Admin 1
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
    ELSE
      -- Update password if user already exists
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;
    END IF;
  END;

  -- Admin 2
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
    ELSE
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;
    END IF;
  END;

  -- Admin 3
  DECLARE
    admin_email TEXT := 'mateusviana@gmail.com';
    admin_password TEXT := 'Mateus12.';
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
    ELSE
      UPDATE auth.users 
      SET encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf'))
      WHERE email = admin_email;
    END IF;
  END;
END
$$;


----------------------------------------------------------------------------------------------------------------
-- 4. FUNÇÃO (RPC) PARA CRIAR NOVOS USUÁRIOS PELO PAINEL
----------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_new_admin(new_email TEXT, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  -- Apenas administradores já definidos podem criar novos administradores
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado. Apenas administradores podem criar novos acessos.';
  END IF;

  -- Checar se o usuário já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'O usuário com este e-mail já existe.';
  END IF;

  uid := gen_random_uuid();
  
  -- Inserindo o usuário na tabela interna do Supabase Auth (criptografando a senha)
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

----------------------------------------------------------------------------------------------------------------
-- 5. FUNÇÃO (RPC) PARA REMOVER/EXCLUIR USUÁRIOS PELO PAINEL
----------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_admin(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  -- Apenas administradores já definidos podem excluir
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado. Apenas administradores podem remover acessos.';
  END IF;

  -- Evita que você apague a si mesmo se estiver logado
  IF target_email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Você não pode remover a si mesmo.';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = target_email;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  -- Apagar o usuário no Auth em cascata também apagará no admin_profiles
  DELETE FROM auth.users WHERE id = target_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_admin(TEXT) TO authenticated;

----------------------------------------------------------------------------------------------------------------
-- 6. RECARREGAR CACHE (Obrigatório para a API PostgREST enxergar as funções)
----------------------------------------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

----------------------------------------------------------------------------------------------------------------
-- FIM DO ARQUIVO
----------------------------------------------------------------------------------------------------------------
