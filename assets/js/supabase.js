const SUPABASE_URL = "https://xkrifsualjjsxmxnmqkc.supabase.co";

const SUPABASE_KEY = "sb_publishable_uLRvSXTVsJVJGpZJKXnEHA_nUUo82Rz";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

console.log("Supabase conectado!");