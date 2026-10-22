import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppointmentsList from "./_components/AppointmentsList";

/**
 * Interfejs AppointmentsPageProps definiuje typy właściwości przekazywanych do komponentu AppointmentsPage. Zawiera opcjonalny parametr reviewId,
 *  który może być użyty do filtrowania lub identyfikowania recenzji związanych z wizytami użytkownika.
 * @interface AppointmentsPageProps
 * @property {Promise<{ reviewId?: string }>} searchParams - Obiekt zawierający opcjonalny parametr reviewId, który może być użyty do filtrowania lub identyfikowania recenzji związanych z wizytami użytkownika.
 */
interface AppointmentsPageProps {
    searchParams: Promise<{ reviewId?: string }>;
}

/**
 * Funkcja AppointmentsPage renderuje stronę listy wizyt użytkownika. Sprawdza, czy użytkownik jest zalogowany, pobiera dane wizyt z bazy danych i wyświetla je w formie listy.
 * @param props - Właściwości przekazywane do komponentu, zawierające parametry wyszukiwania.
 * @returns - Zwraca element JSX reprezentujący stronę listy wizyt użytkownika.
 * @throws - Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
    const resolvedParams = await searchParams;
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/login?redirect=/profile/appointments");
    }

    const reservations = await prisma.reservation.findMany({
        where: { userId: authUser.id },
        include: {
            barber: {
                select: { id: true, name: true, role: true, imageUrl: true },
            },
            review: {
                select: { id: true },
            },
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
    });

    const barbers = Array.from(
        new Map(reservations.map((r) => [r.barber.id, r.barber])).values()
    );

    const services = Array.from(
        new Map(
            reservations.flatMap((r) =>
                r.services.map((s) => [s.service.id, s.service])
            )
        ).values()
    );

    const formattedReservations = reservations.map((r) => ({
        id: r.id,
        startTime: r.startTime.toISOString(),
        endTime: r.endTime.toISOString(),
        status: r.status,
        paymentMethod: r.paymentMethod,
        paymentStatus: r.paymentStatus,
        totalPrice: Number(r.totalPrice),
        hasReview: Boolean(r.review),
        barber: r.barber,
        services: r.services.map((s) => ({
            id: s.id,
            duration: s.duration,
            price: Number(s.priceAtBooking),
            name: s.service.name,
            imageUrl: s.service.imageUrl,
            serviceId: s.service.id,
        })),
    }));

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
                    Moje Wizyty
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                    Przeglądaj zaplanowane terminy, historię zabiegów i wystawiaj opinie.
                </p>
            </div>

            <AppointmentsList
                initialReservations={formattedReservations}
                barbers={barbers}
                services={services}
                initialReviewId={resolvedParams?.reviewId}
            />
        </div>
    );
}