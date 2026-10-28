-- ====================================================================
-- Waste Wise — Smart Waste Segregation
-- Migration 02: Row Level Security (RLS) Policies & Access Controls
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Helper function to check if the current request is from an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Profiles Policies
-- Users can view their own profile; admins can view all profiles
CREATE POLICY "Users can view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Users can update only their own profile, but cannot elevate their role
CREATE POLICY "Users can update own profile non-role fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (
            role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
            OR public.is_admin()
        )
    );

-- Admins can update any profile (e.g. promoting users)
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- 3. Waste Categories Policies
-- Everyone (anonymous + authenticated) can view active categories
CREATE POLICY "Public read access for active categories"
    ON public.waste_categories FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Only admins can modify categories
CREATE POLICY "Admins can manage categories"
    ON public.waste_categories FOR ALL
    USING (public.is_admin());

-- 4. Waste Items Policies
-- Everyone can view active waste items and classification rules
CREATE POLICY "Public read access for active waste items"
    ON public.waste_items FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Only admins can insert, update, delete waste items
CREATE POLICY "Admins can manage waste items"
    ON public.waste_items FOR ALL
    USING (public.is_admin());

-- 5. Classification Records Policies
-- Users can view their own history; admins can view all
CREATE POLICY "Users can view own classification records"
    ON public.classification_records FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert their own classification records (or anonymous)
CREATE POLICY "Users can insert classification records"
    ON public.classification_records FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. Learning Modules Policies
-- Public can view published learning content
CREATE POLICY "Public read access for published modules"
    ON public.learning_modules FOR SELECT
    USING (is_published = true OR public.is_admin());

-- Admins can manage learning modules
CREATE POLICY "Admins can manage learning modules"
    ON public.learning_modules FOR ALL
    USING (public.is_admin());

-- 7. Learning Completions Policies
-- Users can view their own completions
CREATE POLICY "Users can view own completions"
    ON public.learning_completions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert their own module completions
CREATE POLICY "Users can record own completions"
    ON public.learning_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 8. Reward Rules Policies
-- Everyone can view active reward rules
CREATE POLICY "Public read access for active reward rules"
    ON public.reward_rules FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Admins can manage reward rules
CREATE POLICY "Admins can manage reward rules"
    ON public.reward_rules FOR ALL
    USING (public.is_admin());

-- 9. Reward Ledger Policies
-- Users can view their own ledger history; Admins can view all
CREATE POLICY "Users can view own reward ledger entries"
    ON public.reward_ledger FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- DIRECT USER WRITES TO REWARD LEDGER ARE FORBIDDEN
-- All reward credits must be executed via the trusted Express backend using Service Role or server-side functions.
-- This guarantees zero tampering or arbitrary point awards from browser clients.

-- 10. Admin Audit Logs Policies
-- Only admins can read audit logs
CREATE POLICY "Only admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

