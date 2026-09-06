"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// pobieranie danych profilu uzytkownika z jego rezerwacjami
export async function getProfileData() {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return null;
        }

        const [dbUser, reservations] = await Promise.all([
            prisma.user.findUnique({
                where: { id: authUser.id },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    createdAt: true,
                },
            }),
            prisma.reservation.findMany({
                where: { userId: authUser.id },
                include: {
                    barber: { select: { id: true, name: true, role: true, imageUrl: true } },
                    services: { select: { id: true, name: true, duration: true, price: true } },
                },
                orderBy: { startTime: "desc" },
            }),
        ]);

        return { user: dbUser, reservations };
    } catch (err: any) {
        console.error("Błąd getProfileData:", err);
        return null;
    }
}

// pobieranie rezerwacji przypisanych TYLKO dla zalogowanego użytkownika
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
                services: { select: { id: true, name: true, duration: true, price: true } },
            },
            orderBy: { startTime: "desc" },
        });

        return { success: true, data: reservations };
    } catch (err: any) {
        console.error("Błąd getUserReservations:", err);
        return { success: false, data: [] };
    }
}

// funkcja do anulowania rezerwacji, z weryfikacja czy rezerwacja należy do zalogowanego użytkownika i czy nie jest za pozno na anulowanie
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

        // weryfikacja czy rezerwacja nalezy do zalogowanego użytkownika
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

        // blokada anulowania rezerwacji na mniej niż 2 godziny przed terminem
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

        // odswiezenie sciezek /profile i /reservations po anulowaniu rezerwacji
        revalidatePath("/profile");
        revalidatePath("/reservations");

        return { success: true, message: "Rezerwacja została pomyślnie anulowana." };
    } catch (err: any) {
        console.error("Błąd cancelReservation:", err);
        return { success: false, message: "Wystąpił błąd podczas anulowania wizyty." };
    }
}