"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export type BarberOption = {
    id: string;
    name: string;
    role: string | null;
    imageUrl: string;
};

export type ServiceOption = {
    id: string;
    name: string;
    price: number;
    duration: number;
    bufferTime: number;
};

interface BookingFormProps {
    barbers: BarberOption[];
    services: ServiceOption[];
    initialServiceId?: string;
}

// wyznaczenie lokalnego jutra w formacie YYYY-MM-DD
function getLocalTomorrowString(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * BookingForm to komponent klienta, który renderuje formularz rezerwacji wizyty u barbera.
 * Umożliwia użytkownikowi wybór usługi, barbera, daty i godziny wizyty.
 * Komponent pobiera dostępne sloty godzinowe z API na podstawie wybranych kryteriów.
 * Po wybraniu wszystkich parametrów, użytkownik może potwierdzić rezerwację, która zostanie wysłana do API.
 */
export default function BookingForm({ barbers, services, initialServiceId }: BookingFormProps) {
    const router = useRouter();

    const [selectedServiceId, setSelectedServiceId] = useState<string>(
        initialServiceId || (services[0]?.id ?? "")
    );
    const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id ?? "");
    const [selectedDate, setSelectedDate] = useState<string>(getLocalTomorrowString);

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const activeService = services.find((s) => s.id === selectedServiceId);
    const activeBarber = barbers.find((b) => b.id === selectedBarberId);

    // Pobieranie wolnych slotów
    useEffect(() => {
        if (!selectedBarberId || !selectedServiceId || !selectedDate) return;

        let isMounted = true;
        setIsLoadingSlots(true);
        setErrorMessage(null);
        setSelectedSlot(null); // Reset slotu przy zmianie kryteriów

        fetch(`/api/availability?barberId=${selectedBarberId}&serviceId=${selectedServiceId}&date=${selectedDate}`)
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Błąd pobierania terminów");
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setAvailableSlots(data.slots || []);
                }
            })
            .catch((err: Error) => {
                if (isMounted) {
                    setErrorMessage(err.message);
                    setAvailableSlots([]);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingSlots(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedBarberId, selectedServiceId, selectedDate]);

    const handleBooking = async () => {
        if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedSlot) {
            setErrorMessage("Wybierz wszystkie parametry wizyty.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barberId: selectedBarberId,
                    serviceId: selectedServiceId,
                    dateStr: selectedDate,
                    slotTime: selectedSlot,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Rezerwacja nie powiodła się.");
            }

            router.push(`/reservations/success?id=${data.reservation.id}`);
            router.refresh();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Wystąpił nieoczekiwany błąd.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolumny konfiguracji */}
            <div className="lg:col-span-2 space-y-8">
                {/* 1. Usługa */}
                <section className="bg-surface-container-high/40 border border-surface-container-highest rounded-3xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-['Epilogue'] font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-black">
                            1
                        </span>
                        Wybierz Usługę
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {services.map((svc) => {
                            const isSelected = svc.id === selectedServiceId;
                            return (
                                <button
                                    key={svc.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedServiceId(svc.id);
                                        setSelectedSlot(null);
                                    }}
                                    className={`p-4 rounded-2xl text-left border transition-all ${isSelected
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                        : "border-surface-container-highest bg-background/60 hover:border-primary/40"
                                        }`}
                                >
                                    <div className="font-bold text-sm text-on-surface">{svc.name}</div>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-primary font-bold">{svc.price} zł</span>
                                        <span className="text-on-surface-variant/60 flex items-center gap-1 font-mono">
                                            <Clock className="w-3 h-3" /> {svc.duration} MIN
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Barber */}
                <section className="bg-surface-container-high/40 border border-surface-container-highest rounded-3xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-['Epilogue'] font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-black">
                            2
                        </span>
                        Wybierz Barbera
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {barbers.map((barber) => {
                            const isSelected = barber.id === selectedBarberId;
                            return (
                                <button
                                    key={barber.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedBarberId(barber.id);
                                        setSelectedSlot(null);
                                    }}
                                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${isSelected
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                        : "border-surface-container-highest bg-background/60 hover:border-primary/40"
                                        }`}
                                >
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border border-primary/20">
                                        <Image
                                            src={barber.imageUrl || "/images/barber-placeholder.webp"}
                                            alt={barber.name}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="font-bold text-sm text-on-surface">{barber.name}</div>
                                    <div className="text-[11px] text-on-surface-variant/70">{barber.role || "Barber"}</div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Data i Siatka Godzin */}
                <section className="bg-surface-container-high/40 border border-surface-container-highest rounded-3xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-['Epilogue'] font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-black">
                            3
                        </span>
                        Termin i Godzina
                    </h2>

                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-on-surface-variant/70 mb-2 font-semibold">
                            Dzień wizyty
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={getLocalTomorrowString()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-background/80 border border-surface-container-highest rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary w-full sm:w-auto cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-on-surface-variant/70 mb-3 font-semibold">
                            Dostępne godziny (Siatka 15 min)
                        </label>

                        {isLoadingSlots ? (
                            <div className="flex items-center justify-center py-12 text-on-surface-variant/60 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-sm">Analizowanie kalendarza...</span>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                {availableSlots.map((slot) => {
                                    const isSelected = selectedSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all ${isSelected
                                                ? "bg-primary text-on-primary border-primary scale-105 shadow-md shadow-primary/20"
                                                : "bg-background/80 border-surface-container-highest text-on-surface hover:border-primary/50"
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/30 text-center text-sm text-red-300">
                                Brak dostępnych terminów dla tego dnia. Wybierz inną datę lub innego specjalistę.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Podsumowanie rezerwacji */}
            <div>
                <div className="bg-surface-container-high/40 border border-surface-container-highest rounded-3xl p-6 sticky top-28 backdrop-blur-md">
                    <h3 className="font-['Epilogue'] text-lg font-bold text-on-surface mb-6 pb-4 border-b border-surface-container-highest">
                        Podsumowanie
                    </h3>

                    <div className="space-y-4 text-sm mb-6">
                        <div className="flex justify-between items-start">
                            <span className="text-on-surface-variant/70">Usługa:</span>
                            <span className="text-on-surface font-medium text-right">{activeService?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant/70">Specjalista:</span>
                            <span className="text-on-surface font-medium">{activeBarber?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant/70">Data:</span>
                            <span className="text-on-surface font-medium">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant/70">Godzina:</span>
                            <span className="text-primary font-bold font-mono">{selectedSlot || "Nie wybrano"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant/70">Czas trwania:</span>
                            <span className="text-on-surface font-medium">{activeService?.duration} min</span>
                        </div>
                        <div className="pt-4 border-t border-surface-container-highest flex justify-between items-center text-base">
                            <span className="font-bold text-on-surface">Do zapłaty:</span>
                            <span className="text-2xl font-extrabold text-primary">{activeService?.price} zł</span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2 text-xs text-red-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={!selectedSlot || isSubmitting}
                        onClick={handleBooking}
                        className="w-full py-3.5 px-4 bg-primary text-on-primary font-['Epilogue'] font-bold text-sm rounded-xl shadow-lg shadow-primary/15 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Blokowanie terminu...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Potwierdź rezerwację</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}