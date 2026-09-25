"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";

/**
 * Funkcja getProfileData pobiera dane profilu zalogowanego użytkownika, w tym informacje o użytkowniku, jego rezerwacjach, dostępnych barberach oraz aktywnej subskrypcji.
 * Najpierw sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, zwraca null.
 * Następnie pobiera dane użytkownika z bazy danych przy użyciu Prisma, w tym informacje o jego ulubionym barberze.
 * Pobiera również listę rezerwacji użytkownika, dostępnych barberów oraz aktywną subskrypcję, jeśli istnieje.
 * Zwraca obiekt zawierający wszystkie te dane lub null w przypadku błędów.
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
                    fullName: true,
                    email: true,
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
                    services: {
                        select: {
                            id: true,
                            duration: true,
                            priceAtBooking: true,
                            service: {
                                select: { name: true, imageUrl: true },
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
                    status: "ACTIVE",
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
 *  Najpierw sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, zwraca informację o konieczności logowania.
 *  Następnie pobiera rezerwacje użytkownika wraz z informacjami o barberze i usługach z bazy danych przy użyciu Prisma.
 *  Zwraca obiekt zawierający status sukcesu oraz dane rezerwacji.
 *  W przypadku wystąpienia błędów podczas pobierania danych, funkcja loguje błąd i zwraca informację o niepowodzeniu.
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
 * Funkcja cancelReservation umożliwia zalogowanemu użytkownikowi anulowanie swojej rezerwacji.
 * Najpierw sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, zwraca informację o konieczności logowania.
 * Następnie pobiera rezerwację z bazy danych przy użyciu Prisma i sprawdza, czy użytkownik ma uprawnienia do jej anulowania.
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
 * Funkcja updateFavoriteBarber pozwala użytkownikowi zmienić lub usunąć swojego domyślnego barbera,
 * który będzie automatycznie podpowiadany podczas nowej rezerwacji.
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