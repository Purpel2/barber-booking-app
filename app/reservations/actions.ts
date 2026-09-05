"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBarbers() { //pobieranie barberow z bazy
    try {
        const barbers = await prisma.barber.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                imageUrl: true,
            },
            orderBy: { name: "asc" },
        });
        return { success: true, data: barbers };
    } catch (err) {
        console.error("Błąd getBarbers:", err);
        return { success: false, data: [] };
    }
}

export async function getAllServicesWithBarbers() { //pobieranie uslug (powiązanych z barberami) z bazy
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
            orderBy: { price: "asc" },
        });
        return { success: true, data: services };
    } catch (err) {
        console.error("Błąd getAllServicesWithBarbers:", err);
        return { success: false, data: [] };
    }
}

export async function getBarberDayDetails( //pobieranie szczegolow dnia pracy barbera (dostepne terminy, urlopy, rezerwacje)
    barberId: string,
    dateStr: string,
    requiredDuration: number = 30
) {
    try {
        const [y, m, d] = dateStr.split("-").map(Number);
        const targetDate = new Date(y, m - 1, d, 12, 0, 0);
        const dayOfWeek = targetDate.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) { // 0= niedziela  6 = sobota
            return {
                success: true,
                isWorking: false,
                reason: "Salon nieczynny w weekendy",
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

        const startTimeStr = schedule?.startTime || "08:00";
        const endTimeStr = schedule?.endTime || "18:00";

        const [openH, openM] = startTimeStr.split(":").map(Number);
        const [closeH, closeM] = endTimeStr.split(":").map(Number);
        const workStart = openH * 60 + openM;
        const workEnd = closeH * 60 + closeM;

        const allSlots: string[] = [];
        for (let t = workStart; t < workEnd; t += 30) {
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

        // pobranie rezerwacji barbera na dany dzien (z uwzglednieniem czasu trwania uslug)
        const reservations = await (prisma.reservation.findMany as any)({
            where: {
                barberId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { not: "CANCELLED" },
            },
            include: {
                services: { select: { duration: true } },
            },
        });

        const busyRanges = reservations.map((res: any) => { // obliczanie zajetych przedzialow czasowych na podstawie rezerwacji
            const resTime = new Date(res.startTime);
            const startMin = resTime.getUTCHours() * 60 + resTime.getUTCMinutes();
            const dur = res.services?.reduce((max: number, s: any) => Math.max(max, s.duration || 30), 30) || 30;
            return {
                start: startMin,
                end: startMin + dur,
            };
        });

        // sprawdzenie dostepnosci slotow w zaleznosci od czasu trwania uslug i rezerwacji
        const unavailableSlots: string[] = [];
        const slotsUnavailableByDuration: string[] = [];
        const slotsUnavailableByReservation: string[] = [];
        const durationNeeded = requiredDuration > 0 ? requiredDuration : 30;

        for (let t = workStart; t < workEnd; t += 30) {
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
                (busy: { start: number; end: number }) => reqStart < busy.end && reqEnd > busy.start
            );

            if (hasConflict) {
                unavailableSlots.push(timeStr);

                // sprawdzenie czy konflikt jest przez wybrany czas trwania uslug czy przez rezerwacje
                const minEndTime = t + 30;
                const hasConflictWithMinDuration = busyRanges.some(
                    (busy: { start: number; end: number }) => reqStart < busy.end && minEndTime > busy.start
                );

                //jesli przez wybrany czas trwania uslug, dodajemy do slotsUnavailableByDuration, jesli przez rezerwacje, dodajemy do slotsUnavailableByReservation
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
    } catch (err) {
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

export async function getMonthCalendarData( // pobieranie danych kalendarza miesiecznego dla barbera
    barberId: string,
    year: number,
    month: number
): Promise<{ [day: number]: number | null }> {
    try {
        const result: { [day: number]: number | null } = {};

        const schedules = await prisma.barberSchedule.findMany({ // pobranie harmonogramu barbera dla wszystkich dni tygodnia
            where: { barberId },
        });
        const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]));

        const lastDay = new Date(year, month, 0).getDate();
        const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        const allDaysOff = await prisma.barberDayOff.findMany({ //pobranie wsszystkich dni wolnych barbera w danym miesiacu
            where: {
                barberId,
                startDate: { lte: monthEnd },
                endDate: { gte: monthStart },
            },
        });

        const allReservations = await (prisma.reservation.findMany as any)({ //pobranie wszystkich rezerwacji barbera w danym miesiacu
            where: {
                barberId,
                startTime: {
                    gte: monthStart,
                    lte: monthEnd,
                },
                status: { not: "CANCELLED" },
            },
            include: {
                services: { select: { duration: true } },
            },
        });

        //  mapowanie rezerwacji wedlug dnia miesiaca
        const reservationsByDay = new Map<number, any[]>();
        for (const res of allReservations) {
            const day = new Date(res.startTime).getUTCDate();
            if (!reservationsByDay.has(day)) {
                reservationsByDay.set(day, []);
            }
            reservationsByDay.get(day)!.push(res);
        }

        //  iteracja przez wszystkie dni miesiaca i obliczanie procentu zapełnienia
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();

            // sprawdzenie czy jest weekend
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                result[day] = null;
                continue;
            }

            // sprawdzenie harmonogramu barbera by okreslic dostepnosc barbera w danym dniu
            const schedule = scheduleMap.get(dayOfWeek);
            if (schedule && !schedule.isWorking) {
                result[day] = null;
                continue;
            }

            // sprawdzeenie czy barber jest na urlopie w danym dniu
            const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

            const dayOff = allDaysOff.find(
                (d) => d.startDate <= endOfDay && d.endDate >= startOfDay
            );

            if (dayOff) {
                result[day] = null;
                continue;
            }

            // obliczanie procentu zapełnienia na podstawie harmonogramu i rezerwacji
            const startTimeStr = schedule?.startTime || "08:00";
            const endTimeStr = schedule?.endTime || "18:00";

            const [openH, openM] = startTimeStr.split(":").map(Number);
            const [closeH, closeM] = endTimeStr.split(":").map(Number);
            const workStart = openH * 60 + openM;
            const workEnd = closeH * 60 + closeM;

            const totalSlots = Math.ceil((workEnd - workStart) / 30);

            const dayReservations = reservationsByDay.get(day) || [];

            const busyRanges = dayReservations.map((res: any) => {
                const resTime = new Date(res.startTime);
                const startMin = resTime.getUTCHours() * 60 + resTime.getUTCMinutes();
                const dur = res.services?.reduce((max: number, s: any) => Math.max(max, s.duration || 30), 30) || 30;
                return {
                    start: startMin,
                    end: startMin + dur,
                };
            });

            // liczenie liczby zajetych slotow w danym dniu 
            let bookedSlots = 0;
            for (let t = workStart; t < workEnd; t += 30) {
                const reqStart = t;
                const reqEnd = t + 30;

                const hasConflict = busyRanges.some(
                    (busy: { start: number; end: number }) => reqStart < busy.end && reqEnd > busy.start
                );

                if (hasConflict) {
                    bookedSlots++;
                }
            }

            // obliczanie procentu zapełnienia i przypisanie do wyniku
            const occupancyPercent = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
            result[day] = occupancyPercent;
        }

        return result;
    } catch (err) {
        console.error("Błąd getMonthCalendarData:", err);
        return {};
    }
}

