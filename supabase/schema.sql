-- =============================================
-- Dim Fin Database Schema for Supabase
-- =============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/efmekovfwjccxtoscxkl/sql/new

-- =============================================
-- 1. PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    currency TEXT DEFAULT 'IDR',
    date_format TEXT DEFAULT 'dd/MM/yyyy',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Tag',
    color TEXT NOT NULL DEFAULT '#6366F1',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- =============================================
-- 3. ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'credit_card', 'cash', 'investment', 'other')),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    color TEXT NOT NULL DEFAULT '#1E40AF',
    icon TEXT NOT NULL DEFAULT 'Wallet',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies for accounts
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.accounts
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);

-- =============================================
-- 5. BUDGETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')) DEFAULT 'monthly',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policies for budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    deadline DATE,
    category TEXT NOT NULL CHECK (category IN ('emergency_fund', 'vacation', 'house', 'car', 'education', 'retirement', 'other')),
    color TEXT NOT NULL DEFAULT '#10B981',
    icon TEXT NOT NULL DEFAULT 'Target',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policies for goals
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. BILL REMINDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bill_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    auto_pay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bill_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for bill_reminders
CREATE POLICY "Users can view own bill reminders" ON public.bill_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bill reminders" ON public.bill_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bill reminders" ON public.bill_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bill reminders" ON public.bill_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. FUNCTION: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 9. INSERT DEFAULT CATEGORIES
-- =============================================
INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NULL, 'Gaji', 'Briefcase', '#10B981', 'income', TRUE),
    (NULL, 'Freelance', 'Laptop', '#3B82F6', 'income', TRUE),
    (NULL, 'Investasi', 'TrendingUp', '#8B5CF6', 'income', TRUE),
    (NULL, 'Bonus', 'Gift', '#EC4899', 'income', TRUE),
    (NULL, 'Makan & Minum', 'Utensils', '#F59E0B', 'expense', TRUE),
    (NULL, 'Transportasi', 'Car', '#6366F1', 'expense', TRUE),
    (NULL, 'Belanja', 'ShoppingBag', '#EC4899', 'expense', TRUE),
    (NULL, 'Hiburan', 'Film', '#14B8A6', 'expense', TRUE),
    (NULL, 'Utilitas', 'Zap', '#F97316', 'expense', TRUE),
    (NULL, 'Kesehatan', 'Heart', '#EF4444', 'expense', TRUE),
    (NULL, 'Tempat Tinggal', 'Home', '#0EA5E9', 'expense', TRUE),
    (NULL, 'Pendidikan', 'GraduationCap', '#8B5CF6', 'expense', TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity_type TEXT NOT NULL,  -- 'transaction', 'account', 'budget', 'goal', 'bill'
    entity_id UUID NOT NULL,
    entity_name TEXT,           -- Readable name for display
    details JSONB,              -- Optional: additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- =============================================
-- 11. STORAGE BUCKET FOR AVATARS
-- =============================================
-- NOTE: Create the 'avatars' bucket manually in Supabase Dashboard:
-- 1. Go to Storage > New bucket
-- 2. Name: avatars
-- 3. Check "Public bucket"
-- 4. Click "Create bucket"

-- Then run these policies:

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update/overwrite their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================
-- DONE! Your database is ready.
-- =============================================
