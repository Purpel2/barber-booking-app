import { minutesToTimeString } from "./time-utils";

export const SLOT_INTERVAL = 15;

interface BarberWorkHours {
    startMinute: number;
    endMinute: number;
}

interface ActiveReservation {
    startTime: Date;
    endTime: Date;
}

interface AvailableSlotsParams {
    dateStr: string;
    workHours: BarberWorkHours | null;
    isDayOff: boolean;
    reservations: ActiveReservation[];
    totalDurationNeeded: number;
}

/**
 * Funkcja calculateAvailableSlots oblicza dostępne sloty czasowe dla barbera w określonym dniu, uwzględniając harmonogram pracy, dni wolne od pracy oraz istniejące rezerwacje.
 * Zwraca tablicę dostępnych slotów czasowych w formacie "HH:mm".
 * @param dateStr - Data w formacie "YYYY-MM-DD" dla której obliczane są dostępne sloty.
 * @param workHours - Obiekt zawierający godziny pracy barbera (start i koniec w minutach od północy).
 * @param isDayOff - Flaga wskazująca, czy dany dzień jest dniem wolnym od pracy.
 * @param reservations - Tablica istniejących rezerwacji barbera w danym dniu.
 * @param totalDurationNeeded - Całkowity czas trwania wybranych usług w minutach.
 * @returns Tablica dostępnych slotów czasowych w formacie "HH:mm".
 * @throws Jeśli podane godziny pracy są nieprawidłowe lub całkowity czas trwania usług przekracza dostępny czas pracy, funkcja zwraca pustą tablicę.
 * @remarks Funkcja uwzględnia aktualną godzinę w strefie czasowej Warszawy, aby wykluczyć przeszłe sloty w dniu bieżącym.
 */
export function calculateAvailableSlots({
    dateStr,
    workHours,
    isDayOff,
    reservations,
    totalDurationNeeded,
}: AvailableSlotsParams): string[] {
    if (isDayOff || !workHours) {
        return [];
    }

    const now = new Date();
    const todayWarsawStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Warsaw",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(now);

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Warsaw",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    }).formatToParts(now);
    const currentWarsawMinute =
        (Number(parts.find((p) => p.type === "hour")?.value || 0) % 24) * 60 +
        Number(parts.find((p) => p.type === "minute")?.value || 0);

    if (dateStr < todayWarsawStr) {
        return [];
    }

    const { startMinute, endMinute } = workHours;
    const totalWorkingMinutes = endMinute - startMinute;

    if (totalWorkingMinutes <= 0 || totalDurationNeeded > totalWorkingMinutes) {
        return [];
    }

    const totalSlots = Math.floor(totalWorkingMinutes / SLOT_INTERVAL);
    const slotsRequired = Math.ceil(totalDurationNeeded / SLOT_INTERVAL);

    const slotGrid = new Array<boolean>(totalSlots).fill(false);

    for (const res of reservations) {
        const resStartMin = res.startTime.getUTCHours() * 60 + res.startTime.getUTCMinutes();
        const resEndMin = res.endTime.getUTCHours() * 60 + res.endTime.getUTCMinutes();

        const rawStartIndex = Math.floor((resStartMin - startMinute) / SLOT_INTERVAL);
        const rawEndIndex = Math.ceil((resEndMin - startMinute) / SLOT_INTERVAL);

        const startIndex = Math.max(0, rawStartIndex);
        const endIndex = Math.min(totalSlots, rawEndIndex);

        for (let i = startIndex; i < endIndex; i++) {
            slotGrid[i] = true;
        }
    }

    const availableSlots: string[] = [];

    for (let i = 0; i <= totalSlots - slotsRequired; i++) {
        let canFit = true;

        for (let j = 0; j < slotsRequired; j++) {
            if (slotGrid[i + j]) {
                canFit = false;
                break;
            }
        }

        if (canFit) {
            const slotMinute = startMinute + i * SLOT_INTERVAL;
            if (dateStr === todayWarsawStr && slotMinute <= currentWarsawMinute) {
                continue;
            }
            availableSlots.push(minutesToTimeString(slotMinute));
        }
    }

    return availableSlots;
}
