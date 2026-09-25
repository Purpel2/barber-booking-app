import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AppointmentsList from "./_components/AppointmentsList";

/**
 * Podstrona profilu użytkownika wyświetlająca listę jego wizyt (rezerwacji).
 * Sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, następuje przekierowanie na stronę logowania.
 * Pobiera dane rezerwacji użytkownika z bazy danych przy użyciu Prisma, w tym informacje o barberze i usługach.
 * Renderuje komponent AppointmentsList z pobranymi danymi wizyt, barberów i usług.
 */
export default async function AppointmentsPage() {
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
            />
        </div>
    );
}