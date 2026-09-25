"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Funkcja submitReviewAction obsługuje proces wystawiania opinii przez użytkownika dla zakończonej wizyty (rezerwacji).
 * Sprawdza, czy użytkownik jest zalogowany, czy rezerwacja istnieje i należy do użytkownika,
 * oraz czy wizyta została zakończona i nie została już oceniona.
 * Jeśli wszystkie warunki są spełnione, zapisuje opinię w bazie danych i wywołuje rewalidację odpowiednich ścieżek.
 * W przypadku błędów zwraca odpowiedni komunikat o błędzie.
 */
export async function submitReviewAction({
    reservationId,
    rating,
    comment,
}: {
    reservationId: string;
    rating: number;
    comment?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        return { success: false, error: "Musisz być zalogowany." };
    }

    if (rating < 1 || rating > 5) {
        return { success: false, error: "Ocena musi mieścić się w przedziale 1-5." };
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        select: {
            id: true,
            userId: true,
            startTime: true,
            status: true,
            barberId: true,
        },
    });

    if (!reservation || reservation.userId !== authUser.id) {
        return { success: false, error: "Nie znaleziono rezerwacji lub brak uprawnień." };
    }

    if (reservation.status === "CANCELLED") {
        return { success: false, error: "Nie można ocenić anulowanej wizyty." };
    }

    const now = new Date();
    const visitDate = new Date(reservation.startTime);

    if (visitDate > now) {
        return { success: false, error: "Można ocenić tylko zakończoną wizytę." };
    }

    const diffDays = Math.floor(
        (now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 30) {
        return { success: false, error: "Czas na wystawienie opinii (30 dni) minął." };
    }

    try {
        const existingReview = await prisma.review.findUnique({
            where: { reservationId: reservation.id },
        });

        if (existingReview) {
            return { success: false, error: "Wizyta została już oceniona." };
        }

        await prisma.review.create({
            data: {
                reservationId: reservation.id,
                userId: authUser.id,
                barberId: reservation.barberId,
                rating,
                comment: comment?.trim() || null,
            },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/appointments");
        revalidatePath("/reviews");
        revalidatePath("/");
        return { success: true };
    } catch {
        return {
            success: false,
            error: "Wystąpił błąd bazy danych podczas zapisu opinii.",
        };
    }
}