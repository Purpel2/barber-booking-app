import { getProfileData } from "../actions";
import { redirect } from "next/navigation";
import SettingsClient from "./_components/SettingsClient";

export const dynamic = "force-dynamic";

/**
 * Funkcja ProfileSettingsPage renderuje stronę ustawień profilu użytkownika. Pobiera dane użytkownika, dostępnych barberów oraz informacje o aktywnej subskrypcji z bazy danych i przekazuje je do komponentu SettingsClient.
 * @returns Zwraca element JSX reprezentujący stronę ustawień profilu użytkownika.
 * @throws Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
export default async function ProfileSettingsPage() {
    const data = await getProfileData();

    if (!data || !data.user) {
        redirect("/login?redirect=/profile/settings");
    }

    const { user, barbers, activeSubscription } = data;
    const isVip = Boolean(activeSubscription);

    return (
        <SettingsClient
            user={user}
            barbers={barbers}
            isVip={isVip}
        />
    );
}
