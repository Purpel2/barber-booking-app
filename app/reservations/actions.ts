"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


function parseWarsawTimeToUTC(dateStr: string, timeStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [h, min] = timeStr.split(":").map(Number);

    const refDate = new Date(Date.UTC(y, m - 1, d, h, min, 0));
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Warsaw",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });

    const parts = formatter.formatToParts(refDate);
    const warsawHour = Number(parts.find((p) => p.type === "hour")?.value || 0) % 24;
    const warsawMinute = Number(parts.find((p) => p.type === "minute")?.value || 0);

    const diffMinutes = (warsawHour * 60 + warsawMinute) - (h * 60 + min);
    return new Date(refDate.getTime() - diffMinutes * 60 * 1000);
}

function getWarsawMinuteOfDay(date: Date): number {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Warsaw",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour")?.value || 0) % 24;
    const m = Number(parts.find((p) => p.type === "minute")?.value || 0);
    return h * 60 + m;
}



/**
 * Funkcja getBarbers pobiera listę aktywnych barberów z bazy danych przy użyciu Prisma.
 * Zwraca obiekt zawierający status sukcesu oraz dane barberów w przypadku powodzenia.
 * W przypadku wystąpienia błędów podczas pobierania danych, funkcja loguje błąd i zwraca pustą listę barberów.
 * Funkcja jest używana w kontekście serwera (server-side) i może być wywoływana w komponentach serwera lub w akcjach serwera.
 * W przypadku powodzenia, zwracane dane zawierają identyfikator, imię, rolę i adres URL zdjęcia każdego barbera.
 */
export async function getBarbers() {
    try {
        const barbers = await prisma.barber.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                role: true,
                imageUrl: true,
            },
            orderBy: { name: "asc" },
        });
        return { success: true, data: barbers };
    } catch (err: unknown) {
        console.error("Błąd getBarbers:", err);
        return { success: false, data: [] };
    }
}

/**
 * Funkcja getAllServicesWithBarbers pobiera listę wszystkich usług dostępnych w systemie wraz z przypisanymi barberami.
 * Zwraca obiekt zawierający status sukcesu oraz dane usług w przypadku powodzenia.
 * W przypadku wystąpienia błędów podczas pobierania danych, funkcja loguje błąd i zwraca pustą listę usług.
 * Funkcja jest używana w kontekście serwera (server-side) i może być wywoływana w komponentach serwera lub w akcjach serwera.
 * W przypadku powodzenia, zwracane dane zawierają identyfikator, nazwę, cenę, kategorię oraz listę przypisanych barberów dla każdej usługi.
 */
