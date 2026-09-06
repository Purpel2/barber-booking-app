export function createGoogleCalendarUrl(params: { // funkcja do tworzenia linku do dodania terminu do kalendarza gogle
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