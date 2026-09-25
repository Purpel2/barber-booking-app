import { ReactNode } from "react";
import ProfileSidebar from "./_components/ProfileSidebar";
import { getProfileData } from "./actions";
import { redirect } from "next/navigation";

/**
 * Komponent ProfileLayout jest głównym układem dla sekcji profilu użytkownika.
 * Sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, następuje przekierowanie na stronę logowania.
 * Pobiera dane profilu użytkownika, w tym informacje o użytkowniku, jego rezerwacjach oraz aktywnej subskrypcji.
 * Renderuje boczny panel nawigacyjny (ProfileSidebar) z informacjami o użytkowniku oraz główną zawartość (children) dla podstron profilu.
 * Oblicza liczbę zakończonych wizyt oraz status VIP użytkownika na podstawie aktywnej subskrypcji.
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
        <div className="min-h-screen bg-background text-[#e5e2e1] pt-21.25 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
                <ProfileSidebar
                    user={{
                        fullName: user.fullName || "Klient Salonu",
                        email: user.email,
                        isVip,
                        completedCount,
                    }}
                />

                <main className="flex-1 min-w-0 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}