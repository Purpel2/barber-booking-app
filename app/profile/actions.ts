"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { parseWarsawTimeToUTC } from "@/lib/calendar";

/**
 * Funkcja getProfileData pobiera dane profilu zalogowanego użytkownika z bazy danych.
 * @returns Zwraca obiekt zawierający dane użytkownika, jego rezerwacje, dostępnych barberów oraz aktywną subskrypcję, lub null w przypadku błędów.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z pobraniem danych z bazy.
 */
export const getProfileData = cache(async () => {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return null;
        }

        const [dbUser, reservations, barbers, activeSubscription] = await Promise.all([
            prisma.user.findUnique({
                where: { id: authUser.id },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                    phonePrefix: true,
                    phoneBody: true,
                    createdAt: true,
                    favoriteBarberId: true,
                    favoriteBarber: {
                        select: { id: true, name: true, role: true, imageUrl: true }
                    }
                },
            }),
            prisma.reservation.findMany({
                where: { userId: authUser.id },
                include: {
                    barber: { select: { id: true, name: true, role: true, imageUrl: true } },
                    review: { select: { id: true } },
                    services: {
                        select: {
                            id: true,
                            duration: true,
                            priceAtBooking: true,
                            service: {
                                select: { id: true, name: true, imageUrl: true },
                            },
                        },
                    },
                },
                orderBy: { startTime: "desc" },
            }),
            prisma.barber.findMany({
                where: { isActive: true },
                select: { id: true, name: true, role: true, imageUrl: true },
                orderBy: { name: "asc" }
            }),
            prisma.userSubscription.findFirst({
                where: {
                    userId: authUser.id,
                    status: { in: ["ACTIVE", "PAUSED", "CANCELED"] },
                    expiresAt: { gt: new Date() }
                },
                include: { plan: true },
                orderBy: { createdAt: "desc" }
            })
        ]);

        return { user: dbUser, reservations, barbers, activeSubscription };
    } catch (err: unknown) {
        console.error("Błąd getProfileData:", err);
        return null;
    }
});

/**
 *  Funkcja getUserReservations pobiera rezerwacje zalogowanego użytkownika z bazy danych.
 *  @returns Zwraca obiekt zawierający status sukcesu oraz dane rezerwacji.
 *  @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z pobraniem danych z bazy.
 */
export async function getUserReservations() {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, requiresAuth: true, data: [] };
        }

        const reservations = await prisma.reservation.findMany({
            where: { userId: authUser.id },
            include: {
                barber: { select: { id: true, name: true, role: true, imageUrl: true } },
                services: {
                    select: {
                        id: true,
                        duration: true,
                        priceAtBooking: true,
                        service: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { startTime: "desc" },
        });

        return { success: true, data: reservations };
    } catch (err: unknown) {
        console.error("Błąd getUserReservations:", err);
        return { success: false, data: [] };
    }
}

/**
 * Funkcja cancelReservation umożliwia użytkownikowi anulowanie swojej rezerwacji w bazie danych.
 * @param reservationId - ID rezerwacji do anulowania.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z anulowaniem rezerwacji.
 */
export async function cancelReservation(reservationId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                userId: authUser.id,
            },
            select: { id: true, startTime: true, status: true },
        });

        if (!reservation) {
            return { success: false, message: "Nie znaleziono rezerwacji lub brak uprawnień." };
        }

        if (reservation.status === "CANCELLED") {
            return { success: false, message: "Ta rezerwacja została już anulowana." };
        }

        const now = new Date();
        const diffMs = new Date(reservation.startTime).getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 2) {
            return {
                success: false,
                message: "Wizytę można odwołać najpóźniej na 2 godziny przed terminem.",
            };
        }

        await prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: "CANCELLED" },
        });

        revalidatePath("/profile");
        revalidatePath("/reservations");

        return { success: true, message: "Rezerwacja została pomyślnie anulowana." };
    } catch (err: unknown) {
        console.error("Błąd cancelReservation:", err);
        return { success: false, message: "Wystąpił błąd podczas anulowania wizyty." };
    }
}

/**
 * Funkcja rescheduleReservationAction umożliwia użytkownikowi zmianę terminu swojej rezerwacji w bazie danych.
 * @param data - Obiekt zawierający ID rezerwacji, nową datę i nowy czas.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z zmianą terminu rezerwacji.
 */
export async function rescheduleReservationAction(data: {
    reservationId: string;
    newDate: string;
    newTime: string;
}) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: data.reservationId,
                userId: authUser.id,
            },
            include: {
                services: true,
                barber: { select: { id: true, name: true } },
            },
        });

        if (!reservation) {
            return { success: false, message: "Nie znaleziono rezerwacji lub brak uprawnień." };
        }

        if (reservation.status === "CANCELLED") {
            return { success: false, message: "Nie można zmienić terminu anulowanej wizyty." };
        }

        const totalDuration = reservation.services.reduce((acc, s) => acc + (s.duration || 30), 0);
        const maxBuffer = reservation.services.reduce((acc, s) => Math.max(acc, s.bufferTime || 0), 0);

        const newStart = parseWarsawTimeToUTC(data.newDate, data.newTime);
        const newEnd = new Date(newStart.getTime() + (totalDuration + maxBuffer) * 60 * 1000);

        if (newStart < new Date()) {
            return { success: false, message: "Wybrany termin musi być w przyszłości." };
        }

        const conflicting = await prisma.reservation.findFirst({
            where: {
                barberId: reservation.barberId,
                status: { not: "CANCELLED" },
                id: { not: reservation.id },
                startTime: { lt: newEnd },
                endTime: { gt: newStart },
            },
        });

        if (conflicting) {
            return { success: false, message: "Ten termin jest już zajęty u wybranego barbera." };
        }

        await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                startTime: newStart,
                endTime: newEnd,
            },
        });

        try {
            await prisma.notification.create({
                data: {
                    userId: authUser.id,
                    type: "APPOINTMENT",
                    title: "Zmieniono termin wizyty",
                    message: `Nowy termin wizyty u ${reservation.barber.name}: ${data.newDate} o ${data.newTime}.`,
                    linkUrl: "/profile/appointments",
                },
            });
        } catch { }

        revalidatePath("/profile");
        revalidatePath("/profile/appointments");
        revalidatePath("/reservations");

        return { success: true, message: "Termin wizyty został pomyślnie zaktualizowany." };
    } catch (err: unknown) {
        console.error("Błąd rescheduleReservationAction:", err);
        return { success: false, message: "Wystąpił błąd podczas zmiany terminu." };
    }
}

