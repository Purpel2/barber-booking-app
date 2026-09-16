"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

/**
 * Funkcja registerUser przyjmuje dane formularza rejestracyjnego (FormData) i wykonuje proces rejestracji nowego użytkownika.
 * Najpierw pobiera wartości z formularza, takie jak email, hasło, potwierdzenie hasła, imię, nazwisko oraz numer telefonu.
 * Następnie sprawdza, czy wszystkie wymagane pola są wypełnione oraz czy hasła są zgodne i spełniają minimalne wymagania długości.
 * Jeśli wszystkie warunki są spełnione, funkcja tworzy nowego użytkownika w systemie uwierzytelniania Supabase, a następnie zapisuje dane użytkownika w bazie danych przy użyciu Prisma.
 * W przypadku wystąpienia błędów podczas rejestracji lub zapisu danych, funkcja zwraca odpowiedni komunikat o błędzie.
 * W przypadku powodzenia, funkcja zwraca informację o sukcesie rejestracji.
 */
export async function registerUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phonePrefix = formData.get("phonePrefix") as string;
    let phoneBody = formData.get("phoneBody") as string;

    if (!email || !password || !firstName || !lastName || !phoneBody || !phonePrefix) {
        return { error: "Wszystkie pola są wymagane!" };
    }

    if (password !== confirmPassword) {
        return { error: "Hasła nie są identyczne!" };
    }

    if (password.length < 6) {
        return { error: "Hasło musi mieć co najmniej 6 znaków!" };
    }

    phoneBody = phoneBody.replace(/[\s-]/g, "");

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return { error: authError.message };
        }

        if (!authData.user) {
            return { error: "Coś poszło nie tak podczas rejestracji." };
        }

        // Tworzenie profilu użytkownika w bazie danych przy użyciu Prisma
        await prisma.user.create({
            data: {
                id: authData.user.id,
                email: email,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                fullName: fullName,
                phonePrefix: phonePrefix,
                phoneBody: phoneBody,
                role: "USER",
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Wystąpił błąd serwera. Spróbuj ponownie później." };
    }
}

/**
 * Funkcja loginUser przyjmuje dane formularza logowania (FormData) i wykonuje proces logowania istniejącego użytkownika.
 * Najpierw pobiera wartości z formularza, takie jak email i hasło. Następnie sprawdza, czy wszystkie wymagane pola są wypełnione.
 * Jeśli wszystkie warunki są spełnione, funkcja loguje użytkownika w systemie uwierzytelniania Supabase.
 * W przypadku wystąpienia błędów podczas logowania lub pobierania danych użytkownika, funkcja zwraca odpowiedni komunikat o błędzie.
 * W przypadku powodzenia, funkcja zwraca informację o sukcesie logowania.
 */
export async function loginUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Adres e-mail i hasło są wymagane!" };
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === "Invalid login credentials") {
                return { error: "Błędny adres e-mail lub hasło." };
            }
            return { error: error.message };
        }

        if (!data.user) {
            return { error: "Nie udało się pobrać danych użytkownika." };
        }

        const existingProfile = await prisma.user.findUnique({
            where: { id: data.user.id },
        });

        if (!existingProfile) {
            const meta = data.user.user_metadata || {};
            const firstName = meta.firstName || "Klient";
            const lastName = meta.lastName || "FreshCut";

            await prisma.user.create({
                data: {
                    id: data.user.id,
                    email: data.user.email ?? email,
                    firstName: firstName,
                    lastName: lastName,
                    fullName: `${firstName} ${lastName}`,
                    phonePrefix: meta.phonePrefix || "+48",
                    phoneBody: meta.phoneBody || "000000000",
                    role: "USER",
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Wystąpił błąd serwera. Spróbuj ponownie później." };
    }
}
/**
 * Funkcja logoutUser wykonuje proces wylogowania obecnego użytkownika.
 * Pobiera klienta Supabase i wywołuje metodę signOut, która usuwa dane logowania z sesji.
 */
export async function logoutUser() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}