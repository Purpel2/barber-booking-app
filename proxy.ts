import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

//glowna funkcja posredniczaca, sprawdza czy uzytkownik jest zalogowany i przekierowuje go na odpowiednie strony
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ //przekazujemy naglowki z zapytania, zeby supabase mogl odczytac ciasteczka
        request: { headers: request.headers },
    })

    //inicjalizacja klienta supabase z obsluga ciasteczek
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                get(name: string) { return request.cookies.get(name)?.value }, //pobieranie ciasteczek z zapytania
                set(name: string, value: string, options: CookieOptions) { //zapisywanie ciasteczek, zeby supabase mogl poprawnie zarzadzac sesja uzytkownika
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) { //usuwanie ciasteczek po wylogowaniu
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )
    //pobieramy aktualnie zalogowanego uzytkownika
    const { data: { user } } = await supabase.auth.getUser()

    //jesli niezalogowany probuje wejsc na dashboard, przekierowujemy go na strone logowania
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    //jesli zalogowany probuje wejsc na strone logowania lub rejestracji, przekierowujemy go na strone glowna
    if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register"))) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return response
}

// okresla ktore pliki maja byc ignorowane przy sprawdzaniu sesji
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}