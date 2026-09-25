import { getProfileData } from "./actions";
import FavoriteBarberCard from "./_components/FavoriteBarberCard";
import { redirect } from "next/navigation";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import CancelButton from "./_components/CancelButton";
import Link from "next/link";
import {
    Scissors,
    Calendar,
    User as UserIcon,
    Sparkles,
    ExternalLink,
    ChevronRight,
    Clock,
    Star,
    Headphones,
    ArrowUpRight,
} from "lucide-react";

/**
 * Podstrona profilu użytkownika wyświetlająca jego dane, najbliższą wizytę, historię wizyt oraz status VIP.
 * Sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase. Jeśli nie jest zalogowany, następuje przekierowanie na stronę logowania.
 * Pobiera dane profilu użytkownika, w tym informacje o użytkowniku, jego rezerwacjach, dostępnych barberach oraz aktywnej subskrypcji.
 * Renderuje komponenty wyświetlające najbliższą wizytę, historię wizyt, status VIP oraz informacje o ulubionym barberze.
 * Oblicza liczbę zakończonych wizyt oraz status VIP użytkownika na podstawie aktywnej subskrypcji.
 */
export default async function ProfilePage() {
    const data = await getProfileData();

    if (!data || !data.user) {
        redirect("/login?redirect=/profile");
    }

    const { user, reservations, barbers, activeSubscription } = data;
    const now = new Date();

    const upcoming = reservations
        .filter((r) => new Date(r.startTime) >= now && r.status !== "CANCELLED")
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    const pastReservations = reservations
        .filter((r) => r.id !== upcoming?.id)
        .slice(0, 3);

    const completedCount = reservations.filter(
        (r) => r.status === "CONFIRMED" && new Date(r.startTime) < now
    ).length;

    const isVipMember = Boolean(activeSubscription);
    const favoriteBarber = user.favoriteBarber;

    const upcomingDuration = upcoming?.services.reduce(
        (acc: number, s: { duration?: number }) => acc + (s.duration || 30),
        0
    ) || 45;

    const primaryServiceImage = upcoming?.services[0]?.service?.imageUrl;

    const googleCalUrl = upcoming
        ? createGoogleCalendarUrl({
            title: `Wizyta: Fresh Cut (${upcoming.barber.name})`,
            description: `Usługi: ${upcoming.services.map((s: { service: { name: string } }) => s.service.name).join(", ")}`,
            location: "Fresh Cut Barbershop",
            startTime: new Date(upcoming.startTime),
            durationMinutes: upcomingDuration,
        })
        : "";

    const memberSinceDate = new Date(user.createdAt).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const isUpcomingPaidOnline = (upcoming as unknown as { paymentMethod?: string })?.paymentMethod === "ONLINE";

    return (
        <div className="space-y-8 w-full">
            <section className="pb-6 border-b border-surface-container-high/80">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1c1b1b] border-2 border-primary/30 flex items-center justify-center text-primary shadow-lg">
                            <span className="text-2xl font-black font-headline">
                                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                            </span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-background text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
                            {isVipMember ? "VIP" : "Klient"}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
                            {user.fullName || "Klient Salonu"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-on-surface-variant mt-1">
                            <span className="font-medium text-on-surface/80">{user.email}</span>
                            <span>•</span>
                            <span>W klubie od <strong className="text-on-surface font-semibold">{memberSinceDate}</strong></span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6 bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-primary">
                                    Najbliższa wizyta
                                </span>
                            </div>
                            {upcoming && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span>Termin potwierdzony</span>
                                </span>
                            )}
                        </div>

                        {upcoming ? (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-surface-container-high border border-primary/20 shadow-md">
                                        {primaryServiceImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={primaryServiceImage}
                                                alt="Usługa"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#201f1f] text-primary gap-1">
                                                <Scissors className="w-8 h-8" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Fresh Cut</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 min-w-0 flex-1">
                                        <div>
                                            {isUpcomingPaidOnline ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <span>💳</span>
                                                    <span>Opłacono online</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <span>📍</span>
                                                    <span>Płatność w salonie</span>
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-headline font-black text-lg sm:text-xl text-on-surface tracking-tight leading-snug line-clamp-2">
                                            {upcoming.services.map((s: { service: { name: string } }) => s.service.name).join(" + ")}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant pt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full overflow-hidden bg-surface-container relative shrink-0 border border-primary/30">
                                                    {upcoming.barber.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={upcoming.barber.imageUrl} alt={upcoming.barber.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-3 h-3 text-primary m-1" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-on-surface">{upcoming.barber.name}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-primary" /> {upcomingDuration} min
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high/60 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block">Termin</span>
                                        <p className="text-sm font-bold text-primary">
                                            {new Date(upcoming.startTime).toLocaleDateString("pl-PL", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "long",
                                                timeZone: "Europe/Warsaw"
                                            })},{" "}
                                            {new Date(upcoming.startTime).toLocaleTimeString("pl-PL", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                timeZone: "Europe/Warsaw"
                                            })}
                                        </p>
                                    </div>

                                    {googleCalUrl && (
                                        <a
                                            href={googleCalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface transition-colors"
                                        >
                                            <Calendar className="w-3 h-3 text-primary" />
                                            <span>Kalendarz</span>
                                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-2">
                                <p className="text-sm font-bold text-on-surface">Brak zaplanowanych wizyt</p>
                                <p className="text-xs text-on-surface-variant">Nie masz obecnie oczekujących rezerwacji.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-surface-container-high/60 flex items-center justify-between">
                        {upcoming ? (
                            <CancelButton reservationId={upcoming.id} />
                        ) : (
                            <Link
                                href="/reservations"
                                className="w-full py-2.5 bg-primary text-background rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                            >
                                Zarezerwuj wizytę
                            </Link>
                        )}
                    </div>
                </div>

                <FavoriteBarberCard favoriteBarber={favoriteBarber} barbers={barbers} />
            </div>

            <section className="bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                <Sparkles className="absolute -top-6 -right-6 w-48 h-48 text-primary/5 pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Status w Fresh Cut
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                                {isVipMember ? "Członkostwo aktywne" : "Klub Standard"}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-on-surface">
                            {isVipMember ? activeSubscription?.plan.name : "Karnet Fresh Cut VIP"}
                        </h2>
                        <p className="text-xs text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
                            {isVipMember
                                ? `Subskrypcja aktywna do ${new Date(activeSubscription!.expiresAt).toLocaleDateString("pl-PL")}. Posiadasz gwarantowane zniżki na wszystkie usługi oraz pierwszeństwo przy wyborze terminów.`
                                : "Aktywuj pakiet członkowski lub zrealizuj 10 wizyt, aby odblokować status VIP, rabaty na usługi i dedykowany kalendarz rezerwacji."}
                        </p>
                    </div>

                    <div className="flex items-baseline gap-2 shrink-0 bg-surface-container/50 border border-surface-container-high/60 px-5 py-3 rounded-xl">
                        <span className="text-4xl font-black text-primary">{completedCount}</span>
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">odbytych wizyt</span>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: isVipMember ? "100%" : `${Math.min(completedCount * 10, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        <span>Poziom standardowy</span>
                        <span className="text-primary">{isVipMember ? "100% korzyści aktywnych" : `${Math.max(0, 10 - completedCount)} wizyt do statusu VIP`}</span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex justify-end">
                    <Link
                        href="/membership"
                        className="text-xs uppercase font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        {isVipMember ? "Szczegóły subskrypcji i pakiety" : "Zobacz plany subskrypcyjne"} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <section className="lg:col-span-9 bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                                    Ostatnie wizyty
                                </h3>
                                <p className="text-xs text-on-surface-variant">Podgląd zrealizowanych rezerwacji i możliwość dodania opinii</p>
                            </div>
                            <Link
                                href="/profile/appointments"
                                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                            >
                                Pełna historia <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {pastReservations.length === 0 ? (
                            <p className="text-xs text-on-surface-variant py-8 text-center">Brak wcześniejszych wizyt w historii salonu.</p>
                        ) : (
                            <div className="space-y-3">
                                {pastReservations.map((res) => {
                                    const isCancelled = res.status === "CANCELLED";
                                    return (
                                        <div
                                            key={res.id}
                                            className={`p-3.5 rounded-xl bg-surface-container/50 border border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCancelled ? "opacity-40" : ""}`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-9 h-9 rounded-lg bg-[#201f1f] flex items-center justify-center text-primary shrink-0">
                                                    <Scissors className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-on-surface">
                                                        {res.services.map((s) => s.service.name).join(" + ")}
                                                    </p>
                                                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                                                        {new Date(res.startTime).toLocaleDateString("pl-PL", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            timeZone: "Europe/Warsaw"
                                                        })} • {res.barber.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                                                {!isCancelled && (
                                                    <Link
                                                        href={`/profile/appointments/review?id=${res.id}`}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-[11px] font-semibold text-primary transition-colors"
                                                    >
                                                        <Star className="w-3 h-3 fill-primary text-primary" />
                                                        <span>Oceń</span>
                                                    </Link>
                                                )}
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isCancelled
                                                    ? "bg-red-950/40 text-red-400 border border-red-900/60"
                                                    : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60"
                                                    }`}>
                                                    {isCancelled ? "Anulowano" : "Zrealizowano"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="lg:col-span-3 bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Headphones className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-headline font-bold text-base text-on-surface">Potrzebujesz pomocy?</h4>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                Zmiana terminu, specjalne życzenia lub pytania techniczne.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/contact"
                        className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/10 text-xs font-bold uppercase tracking-wider text-on-surface hover:text-primary transition-all text-center"
                    >
                        <span>Kontakt</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </section>
            </div>
        </div>
    );
}