import { minutesToTimeString } from "./time-utils";

export const SLOT_INTERVAL = 15; // 15-minutowa siatka bazowa

interface BarberWorkHours {
    startMinute: number;
    endMinute: number;
}

interface ActiveReservation {
    startTime: Date;
    endTime: Date;
}

interface AvailableSlotsParams {
    dateStr: string; // "YYYY-MM-DD"
    workHours: BarberWorkHours | null; // null jeśli dzień wolny
    isDayOff: boolean;
    reservations: ActiveReservation[];
    totalDurationNeeded: number; // duration + bufferTime (np. 60)
}

/**
 * Funkcja calculateAvailableSlots oblicza dostępne sloty czasowe dla barbera w danym dniu, biorąc pod uwagę jego godziny pracy, istniejące rezerwacje oraz całkowity czas potrzebny na usługę (czas trwania + czas buforowy).
 * 
 * @param workHours - Godziny pracy barbera w minutach od północy (startMinute, endMinute). Jeśli barber nie pracuje tego dnia, przekazujemy null.
 * @param isDayOff - Czy dzień jest dniem wolnym.
 * @param reservations - Tablica istniejących rezerwacji.
 * @param totalDurationNeeded - Całkowity czas potrzebny na usługę (czas trwania + czas buforowy).
 */
export function calculateAvailableSlots({
    workHours,
    isDayOff,
    reservations,
    totalDurationNeeded,
}: AvailableSlotsParams): string[] {
    if (isDayOff || !workHours) {
        return [];
    }

    const { startMinute, endMinute } = workHours;
    const totalWorkingMinutes = endMinute - startMinute;

    if (totalWorkingMinutes <= 0 || totalDurationNeeded > totalWorkingMinutes) {
        return [];
    }

    const totalSlots = Math.floor(totalWorkingMinutes / SLOT_INTERVAL);
    const slotsRequired = Math.ceil(totalDurationNeeded / SLOT_INTERVAL);

    // Tablica zajętości: false = wolny, true = zajęty
    const slotGrid = new Array<boolean>(totalSlots).fill(false);

    // Zaznaczamy zajęte sloty na podstawie istniejących rezerwacji
    for (const res of reservations) {
        const resStartMin = res.startTime.getUTCHours() * 60 + res.startTime.getUTCMinutes();
        const resEndMin = res.endTime.getUTCHours() * 60 + res.endTime.getUTCMinutes();

        // Wyliczamy indeksy względem rozpoczęcia pracy barbera
        const rawStartIndex = Math.floor((resStartMin - startMinute) / SLOT_INTERVAL);
        const rawEndIndex = Math.ceil((resEndMin - startMinute) / SLOT_INTERVAL);

        const startIndex = Math.max(0, rawStartIndex);
        const endIndex = Math.min(totalSlots, rawEndIndex);

        for (let i = startIndex; i < endIndex; i++) {
            slotGrid[i] = true;
        }
    }

    // Wyszukujemy ciągłe okna o długości `slotsRequired`
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
            availableSlots.push(minutesToTimeString(slotMinute));
        }
    }

    return availableSlots;
}