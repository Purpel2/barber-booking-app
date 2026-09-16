import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { buildUtcDateFromLocal, timeStringToMinutes } from "@/lib/time-utils";

/**
 * Tworzy nową rezerwację dla zalogowanego użytkownika.
 * Sprawdza poprawność danych, dostępność barbera (brak urlopów i konfliktów godzinowych), 
 * a następnie zapisuje rezerwację w bazie danych w ramach transakcji.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: "Wymagane logowanie" }, { status: 401 });
        }

        const body = await req.json();
        const { barberId, serviceId, dateStr, slotTime } = body;

        if (!barberId || !serviceId || !dateStr || !slotTime) {
            return NextResponse.json(
                { error: "Brakujące parametry: barberId, serviceId, dateStr, slotTime" },
                { status: 400 }
            );
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                price: true,
                duration: true,
                bufferTime: true,
            },
        });

        if (!service) {
            return NextResponse.json({ error: "Usługa nie istnieje" }, { status: 404 });
        }

        const slotMinutes = timeStringToMinutes(slotTime);
        const totalMinutesNeeded = service.duration + service.bufferTime;

        const startTimeUtc = buildUtcDateFromLocal(dateStr, slotMinutes);
        const endTimeUtc = new Date(startTimeUtc.getTime() + totalMinutesNeeded * 60 * 1000);

        if (startTimeUtc.getTime() <= Date.now()) {
            return NextResponse.json(
                { error: "Nie można rezerwować terminów w przeszłości" },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const overlappingReservation = await tx.reservation.findFirst({
                where: {
                    barberId,
                    status: { not: "CANCELLED" },
                    startTime: { lt: endTimeUtc },
                    endTime: { gt: startTimeUtc },
                },
                select: { id: true },
            });

            if (overlappingReservation) {
                throw new Error("SLOT_TAKEN");
            }

            const dayOff = await tx.barberDayOff.findFirst({
                where: {
                    barberId,
                    startDate: { lte: endTimeUtc },
                    endDate: { gte: startTimeUtc },
                },
                select: { id: true },
            });

            if (dayOff) {
                throw new Error("BARBER_UNAVAILABLE");
            }

            const newReservation = await tx.reservation.create({
                data: {
                    userId: authUser.id,
                    barberId,
                    startTime: startTimeUtc,
                    endTime: endTimeUtc,
                    totalPrice: service.price,
                    status: "CONFIRMED",
                    paymentMethod: "ON_SITE",
                    paymentStatus: "PENDING",
                    services: {
                        create: {
                            serviceId: service.id,
                            priceAtBooking: service.price,
                            duration: service.duration,
                            bufferTime: service.bufferTime,
                        },
                    },
                },
                include: {
                    services: true,
                },
            });

            return newReservation;
        });

        return NextResponse.json({ success: true, reservation: result }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "SLOT_TAKEN") {
                return NextResponse.json(
                    { error: "Wybrany termin został przed chwilą zajęty przez innego klienta." },
                    { status: 409 }
                );
            }
            if (error.message === "BARBER_UNAVAILABLE") {
                return NextResponse.json(
                    { error: "Barber w wybranym terminie przebywa na urlopie." },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Wystąpił błąd podczas przetwarzania rezerwacji." },
            { status: 500 }
        );
    }
}