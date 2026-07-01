import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para uso em Client Components (formulário de login, etc.)

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