export async function createReservation(data: { // funkcja do tworzenia rezerwacji w bazie danych
    date: string;
    time: string;
    serviceIds: string[];
    barberId: string;
    paymentMethod: "ON_SITE" | "ONLINE";
}) {
    try {
        const [y, m, d] = data.date.split("-").map(Number);
        const [h, min] = data.time.split(":").map(Number);
        const reservationDateTime = new Date(Date.UTC(y, m - 1, d, h, min, 0));


        let testUser = await prisma.user.findFirst({
            select: { id: true },
        });

        if (!testUser) {
            testUser = await prisma.user.create({
                data: {
                    email: "klient.testowy@wp.pl",
                    firstName: "Klient",
                    lastName: "Testowy",
                    fullName: "Klient Testowy",
                    phoneBody: "512753145",
                },
                select: { id: true },
            });
        }

        const isOnline = data.paymentMethod === "ONLINE";

        // insert rezerwacji do bazy danych z powiązaniem do testowego użytkownika, barbera, uslug
        const reservation = await prisma.reservation.create({
            data: {
                startTime: reservationDateTime,
                userId: testUser.id,
                barberId: data.barberId,
                paymentMethod: data.paymentMethod,
                paymentStatus: isOnline ? "PAID" : "PENDING",
                status: "CONFIRMED",
                services: {
                    connect: data.serviceIds.map((id) => ({ id })),
                },
            },
            select: { id: true },
        });

        revalidatePath("/reservations");

        return {
            success: true,
            message: isOnline ? "Opłacono pomyślnie (symulacja)!" : "Rezerwacja potwierdzona!",
            reservationId: reservation.id,
        };
    } catch (err: any) {
        console.error("BŁĄD BAZY createReservation:", err);
        return {
            success: false,
            message: err?.message || "Wystąpił błąd podczas zapisu rezerwacji."
        };
    }
}