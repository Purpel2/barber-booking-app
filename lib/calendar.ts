/**
 * Funkcja createGoogleCalendarUrl generuje URL do dodania wydarzenia do kalendarza Google na podstawie podanych parametrów, takich jak tytuł, opis, lokalizacja, czas rozpoczęcia i czas trwania wydarzenia.
 * Zwraca URL, który można wykorzystać do otwarcia formularza dodawania wydarzenia w kalendarzu Google.
 * @param params - Obiekt zawierający tytuł, opis, lokalizację, czas rozpoczęcia i czas trwania wydarzenia.
 * @returns Zwraca URL do dodania wydarzenia do kalendarza Google.
 */
export function createGoogleCalendarUrl(params: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    durationMinutes: number;
}) {
    const start = new Date(params.startTime);
    const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);

    const formatTime = (d: Date) =>
        d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const dates = `${formatTime(start)}/${formatTime(end)}`;

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", params.title);
    url.searchParams.set("details", params.description);
    url.searchParams.set("location", params.location);
    url.searchParams.set("dates", dates);

    return url.toString();
}

/**
 * Funkcja createIcsDataUrl generuje dane w formacie iCalendar (ICS) dla wydarzenia na podstawie podanych parametrów, takich jak tytuł, opis, lokalizacja, czas rozpoczęcia i czas trwania wydarzenia.
 * Zwraca URL danych w formacie iCalendar, który można wykorzystać do dodania wydarzenia do kalendarza.
 * @param params - Obiekt zawierający tytuł, opis, lokalizację, czas rozpoczęcia i czas trwania wydarzenia.
 * @returns Zwraca URL danych w formacie iCalendar (ICS).
 */
export function createIcsDataUrl(params: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    durationMinutes: number;
}) {
    const start = new Date(params.startTime);
    const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);

    const formatTime = (d: Date) =>
        d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Fresh Cut Studio//Barber Booking//PL",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `SUMMARY:${params.title.replace(/,/g, "\\,")}`,
        `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
        `LOCATION:${params.location.replace(/,/g, "\\,")}`,
        `DTSTART:${formatTime(start)}`,
        `DTEND:${formatTime(end)}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}

/**
 * Funkcja parseWarsawTimeToUTC konwertuje podaną datę i godzinę w strefie czasowej Warszawy na obiekt Date w formacie UTC.
 * @param dateStr - Data w formacie "YYYY-MM-DD".
 * @param timeStr - Czas w formacie "HH:mm".
 * @returns Zwraca obiekt Date reprezentujący podaną datę i godzinę w formacie UTC.
 */
export function parseWarsawTimeToUTC(dateStr: string, timeStr: string): Date {
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
