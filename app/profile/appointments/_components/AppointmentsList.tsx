"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    Clock,
    User as UserIcon,
    Scissors,
    Star,
    ExternalLink,
    FilterX,
    CreditCard,
    Banknote,
    CheckCircle2,
    XCircle,
    Download,
    RotateCcw,
    History,
} from "lucide-react";
import { createGoogleCalendarUrl, createIcsDataUrl } from "@/lib/calendar";
import CancelButton from "@/app/profile/_components/CancelButton";
import ServiceCollageThumbnail from "@/app/profile/_components/ServiceCollageThumbnail";
import ReviewModal from "./ReviewModal";

export type AppointmentItem = {
    id: string;
    startTime: string;
    endTime: string;
    status: "CONFIRMED" | "CANCELLED" | string;
    paymentMethod: "ONLINE" | "ON_SITE" | string;
    paymentStatus: string;
    totalPrice: number;
    hasReview?: boolean;
    barber: {
        id: string;
        name: string;
        role: string | null;
        imageUrl: string | null;
    };
    services: {
        id: string;
        duration: number;
        price: number;
        name: string;
        imageUrl: string | null;
        serviceId: string;
    }[];
};

interface AppointmentsListProps {
    initialReservations: AppointmentItem[];
    barbers: { id: string; name: string }[];
    services: { id: string; name: string }[];
    initialReviewId?: string;
}

type TabType = "all" | "upcoming" | "completed" | "cancelled";

/**
 * Funkcja getRelativeTimeDescription oblicza i zwraca opis względnego czasu w języku polskim na podstawie podanej daty wizyty i aktualnej daty. Zwraca odpowiednie opisy, takie jak "Dziś", "Jutro", "Pojutrze", "za X dni", "za tydzień" lub "za X tygodni".
 * @param dateString - Data wizyty w formacie string.
 * @param now - Aktualna data.
 * @returns Opis względnego czasu.
 */
function getRelativeTimeDescription(dateString: string, now: Date): string {
    const target = new Date(dateString);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Dziś";
    if (diffDays === 1) return "Jutro";
    if (diffDays === 2) return "Pojutrze";
    if (diffDays > 2 && diffDays <= 7) return `za ${diffDays} dni`;
    if (diffDays > 7 && diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? "za tydzień" : `za ${weeks} tyg.`;
    }
    return `za ${diffDays} dni`;
}

/**
 * Funkcja formatVisitDate formatuje datę wizyty w języku polskim, uwzględniając strefę czasową salonu. Zwraca sformatowaną datę w formacie "dzień miesiąc rok".
 * @param dateString - Data wizyty w formacie string.
 * @returns Sformatowana data.
 */
function formatVisitDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Warsaw",
    });
}

/**
 * Funkcja formatVisitTime formatuje godzinę wizyty w języku polskim, uwzględniając strefę czasową salonu. Zwraca sformatowaną godzinę w formacie "HH:MM".
 * @param dateString - Data i godzina wizyty w formacie string.
 * @returns Sformatowana godzina.
 */
function formatVisitTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Warsaw",
    });
}

/**
 * Funkcja AppointmentCard renderuje kartę wizyty z informacjami o wizycie, takimi jak data, godzina, barber, usługi, cena, status płatności i możliwość dodania do kalendarza. Zawiera również przyciski do zmiany terminu wizyty, anulowania wizyty oraz wystawienia opinii.
 * @param res - Obiekt reprezentujący wizytę.
 * @param now - Aktualna data.
 * @param reviewedIds - Zbiór identyfikatorów już ocenionych wizyt.
 * @param onReview - Funkcja wywoływana po wystawieniu opinii o wizycie.
 * @returns - Komponent karty wizyty z możliwością edycji i anulowania.
 */
