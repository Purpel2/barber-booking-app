import { ReactNode } from "react";
import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileMobileNav from "./_components/ProfileMobileNav";
import { getProfileData } from "./actions";
import { redirect } from "next/navigation";

/**
 * Funkcja ProfileLayout renderuje układ strony profilu użytkownika, w tym pasek boczny z informacjami o użytkowniku oraz główną zawartość strony.
 * Pobiera dane użytkownika, rezerwacje i subskrypcję z bazy danych i przekazuje je do komponentu ProfileSidebar.
 * @param children - Elementy JSX reprezentujące zawartość główną strony profilu.
 * @returns Zwraca element JSX reprezentujący układ strony profilu użytkownika.
 * @throws Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
export default async function ProfileLayout({ children }: { children: ReactNode }) {
    const data = await getProfileData();

    if (!data || !data.user) {
        redirect("/login?redirect=/profile");
    }

    const { user, reservations, activeSubscription } = data;
    const now = new Date();
    const completedCount = reservations.filter(
        (r) => r.status === "CONFIRMED" && new Date(r.startTime) < now
    ).length;

    const isVip = Boolean(activeSubscription);

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background text-[#e5e2e1] flex w-full">
            <ProfileSidebar
                user={{
                    fullName: user.fullName || "Klient Salonu",
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    isVip,
                    completedCount,
                }}
            />

            <main className="flex-1 min-w-0 w-full py-8 md:py-10 px-6 sm:px-8 lg:px-12">
                <ProfileMobileNav />
                {children}
            </main>
        </div>
    );
}
