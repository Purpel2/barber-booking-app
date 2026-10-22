import { getProfileData } from "./actions";
import FavoriteBarberCard from "./_components/FavoriteBarberCard";
import ServiceCollageThumbnail from "./_components/ServiceCollageThumbnail";
import { redirect } from "next/navigation";
import { createGoogleCalendarUrl, createIcsDataUrl } from "@/lib/calendar";
import CancelButton from "./_components/CancelButton";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    User as UserIcon,
    ExternalLink,
    ChevronRight,
    Clock,
    Star,
    Headphones,
    ArrowUpRight,
    CreditCard,
    Banknote,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Download,
} from "lucide-react";

/**
 * Funkcja getRelativeTimeLabel przyjmuje datę docelową i aktualną datę, a następnie zwraca etykietę tekstową opisującą, jak daleko w przyszłości znajduje się data docelowa w stosunku do dzisiejszej daty. Obsługuje różne przypadki, takie jak "Dziś", "Jutro", "Pojutrze", "Za X dni" oraz "Za tydzień" lub "Za X tygodni".
 * @param targetDate - Data docelowa, dla której ma zostać obliczona etykieta czasu względnego.
 * @param now - Aktualna data, używana do porównania z datą docelową.
 * @returns Zwraca ciąg znaków reprezentujący etykietę czasu względnego dla daty docelowej.
 * @throws Błąd, jeśli data docelowa lub aktualna data nie są prawidłowymi obiektami Date.
 */
function getRelativeTimeLabel(targetDate: Date, now: Date): string {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Dziś";
    if (diffDays === 1) return "Jutro";
    if (diffDays === 2) return "Pojutrze";
    if (diffDays > 2 && diffDays < 7) return `Za ${diffDays} dni`;
    if (diffDays >= 7 && diffDays < 14) return "Za tydzień";
    if (diffDays >= 14) return `Za ${Math.round(diffDays / 7)} tyg.`;
    return "Wkrótce";
}

