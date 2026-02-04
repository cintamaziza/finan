import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: Log if Supabase is configured
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase not configured! Check your .env file.');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
} else {
    console.log('✅ Supabase configured:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl && supabaseAnonKey &&
        supabaseUrl !== 'your_supabase_project_url' &&
        supabaseAnonKey !== 'your_supabase_anon_key';
};
