import { getUserNotifications } from "./actions";
import NotificationsClient from "./_components/NotificationsClient";

export const dynamic = "force-dynamic";

/**
 * Funkcja NotificationsPage renderuje stronę powiadomień w profilu użytkownika. Pobiera powiadomienia użytkownika z bazy danych i przekazuje je do komponentu NotificationsClient.
 * @returns Zwraca element JSX reprezentujący stronę powiadomień w profilu użytkownika.
 * @throws Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
export default async function NotificationsPage() {
    const { notifications, unreadCount } = await getUserNotifications();

    return (
        <NotificationsClient
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
        />
    );
}
