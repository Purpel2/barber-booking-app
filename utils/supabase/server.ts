import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'


/**
 * Funkcja createClient tworzy instancję klienta Supabase przeznaczoną dla środowiska serwerowego,
 * wykorzystując zmienne środowiskowe oraz bezpieczny dostęp do magazynu ciasteczek (cookies) Next.js.
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                //pobieranie ciasteczek z zapytania
                getAll() {
                    return cookieStore.getAll()
                },
                //ustawienie ciasteczek
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        //obslugiwane przez proxy.ts / server component
                    }
                },
            },
        }
    )
}