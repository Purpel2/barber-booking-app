"use client";

import { useState, useEffect, useRef, useTransition, Suspense } from "react"; // dodano do obslugi asynchronicznych danych
import { DayPicker } from "react-day-picker"; // komponent kalendarza
import { format } from "date-fns"; // formatowanie dat
import { pl } from "date-fns/locale"; // ustawienie lokalizacji na polski
import { useSearchParams, useRouter } from "next/navigation"; // import do pobierania parametrów z URL i nawigacji
import { getBarbers, getAllServicesWithBarbers, getBarberDayDetails, createReservation, getMonthCalendarData } from "./actions"; // import funkcji do pobierania danych z backendu

function getInitialBookingDate(): Date { // funkcja do ustawienia początkowej daty rezerwacji (dzisiaj lub najblizszy poniedziałek, jeśli dzisiaj jest weekend)
    const now = new Date();
    const dayOfWeek = now.getDay();

    // jesli sobota to dodajemy 2 dni, jesli niedziela to dodajemy 1 dzien
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
    description?: string | null;
    imageUrl?: string | null;
    barbers: BarberItem[];
}

function BookingContent() { // komponent do wyboru barbera, usługi i godziny wizyty
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const summaryRef = useRef<HTMLDivElement>(null);

    const [barbers, setBarbers] = useState<BarberItem[]>([]);
    const [selectedBarberId, setSelectedBarberId] = useState<string>("");

    const [allServices, setAllServices] = useState<ServiceWithBarbers[]>([]);
    const [selectedServices, setSelectedServices] = useState<ServiceWithBarbers[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(getInitialBookingDate);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [slotsUnavailableByDuration, setSlotsUnavailableByDuration] = useState<string[]>([]);
    const [slotsUnavailableByReservation, setSlotsUnavailableByReservation] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isWorkingDay, setIsWorkingDay] = useState<boolean>(true);
    const [offReason, setOffReason] = useState<string | null>(null);
    const [calendarData, setCalendarData] = useState<{ [day: number]: number | null }>({});
    const [paymentMethod, setPaymentMethod] = useState<"ON_SITE" | "ONLINE">("ONLINE");

    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const currentBarber = barbers.find((b) => b.id === selectedBarberId);

    // ladowanie poczatkowych danych -> barbers i services oraz ustawienie domyslnego barbera i uslug
    useEffect(() => {
        async function loadInitialData() {
            const [barbersRes, servicesRes] = await Promise.all([
                getBarbers(),
                getAllServicesWithBarbers(),
            ]);

            if (barbersRes.success && barbersRes.data.length > 0) {
                setBarbers(barbersRes.data);
                const urlBarber = searchParams.get("barber")?.toLowerCase();
                const matched = barbersRes.data.find((b) => b.name.toLowerCase().includes(urlBarber || ""));
                const initialId = matched ? matched.id : barbersRes.data[0].id;
                setSelectedBarberId(initialId);

                if (servicesRes.success && servicesRes.data.length > 0) {
                    setAllServices(servicesRes.data);
                    const firstAvailable = servicesRes.data.find((s) => s.barbers.some((b) => b.id === initialId));
                    if (firstAvailable) {
                        setSelectedServices([firstAvailable]);
                    }
                }
            }
        }
        loadInitialData();
    }, [searchParams]);

    // usunięcie wybranych usług, które nie są oferowane przez wybranego barbera
    useEffect(() => {
        if (!selectedBarberId) return;
        setSelectedServices((prev) => {
            const filtered = prev.filter((s) => s.barbers.some((b) => b.id === selectedBarberId));
            if (filtered.length === 0) {
                const firstAvailable = allServices.find((s) => s.barbers.some((b) => b.id === selectedBarberId));
                return firstAvailable ? [firstAvailable] : [];
            }
            return filtered;
        });
        setSelectedTime(null);
    }, [selectedBarberId, allServices]);

    // pobieranie danych kalendarza dla wybranego barbera i miesiaca
    useEffect(() => {
        if (!selectedBarberId) return;

        async function loadCalendarData() {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const data = await getMonthCalendarData(selectedBarberId, year, month);
            setCalendarData(data);
        }
        loadCalendarData();
    }, [selectedBarberId, selectedDate.getFullYear(), selectedDate.getMonth()]);

    // pobieranie dostępnych godzin dla wybranego barbera, daty i czasu trwania usługi
    useEffect(() => {
        if (!selectedBarberId || !selectedDate) return;
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        async function loadDayDetails() {
            const res = await getBarberDayDetails(selectedBarberId, dateStr, totalDuration || 30);
            if (res.success) {
                setIsWorkingDay(res.isWorking);
                setOffReason(res.reason);
                setAvailableSlots(res.slots);
                setBookedTimes(res.unavailableSlots);
                setSlotsUnavailableByDuration(res.slotsUnavailableByDuration || []);
                setSlotsUnavailableByReservation(res.slotsUnavailableByReservation || []);
                if (selectedTime && res.unavailableSlots.includes(selectedTime)) {
                    setSelectedTime(null);
                }
            }
        }
        loadDayDetails();
    }, [selectedBarberId, selectedDate, totalDuration, selectedTime]);

    const toggleService = (service: ServiceWithBarbers) => { // sprawdzenie czy wybrany barber oferuje dana usluge, jesli nie to nie mozna jej wybrac
        const isOffered = service.barbers.some((b) => b.id === selectedBarberId);
        if (!isOffered) return;

        setSelectedServices((prev) => // jesli usluga jest juz wybrana to ja usuwamy, jesli nie to ja dodajemy
            prev.find((s) => s.id === service.id)
                ? prev.filter((s) => s.id !== service.id)
                : [...prev, service]
        );
    };

    const handleSelectTime = (time: string) => { // ustawienie wybranej godziny wizyty i przewiniecie do podsumowania rezerwacji
        setSelectedTime(time);
        setTimeout(() => {
            summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
    };

    const handleBooking = () => { // sprawdzenie czy wszystkie dane sa wybrane, jesli tak to tworzymy rezerwacje i przekierowujemy do strony sukcesu
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
            } else {
                alert(res.message);
            }
        });
    };

    const getDayOccupancyClass = (day: number): string => { // funkcja do ustawienia koloru dnia w kalendarzu w zaleznosci od ilosci rezerwacji
        const occupancy = calendarData[day];
        if (occupancy === null) return "";

        if (occupancy >= 80) return "occupancy-high";
        if (occupancy >= 60) return "occupancy-medium-high";
        if (occupancy >= 40) return "occupancy-medium-low";
        if (occupancy >= 20) return "occupancy-low";
        return "occupancy-empty";
    };

    return ( // jsx do renderowania komponentu rezerwacji
        <div className="pt-20 pb-12 px-4 md:px-8 max-w-360 mx-auto min-h-screen text-on-surface">
            <div className="mb-8">
                <span className="text-primary font-['Inter'] text-xs tracking-[0.25em] uppercase block mb-1">
                    System Rezerwacji
                </span>
                <h1 className="text-3xl md:text-5xl font-['Epilogue'] font-extrabold tracking-tighter text-on-surface mb-6">
                    Wybierz usługę i dogodny termin
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    {barbers.map((barber) => {
                        const isSelected = selectedBarberId === barber.id;
                        return (
                            <div
                                key={barber.id}
                                onClick={() => setSelectedBarberId(barber.id)}
                                className={`p-3.5 rounded-2xl flex items-center gap-4 cursor-pointer border transition-all ${isSelected
                                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                    : "bg-background border-surface-container-highest text-on-surface-variant hover:border-primary/40"
                                    }`}
                            >
                                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-primary/40">
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
                {/* lewa strona (kalendarz) */}
                <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24 bg-background rounded-2xl p-6 shadow-2xl relative border border-surface-container-highest/50">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                setSelectedDate(date);
                            }
                        }}
                        locale={pl}
                        showOutsideDays={false}
                        disabled={[{ dayOfWeek: [0, 6] }, { before: new Date() }]}
                        modifiers={{
                            weekend: { dayOfWeek: [0, 6] },
                            occupancyHigh: (date) => {
                                const occupancy = calendarData[date.getDate()];
                                return occupancy !== null && occupancy >= 80;
                            },
                            occupancyMediumHigh: (date) => {
                                const occupancy = calendarData[date.getDate()];
                                return occupancy !== null && occupancy >= 60 && occupancy < 80;
                            },
                            occupancyMediumLow: (date) => {
                                const occupancy = calendarData[date.getDate()];
                                return occupancy !== null && occupancy >= 40 && occupancy < 60;
                            },
                            occupancyLow: (date) => {
                                const occupancy = calendarData[date.getDate()];
                                return occupancy !== null && occupancy >= 20 && occupancy < 40;
                            },
                            occupancyEmpty: (date) => {
                                const occupancy = calendarData[date.getDate()];
                                return occupancy !== null && occupancy < 20;
                            },
                        }}
                        modifiersClassNames={{ //klasy CSS do stylowania dni w kalendarzu
                            weekend: "!text-red-400/60 !opacity-50",
                            occupancyHigh: "occupancy-high",
                            occupancyMediumHigh: "occupancy-medium-high",
                            occupancyMediumLow: "occupancy-medium-low",
                            occupancyLow: "occupancy-low",
                            occupancyEmpty: "occupancy-empty",
                        }}
                        classNames={{ // klasy CSS do stylowania kalendarza
                            root: "w-full",
                            months: "w-full",
                            month: "space-y-4 w-full",
                            caption: "flex justify-center pt-1 relative items-center mb-4 w-full",
                            caption_label: "text-2xl font-['Epilogue'] font-bold capitalize text-[#e5e2e1]",
                            nav: "space-x-1 flex items-center absolute right-0",
                            nav_button: "p-2 rounded-lg bg-[#353534] hover:bg-[#393939] transition-colors text-[#e9c176]",
                            table: "w-full border-collapse space-y-1 table-fixed",
                            head_row: "grid grid-cols-7 gap-1 text-center mb-3 w-full",
                            head_cell: "text-xs uppercase tracking-wider text-[#c4c7c7] font-semibold w-full [&:nth-child(6)]:text-red-400 [&:nth-child(7)]:text-red-400",
                            row: "grid grid-cols-7 gap-1 text-center mt-2 w-full",
                            cell: "h-12 xl:h-14 flex items-center justify-center p-0.5 relative focus-within:relative focus-within:z-20 w-full",
                            day: "h-full w-full flex items-center justify-center text-base cursor-pointer hover:bg-[#353534] rounded-xl transition-all",
                            day_selected: "!bg-[#e9c176] !text-[#412d00] font-bold shadow-md shadow-[#e9c176]/20 scale-105 hover:bg-[#e9c176]",
                            day_outside: "invisible pointer-events-none",
                            day_disabled: "!bg-transparent text-[#c4c7c7]/20 opacity-30 cursor-not-allowed hover:bg-transparent line-through",
                            day_hidden: "invisible",
                        }}
                    />
                </div>

                {/* prawa strona (uslugi, godziny, podsumowanie) */}
                <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                    {/* USŁUGI */}
                    <div className="bg-background rounded-2xl p-6 shadow-xl border border-surface-container-highest/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-['Inter'] uppercase tracking-widest text-primary">
                                1. Wybierz usługi
                            </h4>
                            <span className="text-xs text-on-surface-variant/60">Wybrano: {selectedServices.length}</span>
                        </div>

                        <div className="space-y-3">
                            {allServices.map((service) => {
                                const isOffered = service.barbers.some((b) => b.id === selectedBarberId);
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
                                                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-base leading-snug ${isSelected && isOffered ? "text-primary" : "text-on-surface"}`}>
                                                        {service.name}
                                                    </p>
                                                    {!isOffered && (
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

                                        {!isOffered && (
                                            <div className="border-t border-surface-container-highest/50 pt-2 mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                                                <span className="text-on-surface-variant/60 italic">
                                                    {currentBarber?.name || "Ten barber"} nie wykonuje tej usługi.
                                                </span>

                                                {service.barbers.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-primary/90">Wykonują:</span>
                                                        <div className="flex items-center gap-1.5">
                                                            {service.barbers.map((b) => (
                                                                <button
                                                                    key={b.id}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedBarberId(b.id);
                                                                    }}
                                                                    className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 hover:border-primary px-2 py-1 rounded-full text-[11px] text-on-surface transition-all cursor-pointer"
                                                                >
                                                                    <img src={b.imageUrl} alt={b.name} className="w-4 h-4 rounded-full object-cover" />
                                                                    <span>{b.name.split(" ")[0]}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* GODZINY */}
                    <div className="bg-background rounded-2xl p-6 shadow-xl border border-surface-container-highest/50">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-xs font-['Inter'] uppercase tracking-widest text-primary">
                                    2. Godzina wizyty
                                </h4>
                                <p className="text-xs text-on-surface-variant/70 mt-1">
                                    Czas wizyty: <span className="text-primary font-semibold">{totalDuration} min</span>
                                </p>
                            </div>
                            {!isWorkingDay && (
                                <span className="text-xs text-[#f87171] font-medium">{offReason}</span>
                            )}
                        </div>

                        {availableSlots.length === 0 ? (
                            <p className="text-sm text-[#f87171] py-2">
                                {offReason || "Wczytywanie dostępnych godzin..."}
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                {availableSlots.map((time) => {
                                    const isBooked = bookedTimes.includes(time);
                                    const isUnavailableByDuration = slotsUnavailableByDuration.includes(time);
                                    const isUnavailableByReservation = slotsUnavailableByReservation.includes(time);
                                    const isSelected = selectedTime === time;

                                    return (
                                        <div key={time} className="relative group">
                                            <button
                                                disabled={isBooked}
                                                onClick={() => handleSelectTime(time)}
                                                className={`py-3 px-2 rounded-xl transition-all font-semibold border text-sm flex items-center justify-center w-full relative ${isSelected
                                                    ? "bg-[#e9c176] text-[#412d00] border-[#e9c176] shadow-lg shadow-[#e9c176]/20 scale-[1.02] font-bold"
                                                    : isBooked
                                                        ? "bg-[#252424]/40 text-[#c4c7c7]/20 border-transparent cursor-not-allowed line-through select-none"
                                                        : "bg-[#2b2a2a] text-[#e5e2e1] border-[#444748]/40 hover:border-[#e9c176] hover:bg-[#353534] cursor-pointer"
                                                    }`}
                                            >
                                                {time}
                                                {/* ikonka zegara */}
                                                {isUnavailableByDuration && (
                                                    <span className="absolute top-0.5 right-0.5 text-orange-400 text-xs leading-none">⏱️</span>
                                                )}
                                            </button>
                                            {/* tooltip do niedostępnych godzin */}
                                            {isUnavailableByDuration && (
                                                <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-[#353534] text-on-surface text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-surface-container-highest">
                                                    Wybrałeś {totalDuration} min usług - za mało czasu od tej godziny
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* PODSUMOWANIE */}
                    {selectedTime && (
                        <div
                            ref={summaryRef}
                            className="bg-on-primary/5 p-6 rounded-2xl border border-primary/40 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300"
                        >
                            <span className="text-[11px] font-['Inter'] uppercase text-primary tracking-widest block mb-2">
                                3. Podsumowanie rezerwacji
                            </span>

                            <div className="flex justify-between items-start mb-4 border-b border-primary/20 pb-4">
                                <div>
                                    <h5 className="text-lg font-bold text-on-surface leading-snug">
                                        {selectedServices.map((s) => s.name).join(" + ")}
                                    </h5>
                                    <p className="text-sm text-secondary mt-1 font-medium">
                                        Barber: <strong className="text-on-surface">{currentBarber?.name}</strong>
                                    </p>
                                    <p className="text-sm text-secondary font-medium">
                                        {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: pl }) : ""}, godzina {selectedTime}
                                    </p>
                                    <p className="text-xs text-on-surface-variant/60 mt-0.5">Czas trwania: {totalDuration} min</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-on-surface-variant/60 block uppercase">Razem</span>
                                    <p className="text-3xl font-extrabold text-primary">{totalPrice} zł</p>
                                </div>
                            </div>

                            {/* wybor formy platnosci */}
                            <div className="mb-6">
                                <label className="text-xs uppercase tracking-wider text-on-surface-variant/80 block mb-2 font-medium">
                                    Wybierz formę płatności
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* forma - ONLINE */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("ONLINE")}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${paymentMethod === "ONLINE"
                                            ? "bg-primary/10 border-primary text-on-surface shadow-md shadow-primary/10"
                                            : "bg-surface-container-high/40 border-surface-container-highest text-on-surface-variant hover:border-primary/40"
                                            }`}
                                    >
                                        <div className={`text-sm font-bold ${paymentMethod === "ONLINE" ? "text-primary" : ""}`}>
                                            Płatność online
                                        </div>
                                        <div className="text-[11px] opacity-70 mt-0.5">Szybki przelew / BLIK</div>
                                    </button>

                                    {/* forma - W SALONIE */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("ON_SITE")}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${paymentMethod === "ON_SITE"
                                            ? "bg-primary/10 border-primary text-on-surface shadow-md shadow-primary/10"
                                            : "bg-surface-container-high/40 border-surface-container-highest text-on-surface-variant hover:border-primary/40"
                                            }`}
                                    >
                                        <div className={`text-sm font-bold ${paymentMethod === "ON_SITE" ? "text-primary" : ""}`}>
                                            W salonie
                                        </div>
                                        <div className="text-[11px] opacity-70 mt-0.5">Gotówka / Karta / BLIK</div>
                                    </button>
                                </div>
                            </div>

                            <button
                                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-base hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-primary/20 cursor-pointer"
                                disabled={!selectedDate || !selectedTime || selectedServices.length === 0 || isPending}
                                onClick={handleBooking}
                            >
                                {isPending ? "Zapisywanie w systemie..." : paymentMethod === "ONLINE" ? "Przejdź do płatności online" : "Zatwierdź i Zarezerwuj"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ReservationsPage() { // komponent pokazujacy strone rezerwacji, z fallbackiem w trakcie ladowania danych
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Ładowanie...</div>}>
            <BookingContent />
        </Suspense>
    );
}