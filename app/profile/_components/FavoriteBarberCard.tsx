"use client";

import { useState, useTransition } from "react";
import { User as UserIcon, Scissors, Check, Loader2, ArrowLeftRight } from "lucide-react";
import { updateFavoriteBarber } from "../actions";

interface BarberItem {
    id: string;
    name: string;
    role: string | null;
    imageUrl: string | null;
}

interface FavoriteBarberCardProps {
    favoriteBarber: BarberItem | null;
    barbers: BarberItem[];
}

/**
 * Komponent FavoriteBarberCard renderuje kartę z informacjami o preferowanym barberze użytkownika.
 * Umożliwia użytkownikowi zmianę preferowanego barbera lub wybranie opcji "Bez preferencji".
 * W trybie edycji wyświetla listę dostępnych barberów oraz przycisk do zapisania zmian.
 * W trybie podglądu wyświetla informacje o aktualnym preferowanym barberze lub brak preferencji.
 * Komponent obsługuje stany ładowania podczas zapisywania zmian.
 */
export default function FavoriteBarberCard({ favoriteBarber, barbers }: FavoriteBarberCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSelect(barberId: string | null) {
        startTransition(async () => {
            await updateFavoriteBarber(barberId);
            setIsEditing(false);
        });
    }

    return (
        <div className="lg:col-span-6 bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group min-h-72.5">
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        Preferowany Barber
                    </span>
                </div>
                {isPending && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-mono uppercase">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Zapisywanie...</span>
                    </span>
                )}
            </div>
            <div className="flex-1 flex flex-col justify-center py-3">
                {isEditing ? (
                    <div className="space-y-2.5 w-full">
                        <p className="text-xs text-on-surface-variant">
                            Wskaż fotel domyślny lub wybierz opcję bez preferencji:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            <button
                                type="button"
                                onClick={() => handleSelect(null)}
                                disabled={isPending}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl border border-dashed transition-all cursor-pointer text-left ${favoriteBarber === null
                                    ? "border-primary bg-primary/10"
                                    : "border-primary/30 hover:border-primary bg-surface-container/50 hover:bg-surface-container"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-semibold text-on-surface block truncate">Bez preferencji</span>
                                        <span className="text-[10px] text-on-surface-variant block truncate">Dowolny barber</span>
                                    </div>
                                </div>
                                {favoriteBarber === null ? (
                                    <Check className="w-4 h-4 text-primary shrink-0" />
                                ) : (
                                    <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">Wybierz</span>
                                )}
                            </button>

                            {barbers.map((b) => {
                                const isCurrent = favoriteBarber?.id === b.id;
                                return (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => handleSelect(b.id)}
                                        disabled={isPending}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${isCurrent
                                            ? "border-primary bg-primary/10"
                                            : "border-surface-container-high/60 hover:border-primary/40 bg-surface-container/50 hover:bg-surface-container"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-surface-container-high overflow-hidden relative shrink-0">
                                                {b.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-primary m-2" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-semibold text-on-surface block truncate">{b.name}</span>
                                                <span className="text-[10px] text-on-surface-variant block truncate">{b.role || "Barber"}</span>
                                            </div>
                                        </div>
                                        {isCurrent ? (
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                        ) : (
                                            <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">Wybierz</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : favoriteBarber ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-surface-container-high border border-primary/20 shadow-lg">
                            {favoriteBarber.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={favoriteBarber.imageUrl}
                                    alt={favoriteBarber.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#201f1f] text-primary gap-1">
                                    <UserIcon className="w-10 h-10" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Barber</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        </div>

                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    {favoriteBarber.role || "Barber"}
                                </span>
                            </div>

                            <h3 className="font-headline font-black text-xl sm:text-2xl text-on-surface tracking-tight truncate">
                                {favoriteBarber.name}
                            </h3>

                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Twój preferowany barber w salonie. Każda nowa rezerwacja automatycznie wybiera jego fotel.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl bg-surface-container-high/60 border border-dashed border-primary/30 flex flex-col items-center justify-center text-primary gap-2 shadow-inner">
                            <Scissors className="w-8 h-8" />
                            <span className="text-[9px] uppercase font-bold tracking-widest text-primary/80 text-center px-2">
                                Dowolny fotel
                            </span>
                        </div>

                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant border border-outline-variant/20">
                                    Domyślne
                                </span>
                            </div>

                            <h3 className="font-headline font-black text-xl sm:text-2xl text-on-surface tracking-tight">
                                Brak preferencji
                            </h3>

                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Jeśli masz swojego ulubionego barbera, wskaż go tutaj - będzie automatycznie wybierany przy Twoich kolejnych rezerwacjach.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4 mt-2 border-t border-surface-container-high/60">
                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isPending}
                    className="w-full py-2.5 px-4 rounded-xl border border-surface-container-high hover:border-primary/40 bg-surface-container/40 hover:bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface hover:text-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                    <span>{isEditing ? "Anuluj zmianę" : "Zmień preferowanego barbera"}</span>
                </button>
            </div>
        </div>
    );
}