function AppointmentCard({
    res,
    now,
    reviewedIds,
    onReview,
}: {
    res: AppointmentItem;
    now: Date;
    reviewedIds: Set<string>;
    onReview: (res: AppointmentItem) => void;
}) {
    const totalDuration = res.services.reduce(
        (acc, s) => acc + (s.duration || 30),
        0
    );
    const isPaidOnline = res.paymentMethod === "ONLINE";
    const isCancelled = res.status === "CANCELLED";
    const isUpcoming = !isCancelled && new Date(res.startTime) >= now;
    const isCompleted = !isCancelled && new Date(res.startTime) < now;

    const daysSinceVisit = Math.floor(
        (now.getTime() - new Date(res.startTime).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const canReview = isCompleted && daysSinceVisit <= 30;
    const hasActions = isUpcoming || isCompleted || canReview;

    const googleCalUrl = isUpcoming
        ? createGoogleCalendarUrl({
            title: `Wizyta: Fresh Cut (${res.barber.name})`,
            description: `Usługi: ${res.services.map((s) => s.name).join(", ")}`,
            location: "Fresh Cut Barbershop",
            startTime: new Date(res.startTime),
            durationMinutes: totalDuration,
        })
        : "";

    return (
        <div
            className={`rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3 transition-all ${isUpcoming
                ? "bg-linear-to-br from-surface-container/70 via-surface-container to-surface-container border-2 border-primary/40 shadow-primary/5 hover:border-primary/60"
                : isCancelled
                    ? "bg-surface-container border border-surface-container-high opacity-60 hover:opacity-85"
                    : "bg-surface-container border border-surface-container-high hover:border-surface-container-highest"
                }`}
        >
            <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <ServiceCollageThumbnail
                        services={res.services}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border bg-surface-container-high ${isUpcoming ? "border-primary/40" : "border-outline-variant/30"
                            }`}
                    />

                    <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {isUpcoming && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/30 tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span>NADCHODZĄCA</span>
                                    <span className="text-on-surface-variant font-medium">
                                        • {getRelativeTimeDescription(res.startTime, now)}
                                    </span>
                                </span>
                            )}

                            {isPaidOnline ? (
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

                            {isCancelled ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-container-high/70 text-on-surface-variant/80 border border-outline-variant/25">
                                    <XCircle className="w-3.5 h-3.5 text-red-400/80 shrink-0" />
                                    <span>Anulowano</span>
                                </span>
                            ) : isCompleted ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-container-high/70 text-on-surface-variant border border-outline-variant/25">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                                    <span>Zrealizowano</span>
                                </span>
                            ) : null}
                        </div>

                        <h3 className="font-headline font-black text-base sm:text-lg text-on-surface tracking-tight truncate">
                            {res.services.map((s) => s.name).join(" + ")}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-0.5">
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
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-primary" /> {totalDuration} min
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex flex-col items-end text-right gap-1.5 sm:self-start">
                    <p className={`text-xs sm:text-sm font-bold whitespace-nowrap ${isUpcoming ? "text-primary" : "text-on-surface-variant"}`}>
                        {formatVisitDate(res.startTime)}
                        <span className="mx-1.5 opacity-60">•</span>
                        <span className="font-mono">{formatVisitTime(res.startTime)}</span>
                    </p>

                    <span className="text-xl sm:text-2xl font-black text-white block leading-tight">
                        {res.totalPrice} zł
                    </span>
                </div>
            </div>

            {hasActions && (
                <div className="pt-2.5 border-t border-surface-container-high/60 flex flex-wrap items-center justify-between gap-3">
                    {isUpcoming ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                {googleCalUrl && (
                                    <a
                                        href={googleCalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface transition-colors"
                                    >
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        <span>Google</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                )}
                                <a
                                    href={createIcsDataUrl({
                                        title: `Wizyta: Fresh Cut (${res.barber.name})`,
                                        description: `Usługi: ${res.services.map((s) => s.name).join(", ")}`,
                                        location: "Fresh Cut Barbershop",
                                        startTime: new Date(res.startTime),
                                        durationMinutes: totalDuration,
                                    })}
                                    download={`wizyta-${res.id.slice(0, 6)}.ics`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5 text-primary" />
                                    <span>Apple (.ics)</span>
                                </a>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <Link
                                    href={`/reservations?rescheduleId=${res.id}&barberId=${res.barber.id}&serviceIds=${res.services.map((s) => s.serviceId).join(",")}`}
                                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright border border-surface-container-high text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                                >
                                    Zmień termin
                                </Link>
                                <CancelButton reservationId={res.id} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
                            <Link
                                href={`/reservations?barberId=${res.barber.id}&serviceIds=${res.services.map((s) => s.serviceId).join(",")}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright border border-surface-container-high text-xs font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                                <span>Zarezerwuj ponownie</span>
                            </Link>
                            {isCompleted && (
                                <div className="ml-auto">
                                    {reviewedIds.has(res.id) ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md text-emerald-400 bg-emerald-950/20 border border-emerald-500/25">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Opinia wystawiona</span>
                                        </span>
                                    ) : canReview ? (
                                        <button
                                            type="button"
                                            onClick={() => onReview(res)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-background font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/20 cursor-pointer"
                                        >
                                            <Star className="w-3.5 h-3.5 fill-background text-background" />
                                            <span>Oceń wizytę ({30 - daysSinceVisit} dni)</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            title="Minęło 30 dni od wizyty"
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/20 text-on-surface-variant/40 text-xs font-bold uppercase tracking-wider cursor-not-allowed select-none"
                                        >
                                            <Star className="w-3.5 h-3.5 text-on-surface-variant/30" />
                                            <span>Oceń wizytę</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Główny komponent listy wizyt, który wyświetla wszystkie wizyty użytkownika z możliwością filtrowania i sortowania.
 * @param initialReservations - Początkowa lista rezerwacji.
 * @param barbers - Lista barberów.
 * @param services - Lista usług.
 * @param initialReviewId - Opcjonalny identyfikator wizyty, dla której ma być wyświetlony modal opinii.
 * @returns - Komponent listy wizyt z możliwością filtrowania i sortowania.
 */
export default function AppointmentsList({
    initialReservations,
    barbers,
    services,
    initialReviewId,
}: AppointmentsListProps) {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [selectedBarberId, setSelectedBarberId] = useState<string>("ALL");
    const [selectedServiceId, setSelectedServiceId] = useState<string>("ALL");
    const [timeRange, setTimeRange] = useState<string>("ALL");

    const [reviewTarget, setReviewTarget] = useState<AppointmentItem | null>(() => {
        if (initialReviewId) {
            const match = initialReservations.find((r) => r.id === initialReviewId);
            if (match && !match.hasReview) return match;
        }
        return null;
    });

    const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => {
        const set = new Set<string>();
        for (const res of initialReservations) {
            if (res.hasReview) set.add(res.id);
        }
        return set;
    });

    const now = useMemo(() => new Date(), []);

    const categorized = useMemo(() => {
        const upcoming: AppointmentItem[] = [];
        const completed: AppointmentItem[] = [];
        const cancelled: AppointmentItem[] = [];

        for (const res of initialReservations) {
            const resDate = new Date(res.startTime);
            if (res.status === "CANCELLED") {
                cancelled.push(res);
            } else if (resDate >= now) {
                upcoming.push(res);
            } else {
                completed.push(res);
            }
        }

        upcoming.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        completed.sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        cancelled.sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        return { upcoming, completed, cancelled };
    }, [initialReservations, now]);

    const filterItem = useCallback(
        (res: AppointmentItem) => {
            if (selectedBarberId !== "ALL" && res.barber.id !== selectedBarberId) {
                return false;
            }

            if (
                selectedServiceId !== "ALL" &&
                !res.services.some((s) => s.serviceId === selectedServiceId)
            ) {
                return false;
            }

            if (timeRange !== "ALL") {
                const resTime = new Date(res.startTime).getTime();
                const daysDiff = (now.getTime() - resTime) / (1000 * 60 * 60 * 24);

                if (timeRange === "30_DAYS" && (daysDiff < 0 || daysDiff > 30)) {
                    return false;
                }
                if (timeRange === "90_DAYS" && (daysDiff < 0 || daysDiff > 90)) {
                    return false;
                }
                if (timeRange === "THIS_YEAR") {
                    const resYear = new Date(res.startTime).getFullYear();
                    if (resYear !== now.getFullYear()) return false;
                }
            }

            return true;
        },
        [selectedBarberId, selectedServiceId, timeRange, now]
    );

    const filteredUpcoming = useMemo(
        () => categorized.upcoming.filter(filterItem),
        [categorized.upcoming, filterItem]
    );

    const filteredCompleted = useMemo(
        () => categorized.completed.filter(filterItem),
        [categorized.completed, filterItem]
    );

    const filteredCancelled = useMemo(
        () => categorized.cancelled.filter(filterItem),
        [categorized.cancelled, filterItem]
    );

    const filteredHistory = useMemo(() => {
        return [...filteredCompleted, ...filteredCancelled].sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    }, [filteredCompleted, filteredCancelled]);


    /**
     * Funkcja resetująca filtry.
     * Ustawia wszystkie filtry na wartość "ALL", co oznacza brak aktywnych filtrów.
     */
    function resetFilters() {
        setSelectedBarberId("ALL");
        setSelectedServiceId("ALL");
        setTimeRange("ALL");
    }

    const hasActiveFilters =
        selectedBarberId !== "ALL" ||
        selectedServiceId !== "ALL" ||
        timeRange !== "ALL";

    const hasAnyResults =
        activeTab === "all"
            ? filteredUpcoming.length > 0 || filteredHistory.length > 0
            : activeTab === "upcoming"
                ? filteredUpcoming.length > 0
                : activeTab === "completed"
                    ? filteredCompleted.length > 0
                    : filteredCancelled.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-high pb-4">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container/60 border border-surface-container-high">
                    <button
                        type="button"
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "all"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "text-on-surface-variant hover:text-on-surface"
                            }`}
                    >
                        Wszystkie ({initialReservations.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("upcoming")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "upcoming"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "text-on-surface-variant hover:text-on-surface"
                            }`}
                    >
                        Nadchodzące ({categorized.upcoming.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("completed")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "completed"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "text-on-surface-variant hover:text-on-surface"
                            }`}
                    >
                        Zrealizowane ({categorized.completed.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("cancelled")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "cancelled"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "text-on-surface-variant hover:text-on-surface"
                            }`}
                    >
                        Anulowane ({categorized.cancelled.length})
                    </button>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:underline uppercase tracking-wider cursor-pointer"
                    >
                        <FilterX className="w-3.5 h-3.5" />
                        <span>Wyczyść filtry</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70 mb-1.5">
                        Barber
                    </label>
                    <select
                        value={selectedBarberId}
                        onChange={(e) => setSelectedBarberId(e.target.value)}
                        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="ALL">Wszyscy barberzy</option>
                        {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70 mb-1.5">
                        Usługa
                    </label>
                    <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="ALL">Wszystkie usługi</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70 mb-1.5">
                        Okres
                    </label>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="ALL">Cała historia</option>
                        <option value="30_DAYS">Ostatnie 30 dni</option>
                        <option value="90_DAYS">Ostatnie 3 miesiące</option>
                        <option value="THIS_YEAR">Ten rok</option>
                    </select>
                </div>
            </div>

            {!hasAnyResults ? (
                <div className="p-12 text-center bg-surface-container border border-surface-container-high rounded-2xl space-y-3">
                    <Scissors className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
                    <p className="text-sm font-bold text-on-surface">
                        Brak wizyt dla wybranych kryteriów
                    </p>
                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                        Nie znaleziono pozycji w zakładce{" "}
                        {activeTab === "all"
                            ? "wszystkich wizyt"
                            : activeTab === "upcoming"
                                ? "nadchodzących"
                                : activeTab === "completed"
                                    ? "zrealizowanych"
                                    : "anulowanych"}
                        . Zmień filtry lub umów nowy termin.
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-2 px-4 py-2 bg-surface-container-high hover:bg-surface-bright rounded-xl text-xs font-bold text-primary uppercase tracking-wider cursor-pointer"
                        >
                            Resetuj filtry
                        </button>
                    )}
                </div>
            ) : activeTab === "all" ? (
                <div className="space-y-8">
                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                </span>
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface">
                                    Nadchodzące wizyty ({filteredUpcoming.length})
                                </h2>
                            </div>
                        </div>

                        {filteredUpcoming.length > 0 ? (
                            <div className="space-y-3.5">
                                {filteredUpcoming.map((res) => (
                                    <AppointmentCard
                                        key={res.id}
                                        res={res}
                                        now={now}
                                        reviewedIds={reviewedIds}
                                        onReview={setReviewTarget}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl bg-surface-container border border-dashed border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface">
                                            Brak zaplanowanych wizyt
                                        </p>
                                        <p className="text-[11px] text-on-surface-variant">
                                            Twój terminarz jest wolny. Umów kolejną wizytę u barbera.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/reservations"
                                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-background font-bold text-xs uppercase tracking-wider transition-all shrink-0"
                                >
                                    Umów wizytę
                                </Link>
                            </div>
                        )}
                    </section>

                    <section className="space-y-3 pt-2">
                        <div className="flex items-center justify-between gap-3 border-t border-surface-container-high/60 pt-6">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-on-surface-variant/70" />
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface">
                                    Historia wizyt ({filteredHistory.length})
                                </h2>
                            </div>
                        </div>

                        {filteredHistory.length > 0 ? (
                            <div className="space-y-3.5">
                                {filteredHistory.map((res) => (
                                    <AppointmentCard
                                        key={res.id}
                                        res={res}
                                        now={now}
                                        reviewedIds={reviewedIds}
                                        onReview={setReviewTarget}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface-variant/70">
                                Brak zakończonych wizyt w wybranym okresie.
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {(activeTab === "upcoming"
                        ? filteredUpcoming
                        : activeTab === "completed"
                            ? filteredCompleted
                            : filteredCancelled
                    ).map((res) => (
                        <AppointmentCard
                            key={res.id}
                            res={res}
                            now={now}
                            reviewedIds={reviewedIds}
                            onReview={setReviewTarget}
                        />
                    ))}
                </div>
            )}

            {reviewTarget && (
                <ReviewModal
                    reservationId={reviewTarget.id}
                    serviceNames={reviewTarget.services.map((s) => s.name).join(" + ")}
                    barberName={reviewTarget.barber.name}
                    onClose={() => setReviewTarget(null)}
                    onSuccess={(id) => {
                        setReviewedIds((prev) => new Set(prev).add(id));
                    }}
                />
            )}
        </div>
    );
}
