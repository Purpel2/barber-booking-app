export const TIMEZONE = "Europe/Warsaw";

/**
 * Funkcja minutesToTimeString konwertuje liczbę minut od północy na format czasu w postaci "HH:MM".
 * 
 * @param totalMinutes - Liczba minut od północy (0-1439).
 * @returns Ciąg znaków reprezentujący czas w formacie "HH:MM". 
 */
export function minutesToTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

/**
 * Funkcja timeStringToMinutes konwertuje ciąg znaków w formacie "HH:MM" na liczbę minut od północy.
 * 
 * @param timeStr - Ciąg znaków reprezentujący czas w formacie "HH:MM".
 * @returns Liczba minut od północy (0-1439).
 * @throws Błąd, jeśli format czasu jest nieprawidłowy.
 */
export function timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error(`Nieprawidłowy format czasu: ${timeStr}`);
    }
    return hours * 60 + minutes;
}

/**
 * Funkcja getMinutesFromDate zwraca liczbę minut od północy dla podanej daty, uwzględniając strefę czasową "Europe/Warsaw".
 * 
 * @param date - Obiekt Date, dla którego chcemy obliczyć liczbę minut od północy.
 * @returns Liczba minut od północy (0-1439).
 */
export function getMinutesFromDate(date: Date): number {
    const formatter = new Intl.DateTimeFormat("pl-PL", {
        timeZone: TIMEZONE,
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

    return hour * 60 + minute;
}

/**
 * Funkcja buildUtcDateFromLocal tworzy obiekt Date w strefie UTC na podstawie daty i minut od północy.
 * 
 * @param dateStr - Ciąg znaków reprezentujący datę w formacie "YYYY-MM-DD".
 * @param minutesFromMidnight - Liczba minut od północy (0-1439).
 * @returns Obiekt Date w strefie UTC.
 */
export function buildUtcDateFromLocal(dateStr: string, minutesFromMidnight: number): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;

    const tempDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const localIsoString = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).format(tempDate);

    const [datePart, timePart] = localIsoString.split(", ");
    const [lYear, lMonth, lDay] = datePart.split("-").map(Number);
    const [lHour, lMinute] = timePart.split(":").map(Number);

    const offsetMs = Date.UTC(lYear, lMonth - 1, lDay, lHour, lMinute) - tempDate.getTime();
    return new Date(tempDate.getTime() - offsetMs);
}