/**
 * Funkcja ProfilePage renderuje stronę profilu użytkownika, wyświetlając informacje o użytkowniku, nadchodzące wizyty, historię wizyt, preferowanego barbera oraz status subskrypcji. Pobiera dane użytkownika z bazy danych i odpowiednio je prezentuje. 
 * @returns Zwraca element JSX reprezentujący stronę profilu użytkownika.
 * @throws Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
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

    const cycleVisits = completedCount % 10;
    const isRewardReady = completedCount > 0 && cycleVisits === 0;
    const visitsLeft = isRewardReady ? 0 : 10 - cycleVisits;

    const isVipMember = Boolean(activeSubscription);
    const favoriteBarber = user.favoriteBarber;

    const upcomingDuration = upcoming?.services.reduce(
        (acc: number, s: { duration?: number }) => acc + (s.duration || 30),
        0
    ) || 45;

    const googleCalUrl = upcoming
        ? createGoogleCalendarUrl({
            title: `Wizyta: Fresh Cut (${upcoming.barber.name})`,
            description: `Usługi: ${upcoming.services.map((s: { service: { name: string } }) => s.service.name).join(", ")}`,
            location: "Fresh Cut Barbershop",
            startTime: new Date(upcoming.startTime),
            durationMinutes: upcomingDuration,
        })
        : "";

    const appleCalUrl = upcoming
        ? createIcsDataUrl({
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
    const relativeTimeLabel = upcoming ? getRelativeTimeLabel(new Date(upcoming.startTime), now) : null;

    return (
        <div className="space-y-8 w-full">
            <section className="pb-6 border-b border-surface-container-high/80">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-black/40 overflow-hidden relative">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.fullName || "Awatar"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-2xl font-black font-headline tracking-wide">
                                    {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                                </span>
                            )}
                        </div>
                        {isVipMember && (
                            <div className="absolute -bottom-1.5 -right-1.5 bg-primary text-background text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md z-10">
                                VIP
                            </div>
                        )}
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
                <div className="lg:col-span-6 bg-surface-container border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-primary">
                                    Najbliższa wizyta
                                </span>
                            </div>
                            {upcoming && relativeTimeLabel && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary bg-primary/10 border border-primary/25 px-3 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    <span>{relativeTimeLabel}</span>
                                </span>
                            )}
                        </div>

                        {upcoming ? (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                    <ServiceCollageThumbnail
                                        services={upcoming.services}
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-primary/20 bg-surface-container-high"
                                    />

                                    <div className="space-y-2 min-w-0 flex-1">
                                        <div>
                                            {isUpcomingPaidOnline ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-surface-container-high text-on-surface border border-outline-variant/30">
                                                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>Opłacono online</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                                                    <Banknote className="w-3.5 h-3.5 text-primary" />
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
                                                        <Image
                                                            src={upcoming.barber.imageUrl}
                                                            alt={upcoming.barber.name}
                                                            fill
                                                            sizes="20px"
                                                            className="object-cover"
                                                        />
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

                                <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70 block">Termin</span>
                                        <p className="text-sm sm:text-base font-headline font-bold text-primary flex flex-wrap items-center gap-2 mt-0.5">
                                            <span className="capitalize">
                                                {new Date(upcoming.startTime).toLocaleDateString("pl-PL", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "long",
                                                    timeZone: "Europe/Warsaw"
                                                })}
                                            </span>
                                            <span className="text-on-surface-variant/50 font-normal">•</span>
                                            <span>
                                                {new Date(upcoming.startTime).toLocaleTimeString("pl-PL", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    timeZone: "Europe/Warsaw"
                                                })}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                                        {googleCalUrl && (
                                            <a
                                                href={googleCalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-all"
                                            >
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                <span>Google</span>
                                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                            </a>
                                        )}
                                        {appleCalUrl && (
                                            <a
                                                href={appleCalUrl}
                                                download={`wizyta-${upcoming.id.slice(0, 6)}.ics`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-all"
                                            >
                                                <Download className="w-3.5 h-3.5 text-primary" />
                                                <span>Apple (.ics)</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center space-y-2">
                                <p className="text-sm font-bold text-on-surface">Brak zaplanowanych wizyt</p>
                                <p className="text-xs text-on-surface-variant">Nie masz obecnie żadnych oczekujących rezerwacji.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-surface-container-high/60 flex flex-wrap items-center justify-between gap-3">
                        {upcoming ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/reservations?rescheduleId=${upcoming.id}&barberId=${upcoming.barber.id}&serviceIds=${upcoming.services.map((s) => s.service.id).join(",")}`}
                                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                                    >
                                        Zmień termin
                                    </Link>
                                    <CancelButton reservationId={upcoming.id} />
                                </div>
                                <Link
                                    href="/profile/appointments"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors ml-auto"
                                >
                                    <span>Wszystkie wizyty</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/reservations"
                                className="w-full py-2.5 bg-primary text-background rounded-xl text-xs font-bold uppercase tracking-wider text-center hover:bg-primary-hover transition-colors"
                            >
                                Zarezerwuj wizytę
                            </Link>
                        )}
                    </div>
                </div>

                <FavoriteBarberCard favoriteBarber={favoriteBarber} barbers={barbers} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <section className="lg:col-span-6 bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
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
                                    const resDuration = res.services.reduce(
                                        (acc, s) => acc + (s.duration || 30),
                                        0
                                    ) || 45;
                                    const daysSinceVisit = Math.floor(
                                        (now.getTime() - new Date(res.startTime).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    );
                                    const hasReview = Boolean((res as unknown as { review?: { id: string } | null }).review);
                                    const canReview = !isCancelled && !hasReview && daysSinceVisit <= 30;

                                    return (
                                        <div
                                            key={res.id}
                                            className={`p-3.5 rounded-xl bg-surface-container/50 border border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${isCancelled ? "opacity-50" : ""}`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <ServiceCollageThumbnail services={res.services} />

                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                                                        {res.services.map((s) => s.service.name).join(" + ")}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-on-surface-variant mt-1">
                                                        <span>
                                                            {new Date(res.startTime).toLocaleDateString("pl-PL", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                                timeZone: "Europe/Warsaw",
                                                            })}
                                                        </span>
                                                        <span className="text-on-surface-variant/50">•</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-surface-container relative shrink-0 border border-primary/30">
                                                                {res.barber.imageUrl ? (
                                                                    <Image
                                                                        src={res.barber.imageUrl}
                                                                        alt={res.barber.name}
                                                                        fill
                                                                        sizes="20px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <UserIcon className="w-3 h-3 text-primary m-1" />
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-on-surface">
                                                                {res.barber.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-on-surface-variant/50">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-primary" /> {resDuration} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <Link
                                                    href={`/reservations?barberId=${res.barber.id}&serviceIds=${res.services.map((s) => s.service.id).join(",")}`}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-bright border border-surface-container-high text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                                                >
                                                    <RotateCcw className="w-3 h-3 text-primary" />
                                                    <span>Zarezerwuj ponownie</span>
                                                </Link>
                                                {!isCancelled && (
                                                    hasReview ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/20 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                            <span>Oceniono</span>
                                                        </span>
                                                    ) : canReview ? (
                                                        <Link
                                                            href={`/profile/appointments?reviewId=${res.id}`}
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/25 text-xs font-semibold text-primary transition-colors"
                                                        >
                                                            <Star className="w-3 h-3 fill-primary text-primary" />
                                                            <span>Oceń</span>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            title="Minęło 30 dni od wizyty"
                                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container/50 border border-outline-variant/20 text-xs font-semibold text-on-surface-variant/40 cursor-not-allowed select-none"
                                                        >
                                                            <Star className="w-3 h-3 text-on-surface-variant/30" />
                                                            <span>Oceń</span>
                                                        </button>
                                                    )
                                                )}
                                                {isCancelled ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-container-high/70 text-on-surface-variant/80 border border-outline-variant/25">
                                                        <XCircle className="w-3.5 h-3.5 text-red-400/80 shrink-0" />
                                                        <span>Anulowano</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-container-high/70 text-on-surface-variant border border-outline-variant/25">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                                                        <span>Zrealizowano</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="lg:col-span-3 bg-surface-container border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            {isVipMember ? (
                                <span className="bg-primary/20 text-primary border border-primary/40 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                    VIP
                                </span>
                            ) : (
                                <span className="bg-surface-container-high text-on-surface-variant/80 border border-outline-variant/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    Standard
                                </span>
                            )}
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                                Status Członkowski
                            </span>
                            <h4 className="font-headline font-black text-base text-on-surface">
                                {isVipMember ? `Klub VIP — Plan ${activeSubscription?.plan.name}` : "Karnety Członkowskie VIP"}
                            </h4>
                            {isVipMember && activeSubscription ? (
                                <div className="mt-2 space-y-1.5">
                                    <p className="text-[11px] text-on-surface-variant">
                                        Ważny do: <strong className="text-on-surface">{new Date(activeSubscription.expiresAt).toLocaleDateString("pl-PL")}</strong>
                                    </p>
                                    <ul className="space-y-1 text-[11px] text-on-surface-variant">
                                        {activeSubscription.plan.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5 leading-tight">
                                                <span className="text-primary font-bold text-xs shrink-0">✓</span>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                                    Wybierz plan (Fresh, Sharp lub Prime) i płać raz w miesiącu. Comiesięczne cięcia, szybkie odświeżenie, rabaty na kosmetyki oraz napoje w cenie.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-surface-container-high/60 space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-on-surface-variant text-[11px]">Karta stałego klienta:</span>
                                <span className="font-bold text-primary font-headline text-xs">
                                    {isRewardReady ? "Rabat -20% aktywny" : `${cycleVisits}/10 wizyt`}
                                </span>
                            </div>

                            <div className="grid grid-cols-10 gap-1 pt-0.5">
                                {Array.from({ length: 10 }).map((_, i) => {
                                    const step = i + 1;
                                    const isFilled = isRewardReady || step <= cycleVisits;
                                    const isTenth = step === 10;
                                    return (
                                        <div
                                            key={i}
                                            title={isTenth ? "10. wizyta: -20%" : `Wizyta ${step}`}
                                            className={`h-1.5 rounded-full transition-all ${isFilled
                                                ? isTenth
                                                    ? "bg-primary shadow-sm shadow-primary/40"
                                                    : "bg-primary/80"
                                                : "bg-surface-container-highest"
                                                }`}
                                        />
                                    );
                                })}
                            </div>

                            <p className="text-[10px] text-on-surface-variant/80 leading-tight">
                                {isRewardReady
                                    ? "Gratulacje! Przysługuje Ci 20% rabatu na kolejną wizytę."
                                    : `Co 10. wizyta -20%. Jeszcze ${visitsLeft} ${visitsLeft === 1 ? "wizyta" : visitsLeft < 5 ? "wizyty" : "wizyt"}.`}
                            </p>
                        </div>

                        <Link
                            href={isVipMember ? "/profile/billing" : "/membership"}
                            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-background font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-all text-center shadow-md shadow-primary/10"
                        >
                            <span>{isVipMember ? "Zarządzaj" : "Dołącz do VIP"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>

                <section className="lg:col-span-3 bg-surface-container border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl">
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

                    <a
                        href="tel:+48500100200"
                        className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/10 text-xs font-bold uppercase tracking-wider text-on-surface hover:text-primary transition-all text-center"
                    >
                        <span>Skontaktuj się z nami</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                </section>
            </div>
        </div>
    );
}
