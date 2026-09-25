"use client";

import { useState, useMemo } from "react";
import {
    Calendar,
    Clock,
    User as UserIcon,
    Scissors,
    Star,
    ExternalLink,
    FilterX,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import CancelButton from "@/app/profile/_components/CancelButton";
import ReviewModal from "./ReviewModal";
import Image from "next/image";

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
}

type TabType = "all" | "upcoming" | "completed" | "cancelled";

/**
 * Komponent AppointmentsList renderuje listę wizyt użytkownika w sekcji profilu.
 * Umożliwia filtrowanie wizyt według statusu, barbera, usługi oraz okresu czasu.
 * Wyświetla szczegóły wizyty, takie jak data, godzina, barber, usługi, status płatności oraz możliwość dodania opinii.
 * Obsługuje również stany ładowania i brak wizyt dla wybranych kryteriów.
 */
export default function AppointmentsList({
    initialReservations,
    barbers,
    services,
}: AppointmentsListProps) {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [selectedBarberId, setSelectedBarberId] = useState<string>("ALL");
    const [selectedServiceId, setSelectedServiceId] = useState<string>("ALL");
    const [timeRange, setTimeRange] = useState<string>("ALL");

    const [reviewTarget, setReviewTarget] = useState<AppointmentItem | null>(null);
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

    const filteredList = useMemo(() => {
        const source =
            activeTab === "all"
                ? [...initialReservations].sort(
                    (a, b) =>
                        new Date(b.startTime).getTime() -
                        new Date(a.startTime).getTime()
                )
                : categorized[activeTab as Exclude<TabType, "all">];

        return source.filter((res) => {
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
        });
    }, [
        categorized,
        initialReservations,
        activeTab,
        selectedBarberId,
        selectedServiceId,
        timeRange,
        now,
    ]);

    function resetFilters() {
        setSelectedBarberId("ALL");
        setSelectedServiceId("ALL");
        setTimeRange("ALL");
    }

    const hasActiveFilters =
        selectedBarberId !== "ALL" ||
        selectedServiceId !== "ALL" ||
        timeRange !== "ALL";

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
                        className="w-full bg-[#1c1b1b] border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
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
                        className="w-full bg-[#1c1b1b] border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
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
                        className="w-full bg-[#1c1b1b] border border-surface-container-high rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="ALL">Cała historia</option>
                        <option value="30_DAYS">Ostatnie 30 dni</option>
                        <option value="90_DAYS">Ostatnie 3 miesiące</option>
                        <option value="THIS_YEAR">Ten rok</option>
                    </select>
                </div>
            </div>

            {filteredList.length === 0 ? (
                <div className="p-12 text-center bg-[#1c1b1b] border border-surface-container-high rounded-2xl space-y-3">
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
            ) : (
                <div className="space-y-4">
                    {filteredList.map((res) => {
                        const totalDuration = res.services.reduce(
                            (acc, s) => acc + (s.duration || 30),
                            0
                        );
                        const primaryImage = res.services[0]?.imageUrl;
                        const isPaidOnline = res.paymentMethod === "ONLINE";
                        const isCancelled = res.status === "CANCELLED";
                        const isCompleted = !isCancelled && new Date(res.startTime) < now;

                        const daysSinceVisit = Math.floor(
                            (now.getTime() - new Date(res.startTime).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const canReview = isCompleted && daysSinceVisit <= 30;
                        const isUpcoming = !isCancelled && new Date(res.startTime) >= now;
                        const hasActions = isUpcoming || canReview;

                        const googleCalUrl = isUpcoming
                            ? createGoogleCalendarUrl({
                                title: `Wizyta: Fresh Cut (${res.barber.name})`,
                                description: `Usługi: ${res.services.map((s) => s.name).join(", ")}`,
                                location: "Fresh Cut Barbershop",
                                startTime: new Date(res.startTime),
                                durationMinutes: totalDuration,
                            })
                            : "";

                        const isPast = new Date(res.startTime) < now;
                        const isGreyedOut = isCancelled || isPast;

                        return (
                            <div
                                key={res.id}
                                className={`bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3 transition-all ${isGreyedOut ? "opacity-60 hover:opacity-80" : ""
                                    }`}
                            >
                                <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-surface-container-high border border-primary/20 shadow-md">
                                            {primaryImage ? (
                                                <Image
                                                    src={primaryImage}
                                                    alt="Usługa"
                                                    fill
                                                    sizes="(max-width: 640px) 80px, 96px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#201f1f] text-primary">
                                                    <Scissors className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {isPaidOnline ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span>💳</span>
                                                        <span>Opłacono online</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <span>📍</span>
                                                        <span>Płatność w salonie</span>
                                                    </span>
                                                )}

                                                {isCancelled ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/60">
                                                        <XCircle className="w-3 h-3" />
                                                        <span>Anulowano</span>
                                                    </span>
                                                ) : isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Zrealizowano</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                        <span>Termin potwierdzony</span>
                                                    </span>
                                                )}
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
                                                    <Clock className="w-3 h-3 text-primary" /> {totalDuration} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end text-right gap-1.5 sm:self-start">
                                        <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                                            {new Date(res.startTime).toLocaleDateString("pl-PL", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                timeZone: "Europe/Warsaw",
                                            })}
                                            <span className="mx-1.5 opacity-60">•</span>
                                            <span className="font-mono">
                                                {new Date(res.startTime).toLocaleTimeString("pl-PL", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    timeZone: "Europe/Warsaw",
                                                })}
                                            </span>
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
                                                <div className="flex items-center gap-2">
                                                    {googleCalUrl && (
                                                        <a
                                                            href={googleCalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface transition-colors"
                                                        >
                                                            <Calendar className="w-3 h-3 text-primary" />
                                                            <span>Google Kalendarz</span>
                                                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                        </a>
                                                    )}
                                                </div>
                                                <CancelButton reservationId={res.id} />
                                            </>
                                        ) : canReview ? (
                                            <div className="ml-auto opacity-100">
                                                {reviewedIds.has(res.id) ? (
                                                    <span className="text-[11px] font-bold text-emerald-400">
                                                        ✓ Opinia wystawiona
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setReviewTarget(res)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-background font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/20 cursor-pointer"
                                                    >
                                                        <Star className="w-3.5 h-3.5 fill-background text-background" />
                                                        <span>Oceń wizytę ({30 - daysSinceVisit} dni)</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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