export async function getAllServicesWithBarbers() {
    try {
        const services = await prisma.service.findMany({
            include: {
                barbers: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { duration: "desc" },
        });

        const formatted = services.map((s) => ({
            ...s,
            price: Number(s.price),
            category: s.category,
        }));

        return { success: true, data: formatted };
    } catch (err: unknown) {
        console.error("Błąd getAllServicesWithBarbers:", err);
        return { success: false, data: [] };
    }
}

/**
 * Funkcja getBarberDayDetails pobiera szczegóły dnia pracy barbera, w tym dostępne sloty godzinowe, na podstawie podanego identyfikatora barbera i daty.
 * Zwraca obiekt zawierający status sukcesu, informacje o dostępności barbera, powód niedostępności (jeśli dotyczy), listę wszystkich slotów godzinowych oraz listę niedostępnych slotów.
 * W przypadku wystąpienia błędów podczas pobierania danych, funkcja loguje błąd i zwraca obiekt z informacją o błędzie serwera.
 * Funkcja jest używana w kontekście serwera (server-side) i może być wywoływana w komponentach serwera lub w akcjach serwera.
 * W przypadku powodzenia, zwracane dane zawierają informacje o tym, czy barber jest dostępny w danym dniu, powód niedostępności (jeśli dotyczy), listę wszystkich slotów godzinowych oraz listę niedostępnych slotów.
 */
export async function getBarberDayDetails(
    barberId: string,
    dateStr: string,
    requiredDuration: number = 30
) {
    try {
        const [y, m, d] = dateStr.split("-").map(Number);
        const targetDate = new Date(y, m - 1, d, 12, 0, 0);
        const rawDay = targetDate.getDay();
        const dayOfWeek = rawDay === 0 ? 7 : rawDay;

        if (dayOfWeek === 7) {
            return {
                success: true,
                isWorking: false,
                reason: "Salon nieczynny w niedziele",
                slots: [],
                unavailableSlots: [],
            };
        }

        const schedule = await prisma.barberSchedule.findFirst({
            where: {
                barberId,
                dayOfWeek,
            },
        });

        if (schedule && !schedule.isWorking) {
            return {
                success: true,
                isWorking: false,
                reason: "Dzień wolny barbera",
                slots: [],
                unavailableSlots: [],
            };
        }

        const workStart = schedule?.startMinute ?? 480;
        const workEnd = schedule?.endMinute ?? 960;

        const allSlots: string[] = [];
        for (let t = workStart; t < workEnd; t += 15) {
            const h = Math.floor(t / 60).toString().padStart(2, "0");
            const min = (t % 60).toString().padStart(2, "0");
            allSlots.push(`${h}:${min}`);
        }

        const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

        const dayOff = await prisma.barberDayOff.findFirst({
            where: {
                barberId,
                startDate: { lte: endOfDay },
                endDate: { gte: startOfDay },
            },
        });

        if (dayOff) {
            return {
                success: true,
                isWorking: false,
                reason: dayOff.reason || "Urlop barbera",
                slots: allSlots,
                unavailableSlots: allSlots,
            };
        }

        const reservations = await prisma.reservation.findMany({
            where: {
                barberId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { not: "CANCELLED" },
            },
            include: {
                services: { select: { duration: true, bufferTime: true } },
            },
        });

        const busyRanges = reservations.map((res) => {
            const resTime = new Date(res.startTime);
            const startMin = getWarsawMinuteOfDay(resTime);

            const baseDur = res.services?.reduce((sum, s) => sum + (s.duration || 30), 0) || 30;
            const maxBuf = res.services?.reduce((max, s) => Math.max(max, s.bufferTime || 0), 0) || 0;

            return {
                start: startMin,
                end: startMin + baseDur + maxBuf,
            };
        });

        const unavailableSlots: string[] = [];
        const slotsUnavailableByDuration: string[] = [];
        const slotsUnavailableByReservation: string[] = [];
        const durationNeeded = requiredDuration > 0 ? requiredDuration : 30;

        for (let t = workStart; t < workEnd; t += 15) {
            const h = Math.floor(t / 60).toString().padStart(2, "0");
            const min = (t % 60).toString().padStart(2, "0");
            const timeStr = `${h}:${min}`;

            const reqStart = t;
            const reqEnd = t + durationNeeded;

            if (reqEnd > workEnd) {
                unavailableSlots.push(timeStr);
                slotsUnavailableByDuration.push(timeStr);
                continue;
            }

            const hasConflict = busyRanges.some(
                (busy) => reqStart < busy.end && reqEnd > busy.start
            );

            if (hasConflict) {
                unavailableSlots.push(timeStr);

                const minEndTime = t + 15;
                const hasConflictWithMinDuration = busyRanges.some(
                    (busy) => reqStart < busy.end && minEndTime > busy.start
                );

                if (!hasConflictWithMinDuration) {
                    slotsUnavailableByDuration.push(timeStr);
                } else {
                    slotsUnavailableByReservation.push(timeStr);
                }
            }
        }

        return {
            success: true,
            isWorking: true,
            reason: null,
            slots: allSlots,
            unavailableSlots,
            slotsUnavailableByDuration,
            slotsUnavailableByReservation,
        };
    } catch (err: unknown) {
        console.error("Błąd getBarberDayDetails:", err);
        return {
            success: false,
            isWorking: false,
            reason: "Błąd serwera",
            slots: [],
            unavailableSlots: [],
        };
    }
}

/**
 * Funkcja getMonthCalendarData pobiera dane kalendarza dla danego barbera w określonym miesiącu i roku.
 * Zwraca obiekt zawierający informacje o zajętości dni w danym miesiącu.
 * W przypadku wystąpienia błędów podczas pobierania danych, funkcja loguje błąd i zwraca pusty obiekt.
 */
export async function getMonthCalendarData(
    barberId: string,
    year: number,
    month: number
): Promise<Record<string, number | null>> {
    try {
        const result: Record<string, number | null> = {};

        const schedules = await prisma.barberSchedule.findMany({
            where: { barberId },
        });
        const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]));

        const lastDay = new Date(year, month, 0).getDate();
        const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        const formattedMonth = String(month).padStart(2, '0');
        const startDateStr = `${year}-${formattedMonth}-01`;
        const endDateStr = `${year}-${formattedMonth}-${String(lastDay).padStart(2, '0')}`;

        const dayOverrides = await prisma.barberDayOverride.findMany({
            where: {
                barberId,
                date: {
                    gte: startDateStr,
                    lte: endDateStr,
                },
            },
        });
        const overrideMap = new Map(dayOverrides.map((o) => [o.date, o]));

        const allDaysOff = await prisma.barberDayOff.findMany({
            where: {
                barberId,
                startDate: { lte: monthEnd },
                endDate: { gte: monthStart },
            },
        });

        const allReservations = await prisma.reservation.findMany({
            where: {
                barberId,
                startTime: {
                    gte: monthStart,
                    lte: monthEnd,
                },
                status: { not: "CANCELLED" },
            },
            include: {
                services: { select: { duration: true, bufferTime: true } },
            },
        });

        type ReservationWithServices = typeof allReservations[number];
        const reservationsByDay = new Map<number, ReservationWithServices[]>();
        for (const res of allReservations) {
            const day = new Date(res.startTime).getUTCDate();
            if (!reservationsByDay.has(day)) {
                reservationsByDay.set(day, []);
            }
            reservationsByDay.get(day)!.push(res);
        }

        for (let day = 1; day <= lastDay; day++) {
            const formattedDay = String(day).padStart(2, '0');
            const dateString = `${year}-${formattedMonth}-${formattedDay}`;

            const date = new Date(year, month - 1, day);
            const rawDay = date.getDay();
            const dayOfWeek = rawDay === 0 ? 7 : rawDay;

            const override = overrideMap.get(dateString);

            if (override) {
                if (!override.isWorking) {
                    result[dateString] = null;
                    continue;
                }
                const workStart = override.startMinute;
                const workEnd = override.endMinute;
                const totalSlots = Math.ceil((workEnd - workStart) / 15);

                const dayReservations = reservationsByDay.get(day) || [];
                const busyRanges = dayReservations.map((res) => {
                    const resTime = new Date(res.startTime);
                    const startMin = resTime.getUTCHours() * 60 + resTime.getUTCMinutes();
                    const dur = res.services?.reduce(
                        (sum, s) => sum + (s.duration || 30) + (s.bufferTime || 0),
                        0
                    ) || 30;
                    return { start: startMin, end: startMin + dur };
                });

                let bookedSlots = 0;
                for (let t = workStart; t < workEnd; t += 15) {
                    if (busyRanges.some((busy) => t < busy.end && t + 15 > busy.start)) {
                        bookedSlots++;
                    }
                }

                result[dateString] = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
                continue;
            }

            // Domyślne weekendy (Niedziela=7, Sobota=6)
            if (dayOfWeek === 7 || dayOfWeek === 6) {
                result[dateString] = null;
                continue;
            }

            const schedule = scheduleMap.get(dayOfWeek);
            if (schedule && !schedule.isWorking) {
                result[dateString] = null;
                continue;
            }

            const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

            const dayOff = allDaysOff.find(
                (d) => d.startDate <= endOfDay && d.endDate >= startOfDay
            );

            if (dayOff) {
                result[dateString] = null;
                continue;
            }

            const workStart = schedule?.startMinute ?? 480;
            const workEnd = schedule?.endMinute ?? 960;
            const totalSlots = Math.ceil((workEnd - workStart) / 15);

            const dayReservations = reservationsByDay.get(day) || [];
            const busyRanges = dayReservations.map((res) => {
                const resTime = new Date(res.startTime);
                const startMin = resTime.getUTCHours() * 60 + resTime.getUTCMinutes();
                const dur = res.services?.reduce(
                    (sum, s) => sum + (s.duration || 30) + (s.bufferTime || 0),
                    0
                ) || 30;
                return { start: startMin, end: startMin + dur };
            });

            let bookedSlots = 0;
            for (let t = workStart; t < workEnd; t += 15) {
                if (busyRanges.some((busy) => t < busy.end && t + 15 > busy.start)) {
                    bookedSlots++;
                }
            }

            result[dateString] = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
        }

        return result;
    } catch (err: unknown) {
        console.error("Błąd getMonthCalendarData:", err);
        return {};
    }
}

