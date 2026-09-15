import { createClient } from "@supabase/supabase-js";

// Client SERVEUR : clé secrète, contourne les règles de sécurité.
// N'est jamais importé dans un composant qui tourne sur le téléphone.
export function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
