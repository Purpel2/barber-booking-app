import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Star, StarHalf } from "lucide-react";
import ReviewsClient from "./ReviewsClient";

export const revalidate = 60;

/**
 * Podstrona wyświetlająca wszystkie opinie wystawione przez użytkowników po zakończonych wizytach.
 * Pobiera dane opinii z bazy danych przy użyciu Prisma, w tym informacje o użytkownikach, rezerwacjach i usługach.
 * Oblicza średnią ocenę oraz liczbę wszystkich opinii.
 * Renderuje komponent ReviewsClient z pobranymi danymi opinii i usług.
 */
export default async function ReviewsPage() {
    const [stats, rawReviews, services] = await Promise.all([
        prisma.review.aggregate({
            _avg: { rating: true },
            _count: { _all: true },
        }),
        prisma.review.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { firstName: true } },
                reservation: {
                    select: {
                        services: {
                            select: {
                                service: {
                                    select: { name: true, category: true },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.service.findMany({
            select: { id: true, name: true, category: true },
            orderBy: { name: "asc" },
        }),
    ]);

    const totalReviews = stats._count._all;
    const rawAvg = stats._avg.rating ?? 0;
    const averageRating = rawAvg > 0 ? Number(rawAvg.toFixed(1)) : 0;

    const reviews = rawReviews.map((r) => {
        const reservationServices = r.reservation?.services;
        const serviceName =
            reservationServices && reservationServices.length > 0
                ? reservationServices.map((rs) => rs.service.name).join(" + ")
                : null;
        const serviceCategories =
            reservationServices && reservationServices.length > 0
                ? reservationServices.map((rs) => rs.service.category)
                : [];

        return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
            authorName: r.user?.firstName || "Klient",
            serviceName,
            categories: serviceCategories,
        };
    });
    return (
        <div className="bg-background text-on-surface font-body min-h-screen pt-28 sm:pt-36 pb-20 px-6 sm:px-12 md:px-20 selection:bg-primary selection:text-on-primary">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-label uppercase tracking-widest mb-12"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Powrót na stronę główną
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 mb-10 border-b border-outline-variant/15">
                    <div>
                        <span className="text-primary font-label tracking-[0.3em] text-xs uppercase mb-3 block">
                            ZAUFANIE I TRANSPARENTNOŚĆ
                        </span>
                        <h1 className="font-headline text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
                            Wszystkie Opinie
                        </h1>
                        <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-xl">
                            Autentyczne opinie wystawione wyłącznie przez zweryfikowanych klientów po zakończonych wizytach.
                        </p>
                    </div>

                    {totalReviews > 0 && (
                        <div className="flex items-center gap-6 bg-surface-container/50 border border-outline-variant/20 rounded-2xl p-5 shrink-0">
                            <div className="text-center border-r border-outline-variant/20 pr-6">
                                <span className="font-headline text-4xl font-black text-primary block leading-none mb-1">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">
                                    Średnia ocen
                                </span>
                            </div>
                            <div>
                                <div className="flex gap-1 items-center mb-1">
                                    {Array(Math.floor(averageRating)).fill(0).map((_, i) => (
                                        <Star key={`avg-star-${i}`} className="w-4 h-4 text-primary fill-primary" />
                                    ))}
                                    {averageRating % 1 >= 0.5 && (
                                        <StarHalf className="w-4 h-4 text-primary fill-primary" />
                                    )}
                                </div>
                                <span className="text-xs text-on-surface-variant">
                                    Łącznie: <strong>{totalReviews}</strong> {totalReviews === 1 ? "opinia" : totalReviews < 5 ? "opinie" : "opinii"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <ReviewsClient
                    initialReviews={reviews}
                    services={services}
                />
            </div>
        </div>
    );
}