/**
 * Funkcja updateFavoriteBarber umożliwia użytkownikowi ustawienie lub usunięcie preferowanego barbera w bazie danych.
 * @param barberId - ID barbera do ustawienia jako preferowanego, lub null w celu usunięcia preferencji.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją danych w bazie.
 */
export async function updateFavoriteBarber(barberId: string | null) {
    try {
        const supabase = await createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        await prisma.user.update({
            where: { id: authUser.id },
            data: { favoriteBarberId: barberId },
        });

        revalidatePath("/profile");
        revalidatePath("/reservations");

        return { success: true, message: "Zaktualizowano preferowanego barbera." };
    } catch (err: unknown) {
        console.error("Błąd updateFavoriteBarber:", err);
        return { success: false, message: "Wystąpił błąd podczas zapisu." };
    }
}

/**
 * Funkcja updateUserProfile umożliwia użytkownikowi aktualizację danych profilu w bazie danych.
 * @param data - Obiekt zawierający nowe dane profilu użytkownika.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją danych w bazie.
 */
export async function updateUserProfile(data: {
    firstName: string;
    lastName: string;
    phonePrefix?: string;
    phoneBody: string;
}) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const firstName = data.firstName.trim();
        const lastName = data.lastName.trim();
        const fullName = `${firstName} ${lastName}`.trim() || "Klient Salonu";
        const phonePrefix = data.phonePrefix ? data.phonePrefix.trim() : undefined;

        await prisma.user.update({
            where: { id: authUser.id },
            data: {
                firstName,
                lastName,
                fullName,
                ...(phonePrefix ? { phonePrefix } : {}),
                phoneBody: data.phoneBody.trim(),
            },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/settings");

        return { success: true, message: "Dane profilu zostały pomyślnie zaktualizowane." };
    } catch (err: unknown) {
        console.error("Błąd updateUserProfile:", err);
        return { success: false, message: "Wystąpił błąd podczas aktualizacji profilu." };
    }
}

/**
 * Funkcja changeUserPassword umożliwia użytkownikowi zmianę hasła w Supabase Auth.
 * @param newPassword - Nowe hasło użytkownika.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją hasła.
 */
export async function changeUserPassword(newPassword: string) {
    try {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, message: "Nowe hasło musi mieć co najmniej 6 znaków." };
        }

        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            return { success: false, message: error.message || "Błąd podczas zmiany hasła." };
        }

        return { success: true, message: "Hasło zostało pomyślnie zaktualizowane." };
    } catch (err: unknown) {
        console.error("Błąd changeUserPassword:", err);
        return { success: false, message: "Wystąpił błąd podczas zmiany hasła." };
    }
}

/**
 * Funkcja updateUserEmail umożliwia użytkownikowi zmianę adresu e-mail w Supabase Auth i bazie danych.
 * @param newEmail - Nowy adres e-mail użytkownika.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją adresu e-mail.
 */
export async function updateUserEmail(newEmail: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const cleanEmail = newEmail.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes("@")) {
            return { success: false, message: "Wprowadź prawidłowy adres e-mail." };
        }

        if (cleanEmail === authUser.email?.toLowerCase()) {
            return { success: false, message: "Nowy adres jest taki sam jak dotychczasowy." };
        }

        const { error: supaError } = await supabase.auth.updateUser({
            email: cleanEmail,
        });

        if (supaError) {
            return { success: false, message: supaError.message || "Błąd podczas zmiany e-maila." };
        }

        await prisma.user.update({
            where: { id: authUser.id },
            data: { email: cleanEmail },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/settings");

        return {
            success: true,
            message: "Na nowy adres wysłano link potwierdzający. Sprawdź skrzynkę odbiorczą.",
        };
    } catch (err: unknown) {
        console.error("Błąd updateUserEmail:", err);
        return { success: false, message: "Wystąpił błąd podczas aktualizacji adresu e-mail." };
    }
}

/**
 * Funkcja updateUserAvatar umożliwia użytkownikowi aktualizację zdjęcia profilowego (awataru) w bazie danych.
 * @param avatarUrl - URL nowego zdjęcia profilowego lub null w celu usunięcia awatara.
 * @returns Zwraca obiekt zawierający status sukcesu oraz komunikat o wyniku operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją awatara.
 */
export async function updateUserAvatar(avatarUrl: string | null) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        await prisma.user.update({
            where: { id: authUser.id },
            data: { avatarUrl },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/settings");
        revalidatePath("/profile/appointments");
        revalidatePath("/profile/billing");
        revalidatePath("/", "layout");

        return { success: true, message: avatarUrl ? "Zdjęcie profilowe zostało zaktualizowane." : "Awatar został usunięty." };
    } catch (err: unknown) {
        console.error("Błąd updateUserAvatar:", err);
        return { success: false, message: "Wystąpił błąd podczas zapisu avatara." };
    }
}