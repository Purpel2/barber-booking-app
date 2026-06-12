"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function registerUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phonePrefix = formData.get("phonePrefix") as string;
    let phoneBody = formData.get("phoneBody") as string;

    //walidacja formularza
    if (!email || !password || !firstName || !lastName || !phoneBody || !phonePrefix) {
        return { error: "Wszystkie pola są wymagane!" };
    }

    if (password !== confirmPassword) {
        return { error: "Hasła nie są identyczne!" };
    }

    if (password.length < 6) {
        return { error: "Hasło musi mieć co najmniej 6 znaków!" };
    }

    phoneBody = phoneBody.replace(/[\s-]/g, "");     //usuwanie spacji/myslnikow z nr telefonu

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({ //rejestracja konta w supabase auth
            email,
            password,
        });

        if (authError) {
            return { error: authError.message };
        }

        if (!authData.user) {
            return { error: "Coś poszło nie tak podczas rejestracji." };
        }


        await prisma.user.create({ //zapis danych uzytkownika do bazy
            data: {
                id: authData.user.id, //jedno id dla supabase auth i naszej bazy danych
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
//logowanie 
export async function loginUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Adres e-mail i hasło są wymagane!" };
    }

    try {
        const supabase = await createClient(); //logowanie uzytkownika przez supabase auth
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === "Invalid login credentials") {
                return { error: "Błędny adres e-mail lub hasło." };
            }
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Wystąpił błąd serwera. Spróbuj ponownie później." };
    }
}
//wylogowanie
export async function logoutUser() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}