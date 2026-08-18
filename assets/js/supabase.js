const SUPABASE_URL = "https://xkrifsualjjsxmxnmqkc.supabase.co";

const SUPABASE_KEY = "sb_publishable_uLRvSXTVsJVJGpZJKXnEHA_nUUo82Rz";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase conectado!");