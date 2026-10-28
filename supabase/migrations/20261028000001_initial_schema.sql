-- ====================================================================
-- Waste Wise — Smart Waste Segregation
-- Migration 01: Initial Database Schema
-- Description: Core tables, foreign keys, triggers, and auto-profile setup
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (1-to-1 extension of Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Waste Categories Table
CREATE TABLE IF NOT EXISTS public.waste_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    disposal_instructions TEXT NOT NULL,
    safety_notes TEXT,
    color_hex TEXT NOT NULL DEFAULT '#10B981',
    icon_name TEXT DEFAULT 'trash-2',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_categories_slug ON public.waste_categories(slug);
CREATE INDEX IF NOT EXISTS idx_waste_categories_active ON public.waste_categories(is_active);

-- 3. Waste Items Table (Rule catalog for waste classification)
CREATE TABLE IF NOT EXISTS public.waste_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    disposal_instructions TEXT NOT NULL,
    safety_notes TEXT,
    classification_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_items_normalized_name ON public.waste_items(normalized_name);
CREATE INDEX IF NOT EXISTS idx_waste_items_category_id ON public.waste_items(category_id);
CREATE INDEX IF NOT EXISTS idx_waste_items_active ON public.waste_items(is_active);
CREATE INDEX IF NOT EXISTS idx_waste_items_aliases ON public.waste_items USING GIN(aliases);

-- 4. Classification Records (User-specific and anonymous classification logs)
CREATE TABLE IF NOT EXISTS public.classification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    waste_item_id UUID REFERENCES public.waste_items(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.waste_categories(id) ON DELETE RESTRICT,
    input_text TEXT NOT NULL,
    classification_method TEXT NOT NULL DEFAULT 'rule_based',
    result_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_records_user_id ON public.classification_records(user_id);
CREATE INDEX IF NOT EXISTS idx_class_records_created_at ON public.classification_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_records_category_id ON public.classification_records(category_id);

-- 5. Learning Modules Table
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_minutes INTEGER NOT NULL DEFAULT 5 CHECK (estimated_minutes > 0),
    points_reward INTEGER NOT NULL DEFAULT 5 CHECK (points_reward >= 0),
    category_tag TEXT DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_modules_slug ON public.learning_modules(slug);
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON public.learning_modules(is_published);

-- 6. Learning Completions Table
CREATE TABLE IF NOT EXISTS public.learning_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_module_completion UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_completions_user ON public.learning_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_module ON public.learning_completions(module_id);

-- 7. Reward Rules Table
CREATE TABLE IF NOT EXISTS public.reward_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Reward Ledger Table (Immutable audit trail of points)
CREATE TABLE IF NOT EXISTS public.reward_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    points_delta INTEGER NOT NULL,
    source_reference TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_ledger_user ON public.reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_idempotency ON public.reward_ledger(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_created_at ON public.reward_ledger(created_at DESC);

-- 9. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- 10. Automated user profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Eco Resident'),
        'user' -- Strictly defaults to 'user', never 'admin'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing immediately after Supabase Auth registers a user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.waste_categories FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.waste_items FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_learning_updated_at BEFORE UPDATE ON public.learning_modules FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON public.reward_rules FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

