-- Execute este código no SQL Editor do seu Supabase para criar/atualizar a tabela de leads

-- 1. Criar a tabela se ela ainda não existir
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    vehicle TEXT,
    plate TEXT,
    city TEXT, -- Adicionado o campo de cidade
    date TEXT,
    session_id TEXT UNIQUE
);

-- 2. Caso a tabela já exista mas não tenha a coluna "city"
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;

-- 3. Ativar a segurança a nível de linha (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso

-- Permitir inserção pública (qualquer um do site pode criar um lead)
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT 
    WITH CHECK (true);

-- Permitir que leads atualizem a si mesmos enquanto o usuário estiver na sessão (baseado no onConflict: 'session_id')
DROP POLICY IF EXISTS "Allow public update to leads" ON public.leads;
CREATE POLICY "Allow public update to leads" ON public.leads
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Permitir que administradores logados tenham controle total (ver, editar, apagar)
DROP POLICY IF EXISTS "Allow admins to view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated admins to delete leads" ON public.leads;
DROP POLICY IF EXISTS "Full access for authenticated users" ON public.leads;
CREATE POLICY "Full access for authenticated users" ON public.leads
    FOR ALL
    USING (auth.role() = 'authenticated');

-- RECARREGAR O CACHE
NOTIFY pgrst, 'reload schema';
