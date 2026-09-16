"use client";

import { useState, useEffect, useRef, useTransition, Suspense, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useSearchParams, useRouter } from "next/navigation";
import { getBarbers, getAllServicesWithBarbers, getBarberDayDetails, createReservation, getMonthCalendarData } from "./actions";

// Funkcja do ustawienia początkowej daty rezerwacji (dzisiaj lub najbliższy poniedziałek, jeśli dzisiaj jest weekend)
function getInitialBookingDate(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();

    if (dayOfWeek === 6) {
        now.setDate(now.getDate() + 2);
        return now;
    }
    if (dayOfWeek === 0) {
        now.setDate(now.getDate() + 1);
        return now;
    }

    return now;
}

interface BarberItem {
    id: string;
    name: string;
    role?: string | null;
    imageUrl: string;
}

interface ServiceWithBarbers {
    id: string;
    name: string;
    price: number;
    duration: number;
    bufferTime?: number;
    description?: string | null;
    imageUrl?: string | null;
    category: string;
    barbers: BarberItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
    ALL: "Wszystkie",
    HAIR: "Włosy",
    BEARD: "Broda",
    COMBO: "Pakiety",
    CARE: "Pielęgnacja",
};

/**
 * Komponent BookingContent renderuje interaktywny interfejs rezerwacji, umożliwiając użytkownikom wybór barbera, usług, daty i godziny rezerwacji.
 * Pobiera dane barberów i usług z serwera oraz aktualizuje dostępność slotów w zależności od wybranych opcji.
 */
function BookingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const summaryRef = useRef<HTMLDivElement>(null);

    const [barbers, setBarbers] = useState<BarberItem[]>([]);
    const [selectedBarberId, setSelectedBarberId] = useState<string>("");

    const [allServices, setAllServices] = useState<ServiceWithBarbers[]>([]);
    const [selectedServices, setSelectedServices] = useState<ServiceWithBarbers[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("ALL");

    const [selectedDate, setSelectedDate] = useState<Date>(getInitialBookingDate);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [slotsUnavailableByDuration, setSlotsUnavailableByDuration] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isWorkingDay, setIsWorkingDay] = useState<boolean>(true);
    const [offReason, setOffReason] = useState<string | null>(null);
    const [calendarData, setCalendarData] = useState<{ [day: number]: number | null }>({});
    const [paymentMethod, setPaymentMethod] = useState<"ON_SITE" | "ONLINE">("ONLINE");

    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const maxBuffer = selectedServices.reduce((max, s) => Math.max(max, s.bufferTime || 0), 0);
    const requiredBlock = totalDuration + maxBuffer;
    const currentBarber = barbers.find((b) => b.id === selectedBarberId);

    // Wyciągnięte zmienne dat do zależności w useEffect
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    useEffect(() => {
        async function loadInitialData() {
            const [barbersRes, servicesRes] = await Promise.all([getBarbers(), getAllServicesWithBarbers()]);

            if (barbersRes.success && barbersRes.data.length > 0) {
                setBarbers(barbersRes.data);
                const urlBarber = searchParams.get("barber")?.toLowerCase();
                if (urlBarber) {
                    const matched = barbersRes.data.find((b) => b.name.toLowerCase().includes(urlBarber));
                    if (matched) setSelectedBarberId(matched.id);
                }
            }

            if (servicesRes.success && servicesRes.data.length > 0) {
                setAllServices(servicesRes.data);
                const urlServiceId = searchParams.get("serviceId");
                if (urlServiceId) {
                    const matchedService = servicesRes.data.find((s) => s.id === urlServiceId);
                    if (matchedService) setSelectedServices([matchedService]);
                }
            }
        }
        loadInitialData();
    }, [searchParams]);

    useEffect(() => {
        if (!selectedBarberId) return;
        async function loadCalendarData() {
            const data = await getMonthCalendarData(selectedBarberId, year, month + 1);
            setCalendarData(data);
        }
        loadCalendarData();
    }, [selectedBarberId, year, month]);

    useEffect(() => {
        if (!selectedBarberId || !selectedDate) return;
        async function loadDayDetails() {
            const res = await getBarberDayDetails(selectedBarberId, dateStr, requiredBlock || 30);
            if (res.success) {
                setIsWorkingDay(res.isWorking);
                setOffReason(res.reason);
                setAvailableSlots(res.slots);
                setBookedTimes(res.unavailableSlots);
                setSlotsUnavailableByDuration(res.slotsUnavailableByDuration || []);
                if (selectedTime && res.unavailableSlots.includes(selectedTime)) setSelectedTime(null);
            }
        }
        loadDayDetails();
    }, [selectedBarberId, dateStr, requiredBlock, selectedTime, selectedDate]);

    const toggleService = (service: ServiceWithBarbers) => {
        const isOffered = selectedBarberId ? service.barbers.some((b) => b.id === selectedBarberId) : true;
        if (!isOffered) return;

        setSelectedServices((prev) => {
            const isSelected = prev.some((s) => s.id === service.id);
            if (isSelected) return prev.filter((s) => s.id !== service.id);

            let newSelection = [...prev];

            if (service.category === "HAIR") {
                newSelection = newSelection.filter(s => s.category !== "HAIR" && s.category !== "COMBO");
            } else if (service.category === "BEARD") {
                newSelection = newSelection.filter(s => s.category !== "BEARD" && s.category !== "COMBO");
            } else if (service.category === "COMBO") {
                newSelection = newSelection.filter(s => s.category !== "COMBO" && s.category !== "HAIR" && s.category !== "BEARD");
            }

            return [...newSelection, service];
        });
    };

    const handleSelectTime = (time: string) => {
        setSelectedTime(time);
        setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    };

    const handleBooking = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedDate || !selectedTime || selectedServices.length === 0 || !selectedBarberId) return;

        startTransition(async () => {
            const res = await createReservation({
                date: format(selectedDate, "yyyy-MM-dd"),
                time: selectedTime,
                serviceIds: selectedServices.map((s) => s.id),
                barberId: selectedBarberId,
                paymentMethod: paymentMethod,
            });

            if (res.success && res.reservationId) {
                router.push(`/reservations/success?id=${res.reservationId}`);
            } else if (res.requiresAuth) {
                router.push("/login?redirect=/reservations");
            } else {
                alert(res.message);
            }
        });
    };

    const categories = useMemo(() => ["ALL", ...Array.from(new Set(allServices.map((s) => s.category)))], [allServices]);
    const filteredServices = allServices.filter(s => activeCategory === "ALL" || s.category === activeCategory);

    return (
        <div className="pt-20 pb-12 px-4 md:px-8 max-w-360 mx-auto min-h-screen text-on-surface">
            <div className="mb-8">
                <span className="text-primary font-['Inter'] text-xs tracking-[0.25em] uppercase block mb-1">
                    System Rezerwacji
                </span>
                <h1 className="text-3xl md:text-5xl font-['Epilogue'] font-extrabold tracking-tighter text-on-surface mb-6">
                    Wybierz specjalistę i usługi
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    {barbers.map((barber) => {
                        const isSelected = selectedBarberId === barber.id;
                        return (
                            <div
                                key={barber.id}
                                onClick={() => {
                                    setSelectedBarberId(barber.id);
                                    setSelectedServices((prev) => prev.filter((s) => s.barbers.some((b) => b.id === barber.id)));
                                    setSelectedTime(null);
                                }}
                                className={`p-3.5 rounded-2xl flex items-center gap-4 cursor-pointer border transition-all ${isSelected
                                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                    : "bg-background border-surface-container-highest text-on-surface-variant hover:border-primary/40"
                                    }`}
                            >
                                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-primary/40">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={barber.imageUrl} alt={barber.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-base ${isSelected ? "text-primary" : "text-on-surface"}`}>
                                        {barber.name}
                                    </h4>
                                    {barber.role && <p className="text-xs text-on-surface-variant/70">{barber.role}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24 bg-background rounded-2xl p-6 shadow-2xl relative border border-surface-container-highest/50">
                    {!selectedBarberId ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6 opacity-60">
                            <span className="text-4xl mb-4">✂️</span>
                            <h3 className="font-bold text-lg mb-2">Wybierz specjalistę</h3>
                            <p className="text-sm">Aby zobaczyć dostępne terminy, musisz najpierw wybrać barbera z listy powyżej.</p>
                        </div>
                    ) : (
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => { if (date) setSelectedDate(date); }}
                            locale={pl}
                            showOutsideDays={false}
                            disabled={[{ dayOfWeek: [0, 6] }, { before: new Date() }]}
                            modifiers={{
                                weekend: { dayOfWeek: [0, 6] },
                                occupancyHigh: (date) => (calendarData[date.getDate()] ?? 0) >= 80,
                                occupancyMediumHigh: (date) => (calendarData[date.getDate()] ?? 0) >= 60 && (calendarData[date.getDate()] ?? 0) < 80,
                                occupancyMediumLow: (date) => (calendarData[date.getDate()] ?? 0) >= 40 && (calendarData[date.getDate()] ?? 0) < 60,
                                occupancyLow: (date) => (calendarData[date.getDate()] ?? 0) >= 20 && (calendarData[date.getDate()] ?? 0) < 40,
                                occupancyEmpty: (date) => calendarData[date.getDate()] !== null && (calendarData[date.getDate()] ?? 0) < 20,
                            }}
                            modifiersClassNames={{
                                weekend: "!text-red-400/60 !opacity-50",
                                occupancyHigh: "occupancy-high",
                                occupancyMediumHigh: "occupancy-medium-high",
                                occupancyMediumLow: "occupancy-medium-low",
                                occupancyLow: "occupancy-low",
                                occupancyEmpty: "occupancy-empty",
                            }}
                            classNames={{
                                root: "w-full",
                                months: "w-full",
                                month: "space-y-4 w-full",
                                month_caption: "flex justify-center pt-1 relative items-center mb-4 w-full",
                                caption_label: "text-2xl font-['Epilogue'] font-bold capitalize text-[#e5e2e1]",
                                nav: "space-x-1 flex items-center absolute right-0",
                                button_next: "p-2 rounded-lg bg-[#353534] hover:bg-[#393939] transition-colors text-[#e9c176]",
                                button_previous: "p-2 rounded-lg bg-[#353534] hover:bg-[#393939] transition-colors text-[#e9c176]",
                                month_grid: "w-full border-collapse space-y-1",
                                weekdays: "grid grid-cols-7 gap-1 text-center mb-3 w-full",
                                weekday: "text-xs uppercase tracking-wider text-[#c4c7c7] font-semibold w-full [&:nth-child(6)]:text-red-400 [&:nth-child(7)]:text-red-400",
                                week: "grid grid-cols-7 gap-1 w-full mt-2",
                                day: "h-12 xl:h-14 flex items-center justify-center p-0.5 relative focus-within:relative focus-within:z-20 w-full",
                                day_button: "h-full w-full flex items-center justify-center text-base cursor-pointer hover:bg-[#353534] rounded-xl transition-all", // Dodano rounded-xl
                                selected: "!bg-[#e9c176] !text-[#412d00] font-bold shadow-md shadow-[#e9c176]/20 scale-105 hover:bg-[#e9c176] !rounded-xl", // Dodano !rounded-xl
                                outside: "invisible pointer-events-none",
                                disabled: "!bg-transparent text-[#c4c7c7]/20 opacity-30 cursor-not-allowed hover:bg-transparent line-through",
                            }}
                        />
                    )}
                </div>

                <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                    <div className="bg-background rounded-2xl p-6 shadow-xl border border-surface-container-highest/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-['Inter'] uppercase tracking-widest text-primary">
                                Wybierz usługi
                            </h4>
                            <span className="text-xs text-on-surface-variant/60">Wybrano: {selectedServices.length}</span>
                        </div>

                        {allServices.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all border ${activeCategory === cat
                                            ? "bg-primary text-on-primary border-primary"
                                            : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50"
                                            }`}
                                    >
                                        {CATEGORY_LABELS[cat] || cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-3">
                            {filteredServices.map((service) => {
                                const isOffered = selectedBarberId ? service.barbers.some((b) => b.id === selectedBarberId) : true;
                                const isSelected = selectedServices.some((s) => s.id === service.id);

                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service)}
                                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col gap-3 ${!isOffered
                                            ? "bg-black/60 border-surface-container-high opacity-60 cursor-not-allowed grayscale"
                                            : isSelected
                                                ? "bg-primary/10 border-primary text-on-surface cursor-pointer"
                                                : "bg-surface-container-high/40 border-surface-container-highest text-on-surface-variant hover:border-primary/40 cursor-pointer"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {service.imageUrl && (
                                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-background border border-surface-container-highest">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-base leading-snug ${isSelected && isOffered ? "text-primary" : "text-on-surface"}`}>
                                                        {service.name}
                                                    </p>
                                                    {!isOffered && selectedBarberId && (
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant/80">
                                                            Niedostępna
                                                        </span>
                                                    )}
                                                </div>
                                                {service.description && (
                                                    <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                )}
                                                <p className="text-xs text-primary/80 mt-1.5 font-medium">⏱ {service.duration} min</p>
                                            </div>

                                            <div className="text-right shrink-0 pt-0.5">
                                                <p className="font-bold text-lg text-on-surface whitespace-nowrap">{service.price} zł</p>
                                            </div>
                                        </div>

                                        {!isOffered && selectedBarberId && (
                                            <div className="border-t border-surface-container-highest/50 pt-2 mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                                                <span className="text-on-surface-variant/60 italic">Ten barber nie wykonuje tej usługi.</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedBarberId && selectedServices.length > 0 && (
                        <div className="bg-background rounded-2xl p-6 shadow-xl border border-surface-container-highest/50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="text-xs font-['Inter'] uppercase tracking-widest text-primary">Godzina wizyty</h4>
                                    <p className="text-xs text-on-surface-variant/70 mt-1">Czas wizyty: <span className="text-primary font-semibold">{totalDuration} min</span></p>
                                </div>
                                {!isWorkingDay && <span className="text-xs text-[#f87171] font-medium">{offReason}</span>}
                            </div>

                            {availableSlots.length === 0 ? (
                                <p className="text-sm text-[#f87171] py-2">{offReason || "Brak wolnych terminów w tym dniu."}</p>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                    {availableSlots.map((time) => {
                                        const isBooked = bookedTimes.includes(time);
                                        const isUnavailableByDuration = slotsUnavailableByDuration.includes(time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <div key={time} className="relative group">
                                                <button
                                                    disabled={isBooked}
                                                    onClick={() => handleSelectTime(time)}
                                                    className={`py-3 px-2 rounded-xl transition-all font-semibold border text-sm flex items-center justify-center w-full relative ${isSelected
                                                        ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-[1.02] font-bold"
                                                        : isBooked
                                                            ? "bg-[#252424]/40 text-on-surface-variant/20 border-transparent cursor-not-allowed line-through select-none"
                                                            : "bg-[#2b2a2a] text-[#e5e2e1] border-outline-variant/40 hover:border-primary hover:bg-surface-container-highest cursor-pointer"
                                                        }`}
                                                >
                                                    {time}
                                                    {isUnavailableByDuration && <span className="absolute top-0.5 right-0.5 text-orange-400 text-xs leading-none">⏱️</span>}
                                                </button>
                                                {isUnavailableByDuration && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-surface-container-highest text-on-surface text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-surface-container-highest">
                                                        Zbyt krótki przedział czasowy na wybrane usługi
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTime && (
                        <div ref={summaryRef} className="bg-on-primary/5 p-6 rounded-2xl border border-primary/40 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                            <span className="text-[11px] font-['Inter'] uppercase text-primary tracking-widest block mb-2">Podsumowanie rezerwacji</span>
                            <div className="flex justify-between items-start mb-4 border-b border-primary/20 pb-4">
                                <div>
                                    <h5 className="text-lg font-bold text-on-surface leading-snug">{selectedServices.map((s) => s.name).join(" + ")}</h5>
                                    <p className="text-sm text-secondary mt-1 font-medium">Barber: <strong className="text-on-surface">{currentBarber?.name}</strong></p>
                                    <p className="text-sm text-secondary font-medium">{selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: pl }) : ""}, godzina {selectedTime}</p>
                                    <p className="text-xs text-on-surface-variant/60 mt-0.5">Czas trwania: {totalDuration} min</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-on-surface-variant/60 block uppercase">Razem</span>
                                    <p className="text-3xl font-extrabold text-primary">{totalPrice} zł</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs uppercase tracking-wider text-on-surface-variant/80 block mb-2 font-medium">Wybierz formę płatności</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setPaymentMethod("ONLINE")} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${paymentMethod === "ONLINE" ? "bg-primary/10 border-primary text-on-surface shadow-md shadow-primary/10" : "bg-surface-container-high/40 border-surface-container-highest text-on-surface-variant hover:border-primary/40"}`}>
                                        <div className={`text-sm font-bold ${paymentMethod === "ONLINE" ? "text-primary" : ""}`}>Płatność online</div>
                                        <div className="text-[11px] opacity-70 mt-0.5">Szybki przelew / BLIK</div>
                                    </button>
                                    <button type="button" onClick={() => setPaymentMethod("ON_SITE")} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${paymentMethod === "ON_SITE" ? "bg-primary/10 border-primary text-on-surface shadow-md shadow-primary/10" : "bg-surface-container-high/40 border-surface-container-highest text-on-surface-variant hover:border-primary/40"}`}>
                                        <div className={`text-sm font-bold ${paymentMethod === "ON_SITE" ? "text-primary" : ""}`}>W salonie</div>
                                        <div className="text-[11px] opacity-70 mt-0.5">Gotówka / Karta</div>
                                    </button>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-base hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-primary/20 cursor-pointer" disabled={!selectedDate || !selectedTime || selectedServices.length === 0 || isPending} onClick={handleBooking}>
                                {isPending ? "Zapisywanie w systemie..." : paymentMethod === "ONLINE" ? "Przejdź do płatności online" : "Zatwierdź i Zarezerwuj"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Funkcja ReservationsPage renderuje stronę rezerwacji, która zawiera komponent BookingContent. Komponent ten jest opakowany w Suspense,
 * aby umożliwić wyświetlanie fallbacku podczas ładowania danych.
 */
export default function ReservationsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Ładowanie...</div>}>
            <BookingContent />
        </Suspense>
    );
}