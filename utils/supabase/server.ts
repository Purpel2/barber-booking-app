import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

//funkcja tworzaca klienta supabase z obsluga ciasteczek do pracy po stronie serwera 
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                //pobieranie ciasteczek z zapytania
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                //ustawienie ciasteczek
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        //obslugiwane przez proxy.ts
                    }
                },
                //usuwanie ciasteczek
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        //obslugiwane przez proxy.ts
                    }
                },
            },
        }
    )
}