/**
 * Funkcja getProfileData pobiera dane profilu użytkownika, w tym informacje o użytkowniku, jego rezerwacjach, dostępnych barberach oraz aktywnej subskrypcji.
 * Najpierw sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, zwraca null.
 * Następnie pobiera dane użytkownika z bazy danych przy użyciu Prisma, w tym informacje o jego ulubionym barberze.
 * Pobiera również listę rezerwacji użytkownika, dostępnych barberów oraz aktywną subskrypcję, jeśli istnieje.
 * Zwraca obiekt zawierający wszystkie te dane lub null w przypadku błędów.
 */
export async function createReservation(data: {
    date: string;
    time: string;
    serviceIds: string[];
    barberId: string;
    paymentMethod: "ON_SITE" | "ONLINE";
}) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return {
                success: false,
                requiresAuth: true,
                message: "Musisz być zalogowany, aby dokonać rezerwacji.",
            };
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { id: true },
        });

        if (!dbUser) {
            return {
                success: false,
                requiresAuth: true,
                message: "Nie znaleziono profilu użytkownika w bazie.",
            };
        }

        if (!data.serviceIds || data.serviceIds.length === 0) {
            return { success: false, message: "Nie wybrano żadnej usługi." };
        }

        const selectedServices = await prisma.service.findMany({
            where: { id: { in: data.serviceIds } },
            select: { id: true, duration: true, price: true, bufferTime: true },
        });

        const totalDuration = selectedServices.reduce((acc, s) => acc + (s.duration || 30), 0);
        const maxBuffer = selectedServices.reduce((acc, s) => Math.max(acc, s.bufferTime || 0), 0);
        const totalPrice = selectedServices.reduce((acc, s) => acc + Number(s.price || 0), 0);

        const reservationDateTime = parseWarsawTimeToUTC(data.date, data.time);
        const reservationEndTime = new Date(reservationDateTime.getTime() + (totalDuration + maxBuffer) * 60 * 1000);

        const startOfDay = parseWarsawTimeToUTC(data.date, "00:00");
        const endOfDay = new Date(parseWarsawTimeToUTC(data.date, "23:59").getTime() + 59 * 1000 + 999);

        const isOnline = data.paymentMethod === "ONLINE";

        const reservation = await prisma.$transaction(async (tx) => {
            const existingReservations = await tx.reservation.findMany({
                where: {
                    barberId: data.barberId,
                    status: { not: "CANCELLED" },
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                include: {
                    services: { select: { duration: true, bufferTime: true } },
                },
            });

            const reqStart = reservationDateTime.getTime();
            const reqEnd = reservationEndTime.getTime();

            for (const res of existingReservations) {
                const rawDuration = res.services.reduce((acc, s) => acc + (s.duration || 30), 0);
                const maxBuf = res.services.reduce((acc, s) => Math.max(acc, s.bufferTime || 0), 0);

                const resDuration = (rawDuration > 0 ? rawDuration : 30) + maxBuf;
                const resStart = new Date(res.startTime).getTime();
                const resEnd = resStart + resDuration * 60 * 1000;

                if (reqStart < resEnd && reqEnd > resStart) {
                    throw new Error("Wybrany termin został w międzyczasie zarezerwowany.");
                }
            }

            return await tx.reservation.create({
                data: {
                    startTime: reservationDateTime,
                    endTime: reservationEndTime,
                    totalPrice: totalPrice,
                    userId: dbUser.id,
                    barberId: data.barberId,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: isOnline ? "PAID" : "PENDING",
                    status: "CONFIRMED",
                    services: {
                        create: selectedServices.map((service) => ({
                            service: { connect: { id: service.id } },
                            priceAtBooking: service.price,
                            duration: service.duration || 30,
                            bufferTime: service.bufferTime ?? 15,
                        })),
                    },
                },
                select: { id: true },
            });
        });

        revalidatePath("/reservations");

        return {
            success: true,
            message: isOnline ? "Opłacono pomyślnie (symulacja)!" : "Rezerwacja potwierdzona!",
            reservationId: reservation.id,
        };
    } catch (err: unknown) {
        console.error("BŁĄD BAZY createReservation:", err);
        const errorObject = err as { message?: string };
        return {
            success: false,
            message: errorObject?.message || "Wystąpił błąd podczas zapisu rezerwacji.",
        };
    }
}