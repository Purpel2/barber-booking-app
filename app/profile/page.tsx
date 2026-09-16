import { getProfileData, updateFavoriteBarber } from "./actions"; // upewnij się, że importujesz akcję zapisu
import { redirect } from "next/navigation";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import CancelButton from "./CancelButton";
import Link from "next/link";
import {
    Scissors,
    Calendar,
    User as UserIcon,
    Sparkles,
    ExternalLink,
    Lock,
    Bell,
    CreditCard,
    ChevronRight,
} from "lucide-react";

/**
 * ProfilePage to strona profilu użytkownika, która wyświetla informacje o zalogowanym użytkowniku, jego rezerwacjach i preferencjach.
 * Pobiera dane profilu i rezerwacji użytkownika z bazy danych przy użyciu funkcji getProfileData.
 * Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 * Strona renderuje sekcje z informacjami o użytkowniku, jego statusie w Fresh Cut, ulubionym stałym barberze, nadchodzących wizytach oraz historii rezerwacji.
 */
export default async function ProfilePage() {
    const data = await getProfileData();

    if (!data || !data.user) {
        redirect("/login?redirect=/profile");
    }

    const { user, reservations, barbers } = data;
    const now = new Date();

    const upcoming = reservations
        .filter((r) => new Date(r.startTime) >= now && r.status !== "CANCELLED")
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    const pastReservations = reservations.filter((r) => r.id !== upcoming?.id);

    const completedCount = reservations.filter(
        (r) => r.status === "CONFIRMED" && new Date(r.startTime) < now
    ).length;

    // Pobranie preferowanego barbera z danych użytkownika
    const favoriteBarber = (user as unknown as { favoriteBarber?: { id: string; name: string; role: string | null; imageUrl: string | null } | null }).favoriteBarber;

    const upcomingDuration = upcoming?.services.reduce((acc: number, s: { duration: number }) => acc + (s.duration || 30), 0) || 30;
    const googleCalUrl = upcoming
        ? createGoogleCalendarUrl({
            title: `Wizyta: Fresh Cut (${upcoming.barber.name})`,
            description: `Usługi: ${upcoming.services.map((s: { service: { name: string } }) => s.service.name).join(", ")}`,
            location: "Fresh Cut Barbershop",
            startTime: new Date(upcoming.startTime),
            durationMinutes: upcomingDuration,
        })
        : "";

    const userRaw = user as unknown as { isVip?: boolean; membershipActive?: boolean };
    const isVipMember = Boolean(userRaw.isVip || userRaw.membershipActive);

    return (
        <main className="min-h-screen bg-background text-[#e5e2e1] pt-24 pb-32 px-6 max-w-7xl mx-auto">
            <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#201f1f] border border-primary/20 flex items-center justify-center">
                            <UserIcon className="w-10 h-10 text-primary" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-background text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            {isVipMember ? "Członek VIP" : "Klient"}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                            {user.fullName || "Klient Salonu"}
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-[#e5e2e1]/40 tracking-wider uppercase">
                            <span>{user.email}</span>
                            <span>•</span>
                            <span>Dołączył {new Date(user.createdAt).getFullYear()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/reservations"
                        className="bg-primary text-background px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#d8b065] transition-all text-center"
                    >
                        Nowa rezerwacja
                    </Link>
                </div>
            </section>
            {/* Sekcja statusu VIP i preferowanego barbera */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 bg-[#1c1b1b] border border-surface-container-high rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
                    <Sparkles className="absolute -top-4 -right-4 w-40 h-40 text-primary/5 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Status w Fresh Cut
                            </span>
                            <Link
                                href="/membership"
                                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                                Sprawdź pakiety VIP <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl font-bold">{completedCount}</span>
                            <span className="text-sm font-medium text-[#e5e2e1]/40 uppercase">odbytych wizyt</span>
                        </div>
                        <p className="text-[#e5e2e1]/60 text-sm max-w-sm mb-8">
                            {isVipMember
                                ? "Posiadasz aktywny karnet Fresh Cut VIP. Wszystkie benefity są włączone."
                                : "Aktywuj comiesięczny abonament, aby otrzymać rabaty i stałe pierwszeństwo rezerwacji."}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: isVipMember ? "100%" : `${Math.min(completedCount * 10, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#e5e2e1]/40">
                            <span>Standardowy</span>
                            <span className="text-primary">{isVipMember ? "Aktywny VIP" : "Fresh Cut VIP"}</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 bg-[#1c1b1b] border border-surface-container-high rounded-xl p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5e2e1]/40">
                                Preferowany Barber
                            </span>
                            {favoriteBarber && (
                                <form action={async () => {
                                    "use server";
                                    await updateFavoriteBarber(null);
                                }}>
                                    <button type="submit" className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:underline cursor-pointer">
                                        Zmień / Usuń
                                    </button>
                                </form>
                            )}
                        </div>

                        {favoriteBarber ? (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-surface-container-high border border-primary/30 overflow-hidden flex items-center justify-center">
                                    {favoriteBarber.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={favoriteBarber.imageUrl}
                                            alt={favoriteBarber.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{favoriteBarber.name}</h3>
                                    <p className="text-xs text-primary font-semibold uppercase tracking-widest">
                                        {favoriteBarber.role || "Barber"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-[#e5e2e1]/60 mb-4">
                                    Nie masz jeszcze wybranego preferowanego barbera. Wskaż swojego specjalistę, aby system automatycznie zaznaczał go przy rezerwacjach:
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {barbers.map((b: { id: string; name: string; role: string | null; imageUrl: string | null }) => (
                                        <form key={b.id} action={async () => {
                                            "use server";
                                            await updateFavoriteBarber(b.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high border border-outline-variant/5 transition-all text-left cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-background overflow-hidden relative">
                                                        {b.imageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-4 h-4 text-primary m-2" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{b.name}</p>
                                                        <p className="text-[10px] text-on-surface-variant uppercase">{b.role || "Barber"}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                                                    Wybierz
                                                </span>
                                            </button>
                                        </form>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/reservations"
                        className="w-full py-3.5 mt-6 border border-[#e5e2e1]/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors text-center block"
                    >
                        Zarezerwuj wizytę
                    </Link>
                </div>

                {/* Sekcja nadchodzącej wizyty i historii rezerwacji */}
                <div className="md:col-span-5 bg-primary text-background rounded-xl p-8 flex flex-col justify-between shadow-lg">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] opacity-70">
                                Następna wizyta
                            </span>
                            <Calendar className="w-5 h-5 opacity-70" />
                        </div>
                        {upcoming ? (
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight mb-1">
                                    {upcoming.services.map((s: { service: { name: string } }) => s.service.name).join(" + ")}
                                </h2>
                                <p className="text-sm font-semibold opacity-90">
                                    {new Date(upcoming.startTime).toLocaleDateString("pl-PL", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    • {upcoming.barber.name}
                                </p>
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-lg font-bold">Brak zaplanowanych wizyt</p>
                                <p className="text-xs opacity-80 mt-1">Wybierz dogodny termin w salonie Fresh Cut.</p>
                            </div>
                        )}
                    </div>

                    {upcoming && (
                        <div className="mt-8 pt-6 border-t border-background/10 flex items-center justify-between gap-4">
                            <a
                                href={googleCalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-75 transition-opacity"
                            >
                                Dodaj do kalendarza <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <div className="flex items-center">
                                <CancelButton reservationId={upcoming.id} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-7 bg-[#1c1b1b] border border-surface-container-high rounded-xl p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5e2e1]/40">
                                Ostatnia historia
                            </span>
                            {pastReservations.length > 4 && (
                                <Link
                                    href="/profile/history"
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                >
                                    Zobacz wszystko
                                </Link>
                            )}
                        </div>

                        {pastReservations.length === 0 ? (
                            <p className="text-sm text-[#e5e2e1]/40 py-10 text-center">Brak wcześniejszych wizyt w historii.</p>
                        ) : (
                            <div className="space-y-4 max-h-72.5 overflow-y-auto pr-2">
                                {pastReservations.map((res: { id: string; status: string; startTime: Date; services: { service: { name: string } }[]; barber: { name: string } }) => {
                                    const isCancelled = res.status === "CANCELLED";
                                    return (
                                        <div
                                            key={res.id}
                                            className={`flex items-center justify-between pb-4 border-b border-surface-container-high last:border-0 ${isCancelled ? "opacity-40" : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#201f1f] flex items-center justify-center">
                                                    <Scissors className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {res.services.map((s) => s.service.name).join(", ")}
                                                    </p>
                                                    <p className="text-[10px] text-[#e5e2e1]/40 uppercase tracking-widest">
                                                        {new Date(res.startTime).toLocaleDateString("pl-PL", {
                                                            day: "numeric",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}{" "}
                                                        • {res.barber.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                {isCancelled ? (
                                                    <span className="text-[10px] px-2.5 py-1 bg-red-950/40 text-red-400 border border-red-900/60 rounded font-bold uppercase tracking-wider">
                                                        Anulowano
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2.5 py-1 bg-green-950/40 text-green-400 border border-green-900/60 rounded font-bold uppercase tracking-wider">
                                                        Ukończono
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sekcja ustawień konta */}
                <div className="md:col-span-12 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/profile/security"
                        className="bg-[#1c1b1b] border border-surface-container-high p-6 rounded-xl flex items-center gap-4 hover:border-primary/40 hover:bg-[#201f1f] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#201f1f] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Bezpieczeństwo</p>
                            <p className="text-[10px] text-[#e5e2e1]/40 uppercase tracking-widest">Zmień hasło i logowanie</p>
                        </div>
                    </Link>

                    <Link
                        href="/profile/notifications"
                        className="bg-[#1c1b1b] border border-surface-container-high p-6 rounded-xl flex items-center gap-4 hover:border-primary/40 hover:bg-[#201f1f] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#201f1f] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Preferencje</p>
                            <p className="text-[10px] text-[#e5e2e1]/40 uppercase tracking-widest">Powiadomienia SMS i Email</p>
                        </div>
                    </Link>

                    <Link
                        href="/profile/payments"
                        className="bg-[#1c1b1b] border border-surface-container-high p-6 rounded-xl flex items-center gap-4 hover:border-primary/40 hover:bg-[#201f1f] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#201f1f] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Płatności</p>
                            <p className="text-[10px] text-[#e5e2e1]/40 uppercase tracking-widest">Karty i faktury</p>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}