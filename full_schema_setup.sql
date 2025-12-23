-- ==========================================
-- FULL DATABASE SETUP SCRIPT
-- ==========================================
-- Run this entire script in the Supabase SQL Editor.
-- It will create all necessary tables and apply the multi-tenancy updates.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Base Tables (IF NOT EXISTS)

-- users_v4
CREATE TABLE IF NOT EXISTS public.users_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    address TEXT,
    "orderCount" NUMERIC DEFAULT 0,
    debt NUMERIC DEFAULT 0,
    "orderCounter" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- managers_v4
CREATE TABLE IF NOT EXISTS public.managers_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- representatives_v4
CREATE TABLE IF NOT EXISTS public.representatives_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    "assignedOrders" NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- orders_v4
CREATE TABLE IF NOT EXISTS public.orders_v4 (
    id TEXT PRIMARY KEY,
    "invoiceNumber" TEXT,
    "trackingId" TEXT,
    "userId" TEXT,
    "customerName" TEXT,
    "operationDate" TEXT,
    "sellingPriceLYD" NUMERIC,
    "remainingAmount" NUMERIC,
    status TEXT,
    "productLinks" TEXT,
    "exchangeRate" NUMERIC,
    "purchasePriceUSD" NUMERIC,
    "downPaymentLYD" NUMERIC,
    "weightKG" NUMERIC,
    "pricePerKilo" NUMERIC,
    "pricePerKiloCurrency" TEXT,
    "customerWeightCost" NUMERIC,
    "customerWeightCostCurrency" TEXT,
    "addedCostUSD" NUMERIC,
    "addedCostNotes" TEXT,
    store TEXT,
    "paymentMethod" TEXT,
    "deliveryDate" TEXT,
    "itemDescription" TEXT,
    "shippingCostLYD" NUMERIC,
    "representativeId" TEXT,
    "representativeName" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "collectedAmount" NUMERIC,
    "customerWeightCostUSD" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tempOrders_v4 (Note the quotes for capitalization)
CREATE TABLE IF NOT EXISTS public."tempOrders_v4" (
    id TEXT PRIMARY KEY,
    "invoiceName" TEXT,
    "totalAmount" NUMERIC,
    "remainingAmount" NUMERIC,
    status TEXT,
    "subOrders" JSONB,
    "createdAt" TEXT,
    "assignedUserId" TEXT,
    "assignedUserName" TEXT,
    "parentInvoiceId" TEXT
);

-- transactions_v4
CREATE TABLE IF NOT EXISTS public.transactions_v4 (
    id TEXT PRIMARY KEY,
    "orderId" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    date TEXT,
    type TEXT,
    status TEXT,
    amount NUMERIC,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- conversations_v4
CREATE TABLE IF NOT EXISTS public.conversations_v4 (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "userAvatar" TEXT,
    "lastMessage" TEXT,
    "lastMessageTime" TEXT,
    "unreadCount" NUMERIC,
    messages JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- creditors_v4
CREATE TABLE IF NOT EXISTS public.creditors_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    currency TEXT,
    "totalDebt" NUMERIC,
    "contactInfo" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- deposits_v4
CREATE TABLE IF NOT EXISTS public.deposits_v4 (
    id TEXT PRIMARY KEY,
    "receiptNumber" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    amount NUMERIC,
    date TEXT,
    description TEXT,
    status TEXT,
    "representativeId" TEXT,
    "representativeName" TEXT,
    "collectedBy" TEXT,
    "collectedDate" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- settings_v4
CREATE TABLE IF NOT EXISTS public.settings_v4 (
    id TEXT PRIMARY KEY,
    "exchangeRate" NUMERIC,
    "pricePerKiloLYD" NUMERIC,
    "pricePerKiloUSD" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Multi-Tenancy Tables

-- Tenants
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 14,
    status TEXT CHECK (status IN ('active', 'used', 'expired')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_by_tenant_id UUID REFERENCES public.tenants(id)
);

-- 4. Add tenant_id to all base tables
-- We use a DO block to add columns safely without errors if they already exist

DO $$
BEGIN
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
END $$;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.users_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representatives_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tempOrders_v4" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditors_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- 6. Create Default Policies (Allow all for simplify, refine later)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for all users" ON %I', t);
        EXECUTE format('CREATE POLICY "Enable all access for all users" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;
