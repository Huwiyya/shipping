-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Licenses Table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 14,
    status TEXT CHECK (status IN ('active', 'used', 'expired')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_by_tenant_id UUID REFERENCES public.tenants(id)
);

-- 3. Add tenant_id to existing tables
-- users_v4
ALTER TABLE public.users_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- managers_v4
ALTER TABLE public.managers_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- representatives_v4
ALTER TABLE public.representatives_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- orders_v4
ALTER TABLE public.orders_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- tempOrders_v4
ALTER TABLE public."tempOrders_v4" ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- transactions_v4
ALTER TABLE public.transactions_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- conversations_v4
ALTER TABLE public.conversations_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- creditors_v4
ALTER TABLE public.creditors_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- deposits_v4
ALTER TABLE public.deposits_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
-- settings_v4
ALTER TABLE public.settings_v4 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 4. Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for new tables (Open for now, similar to others)
CREATE POLICY "Enable all access for all users" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.licenses FOR ALL USING (true) WITH CHECK (true);
