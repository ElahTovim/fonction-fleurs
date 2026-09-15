"use client";
import { createClient } from "@supabase/supabase-js";

// Client TÉLÉPHONE : clé publique, ne peut que lire la table games.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
