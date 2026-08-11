import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://jgddhulpofekpdhnzwul.supabase.co/rest/v1/";
export const SUPABASE_PUBLIC_KEY = "sb_publishable_FJzanyoUjjgVojcCZPSCmA_QSKY8Sse";

// Strip /rest/v1/ suffix so Supabase Auth and REST clients target the project root domain
const baseUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

export const supabase = createClient(baseUrl, SUPABASE_PUBLIC_KEY);

export default supabase;
