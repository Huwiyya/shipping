import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer Service Role Key on server for admin access, fallback to Anon Key on client
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Sync will be disabled.');
}

// Create client with appropriate key. 
// Note: Service Role Key bypasses RLS. Ensure this client is used securely.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
    auth: {
        persistSession: false, // For server-side admin tasks, we usually don't need persistent auth sessions
        autoRefreshToken: false,
    }
});
