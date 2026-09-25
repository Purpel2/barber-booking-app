import { prisma } from "@/lib/prisma";

/**
 * Funkcja getRandomRecentReviews pobiera losowe opinie z bazy danych, które mają ocenę 4 lub wyższą.
 * Pobiera maksymalnie 40 najnowszych opinii, a następnie losowo wybiera określoną liczbę (domyślnie 12) z nich.
 * Zwraca tablicę obiektów opinii, zawierających informacje o użytkowniku i treści opinii.
 * @param limit - Maksymalna liczba opinii do zwrócenia (domyślnie 12).
 * @returns Tablica losowych opinii z bazy danych.
 */
export async function getRandomRecentReviews(limit = 12) {
    const recentReviews = await prisma.review.findMany({
        where: { rating: { gte: 4 } },
        take: 40,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { firstName: true } },
        },
    });

    return recentReviews
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
}