import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAvailableSlots } from "@/lib/booking-slots";
import { buildUtcDateFromLocal } from "@/lib/time-utils";




/**   
 * Funkcja zwraca dostępne sloty godzinowe dla danego barbera, usługi i daty. 
 * Sprawdza harmonogram pracy barbera, dni wolne oraz istniejące rezerwacje, aby określić dostępne sloty.
 * Zwraca listę dostępnych slotów w formacie JSON.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");
    const serviceId = searchParams.get("serviceId");
    const dateStr = searchParams.get("date");

    if (!barberId || !serviceId || !dateStr) {
        return NextResponse.json(
            { error: "Wymagane parametry: barberId, serviceId, date" },
            { status: 400 }
        );
    }
    // Pobranie informacji o usłudze z bazy danych
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { duration: true, bufferTime: true },
    });

    if (!service) {
        return NextResponse.json({ error: "Usługa nie istnieje" }, { status: 404 });
    }
    // Obliczenie daty docelowej
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const jsDay = targetDate.getUTCDay();

    // Przeliczenie dnia tygodnia z formatu JavaScript (0-6, gdzie 0 to niedziela) na format używany w bazie danych (1-7, gdzie 1 to poniedziałek)
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const dayStartUtc = buildUtcDateFromLocal(dateStr, 0);
    const dayEndUtc = buildUtcDateFromLocal(dateStr, 1439);

    // Pobranie harmonogramu barbera, informacji o dniu wolnym i rezerwacjach w tym dniu
    const [schedule, dayOff, reservations] = await Promise.all([
        prisma.barberSchedule.findUnique({
            where: {
                barberId_dayOfWeek: { barberId, dayOfWeek },
            },
        }),
        prisma.barberDayOff.findFirst({
            where: {
                barberId,
                startDate: { lte: dayEndUtc },
                endDate: { gte: dayStartUtc },
            },
        }),
        prisma.reservation.findMany({
            where: {
                barberId,
                status: { not: "CANCELLED" },
                startTime: { lt: dayEndUtc },
                endTime: { gt: dayStartUtc },
            },
            select: { startTime: true, endTime: true },
        }),
    ]);

    // Obliczenie godzin pracy barbera
    const workHours = (schedule && schedule.isWorking)
        ? { startMinute: schedule.startMinute, endMinute: schedule.endMinute }
        : null;

    // Obliczenie całkowitego czasu potrzebnego na usługę (czas trwania + czas buforowy), aby uwzględnić czas potrzebny na przygotowanie i sprzątanie po usłudze.
    const totalDurationNeeded = service.duration + service.bufferTime;

    const slots = calculateAvailableSlots({
        dateStr,
        workHours,
        isDayOff: Boolean(dayOff),
        reservations,
        totalDurationNeeded,
    });

    return NextResponse.json({ slots });
}