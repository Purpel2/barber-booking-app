import { createBrowserClient } from '@supabase/ssr'

/**
 * Funkcja createClient tworzy instancję klienta Supabase dla przeglądarki, używając zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.
 * 
 * @returns Instancja klienta Supabase dla przeglądarki.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )
}