"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    MapPin,
    Clock,
    Phone,
    Car,
    Train,
    Send,
    ArrowRight,
    Calendar,
    Loader2,
    ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { sendContactMessage } from "./actions";
import { MotionFade } from "@/app/components/MotionView";
import { motion, AnimatePresence } from "motion/react";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

interface InitialUserData {
    fullName: string;
    email: string;
    phone: string;
}

interface ContactClientProps {
    initialUserData: InitialUserData | null;
    isLoggedIn: boolean;
}

const SUBJECT_OPTIONS = [
    "Pytanie o wizytę i usługi",
    "Pakiety członkowskie i subskrypcje",
    "Współpraca i sponsoring",
    "Szkolenia barberskie",
    "Inny temat",
] as const;

interface FaqItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "Czy muszę rezerwować wizytę z wyprzedzeniem i czy możliwa jest wizyta 'z ulicy'?",
        answer: "Wszystkie rezerwacje w salonie Fresh Cut odbywają się w 100% online przez nasz system rezerwacji. Nie prowadzimy zapisów 'z ulicy' ani telefonicznych kolejek – dzięki wcześniejszej rezerwacji przez stronę masz pewność punktualnego przyjęcia bez czekania.",
    },
    {
        question: "Jakie metody płatności są akceptowane na miejscu w salonie?",
        answer: "W salonie Fresh Cut zapłacisz zbliżeniowo kartą płatniczą, BLIK-iem, telefonem lub zegarkiem, a także gotówką. Dla klientów korzystających z subskrypcji członkowskiej (Membership) rozliczenie następuje automatycznie online raz w miesiącu.",
    },
    {
        question: "Ile czasu przed umówioną wizytą powinienem się pojawić?",
        answer: "Najlepiej pojawić się około 5–10 minut przed wyznaczoną godziną. W tym czasie możesz spokojnie odwiesić okrycie, napić się dobrej kawy lub wody i przygotować się do strzyżenia.",
    },
    {
        question: "Co zrobić, jeśli muszę odwołać lub przełożyć wizytę?",
        answer: "Możesz bezpłatnie anulować lub przenieść wizytę na inny termin bezpośrednio w panelu klienta (Dashboard) do 2 godzin przed planowanym rozpoczęciem. W przypadku nagłych sytuacji prosimy o bezpośredni kontakt telefoniczny.",
    },
    {
        question: "Gdzie dokładnie znajduje się salon i czy w pobliżu jest dostępny parking?",
        answer: "Nasz salon mieści się przy al. Grunwaldzkiej 238A w Gdańsku (parter budynku Uniwersytetu WSB Merito, tuż obok głównej recepcji). Klienci mogą korzystać z bezpłatnych miejsc parkingowych dostępnych na terenie kampusu.",
    },
    {
        question: "Czy przed strzyżeniem włosów powinienem umyć głowę w domu?",
        answer: "Nie ma takiej potrzeby – dwukrotne, relaksacyjne mycie głowy przed i po strzyżeniu wraz z aplikacją profesjonalnych kosmetyków barberskich jest wliczone w standard każdej usługi strzyżenia w naszym salonie.",
    },
    {
        question: "Jak przygotować brodę przed wizytą na trymowanie lub konturowanie?",
        answer: "Wystarczy, że zarost będzie czysty i wysuszony. Nie podcinaj go samodzielnie przed wizytą – barber oceni naturalny kierunek wzrostu i dobierze geometrię brody idealnie pod proporcje Twojej twarzy.",
    },
    {
        question: "Czym różni się subskrypcja członkowska (Membership) od tradycyjnej pojedynczej wizyty?",
        answer: "Subskrypcja to stały, wygodny miesięczny abonament, który zapewnia pakiet regularnych wizyt w zauważalnie niższej cenie oraz 15% stałego rabatu na wszystkie kosmetyki do stylizacji. Terminy rezerwuje się w tym samym kalendarzu online, a po zakończonej usłudze po prostu wstajesz z fotela bez wyciągania portfela.",
    },
    {
        question: "Czy świadczycie usługi dla dzieci i młodzieży?",
        answer: "Tak, z przyjemnością strzyżemy również młodszych dżentelmenów. W naszej ofercie znajdziesz dedykowaną usługę 'Strzyżenie Junior', w której podchodzimy do młodych klientów z taką samą cierpliwością i najwyższą precyzją.",
    },
    {
        question: "Jak dobrać fryzurę, jeśli sam nie wiem, co będzie mi najlepiej pasować?",
        answer: "Każdą wizytę zaczynamy od krótkiej konsultacji. Barber analizuje strukturę Twojego włosa, kształt czaszki, rysy twarzy oraz codzienny styl życia, po czym proponuje wariant, w którym będziesz wyglądać i czuć się pewnie.",
    },
];

/**
 * Sprawdza, czy salon Fresh Cut w Gdańsku jest aktualnie otwarty.
 * Godziny: Poniedziałek – Piątek 08:00 – 16:00.
 */
function checkIsSalonOpenNow(): boolean {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Warsaw",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    }).formatToParts(now);

    const hour = Number(parts.find((p) => p.type === "hour")?.value || 0) % 24;
    const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);

    const warsawDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Warsaw",
        weekday: "short",
    }).format(now);

    const isWeekend = warsawDate === "Sat" || warsawDate === "Sun";
    if (isWeekend) return false;

    const currentMinute = hour * 60 + minute;
    const OPEN_MINUTE = 480;
    const CLOSE_MINUTE = 960;

    return currentMinute >= OPEN_MINUTE && currentMinute < CLOSE_MINUTE;
}

/**
 * Komponent kliencki podstrony Kontakt.
 * Renderuje nagłówek, karty informacyjne, mapę z dojazdem, formularz kontaktowy,
 * kafelek CTA rezerwacji oraz sekcję najczęściej zadawanych pytań (FAQ Accordion).
 */
export default function ContactClient({ initialUserData, isLoggedIn }: ContactClientProps) {
    const [isPending, startTransition] = useTransition();
    const [isOpenNow] = useState<boolean>(checkIsSalonOpenNow);

    const [name, setName] = useState(initialUserData?.fullName || "");
    const [email, setEmail] = useState(initialUserData?.email || "");
    const [phone, setPhone] = useState(initialUserData?.phone || "");
    const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
    const [message, setMessage] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const bookingHref = isLoggedIn ? "/reservations" : "/login?redirect=/reservations";

    const toggleFaq = (index: number) => {
        setOpenFaqIndex((prev) => (prev === index ? null : index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Podaj swoje imię i nazwisko.");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            toast.error("Podaj poprawny adres e-mail.");
            return;
        }

        if (!message.trim() || message.trim().length < 10) {
            toast.error("Wiadomość musi zawierać co najmniej 10 znaków.");
            return;
        }

        startTransition(async () => {
            const res = await sendContactMessage({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                subject,
                message: message.trim(),
            });

            if (!res.success) {
                toast.error(res.message);
                return;
            }

            toast.success("Wiadomość wysłana! Odezwiemy się do 24h.");
            setIsSubmitted(true);
            setMessage("");

            if (!initialUserData) {
                setName("");
                setEmail("");
                setPhone("");
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 font-body">
            <header className="mb-6 md:mb-8 text-center sm:text-left">
                <span className="font-label text-[11px] tracking-widest uppercase text-primary font-bold block mb-1">
                    BĄDŹMY W KONTAKCIE
                </span>
                <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-on-surface">
                    KONTAKT & <span className="text-primary">LOKALIZACJA</span>
                </h1>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8 md:mb-10">
                <MotionFade
                    delay={0.05}
                    className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-md group"
                >
                    <div>
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5 group-hover:scale-105 transition-transform">
                            <MapPin className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold block mb-1">
                            Adres Salonu
                        </span>
                        <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface mb-1">
                            aleja Grunwaldzka 238A
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-3">
                            80-266 Gdańsk
                            <br />
                            <span className="text-on-surface-variant/70 text-xs">Kampus WSB Merito • Parter</span>
                        </p>
                    </div>
                    <a
                        href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x46fd73bd51f21f8b:0x50c8a05c9778d809?sa=X&ved=1t:8290&ictx=111"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary font-headline font-bold text-xs uppercase tracking-wider hover:underline pt-3 border-t border-surface-container-high/60 group/link"
                    >
                        <span>Otwórz w Google Maps</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                </MotionFade>

                <MotionFade
                    delay={0.1}
                    className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-md group"
                >
                    <div>
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                <Clock className="w-4.5 h-4.5" />
                            </div>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOpenNow
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                                        }`}
                                />
                                {isOpenNow ? "Otwarte" : "Zamknięte"}
                            </span>
                        </div>
                        <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface mb-1">
                            Pon – Pt: 08:00 – 16:00
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-3">
                            Sobota – Niedziela: <span className="text-red-400/90 font-medium">Nieczynne</span>
                        </p>
                    </div>
                    <Link
                        href={bookingHref}
                        className="inline-flex items-center gap-1.5 text-primary font-headline font-bold text-xs uppercase tracking-wider hover:underline pt-3 border-t border-surface-container-high/60 group/link"
                    >
                        <span>Zarezerwuj termin</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </MotionFade>

                <MotionFade
                    delay={0.15}
                    className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-md group"
                >
                    <div>
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5 group-hover:scale-105 transition-transform">
                            <Phone className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold block mb-1">
                            Kontakt Bezpośredni
                        </span>
                        <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface mb-1">
                            <a href="tel:+48585552380" className="hover:text-primary transition-colors">
                                +48 58 555 23 80
                            </a>
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-3">
                            <a href="mailto:kontakt@freshcut.pl" className="hover:text-primary transition-colors block">
                                kontakt@freshcut.pl
                            </a>
                            <span className="text-on-surface-variant/70 text-xs flex items-center gap-1 mt-0.5">
                                <InstagramIcon className="w-3 h-3 text-primary/80" />
                                @freshcut_gdansk
                            </span>
                        </p>
                    </div>
                    <div className="pt-3 border-t border-surface-container-high/60 text-[11px] text-on-surface-variant/70">
                        Odbieramy w godzinach pracy salonu
                    </div>
                </MotionFade>
            </section>

            <section className="mb-8 md:mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                    <MotionFade
                        delay={0.1}
                        className="lg:col-span-7 bg-surface-container-low rounded-xl overflow-hidden border border-surface-container-high shadow-md min-h-70 sm:min-h-80 lg:min-h-85 relative"
                    >
                        <iframe
                            title="Lokalizacja Fresh Cut - aleja Grunwaldzka 238A, Gdańsk"
                            src="https://maps.google.com/maps?q=aleja%20Grunwaldzka%20238A,%2080-266%20Gda%C5%84sk&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            className="w-full h-full min-h-70 sm:min-h-80 lg:min-h-85 border-0 block"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold flex items-center gap-1.5 shadow-md pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>Fresh Cut — al. Grunwaldzka 238A</span>
                        </div>
                    </MotionFade>

                    <MotionFade
                        delay={0.15}
                        className="lg:col-span-5 bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-6 flex flex-col justify-center shadow-md"
                    >
                        <div>
                            <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold mb-1.5 block">
                                LOGISTYKA & DOJAZD
                            </span>
                            <h3 className="font-headline text-lg sm:text-xl font-black uppercase tracking-tight text-on-surface mb-4">
                                Jak do nas dotrzeć?
                            </h3>

                            <div className="space-y-3.5 text-xs sm:text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary">
                                        <Car className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface text-xs sm:text-sm mb-0.5">Samochód & Parking</h4>
                                        <p className="text-on-surface-variant text-xs leading-relaxed">
                                            Wygodny zjazd z al. Grunwaldzkiej. Bezpłatne miejsca na parkingu kampusu.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary">
                                        <Train className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface text-xs sm:text-sm mb-0.5">SKM / PKP Gdańsk Zaspa</h4>
                                        <p className="text-on-surface-variant text-xs leading-relaxed">
                                            5 minut spacerem (ok. 450 m) od peronu SKM Gdańsk Zaspa.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface text-xs sm:text-sm mb-0.5">Wejście do salonu</h4>
                                        <p className="text-on-surface-variant text-xs leading-relaxed">
                                            Główne wejście do budynku Merito, parter obok recepcji ze złotym szyldem.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MotionFade>
                </div>
            </section>

            <section className="mb-8 md:mb-10">
                <MotionFade className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-8 md:p-10 shadow-md">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold mb-1.5 block">
                                NAPISZ WIADOMOŚĆ
                            </span>
                            <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-on-surface mb-1.5">
                                Masz pytanie? <span className="text-primary">Skontaktuj się</span>
                            </h2>
                            <p className="text-on-surface-variant text-xs sm:text-sm">
                                Odpowiadamy zazwyczaj do 24h.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="field-label">
                                        Imię i nazwisko <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="np. Jan Kowalski"
                                        className="input-field transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact-email" className="field-label">
                                        Adres E-mail <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="np. jan@example.com"
                                        className="input-field transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact-phone" className="field-label flex items-center justify-between">
                                        <span>Numer telefonu</span>
                                        <span className="text-[10px] text-on-surface-variant/60 font-normal lowercase">opcjonalnie</span>
                                    </label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="np. +48 500 600 700"
                                        className="input-field transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact-subject" className="field-label">
                                        Temat zapytania <span className="text-primary">*</span>
                                    </label>
                                    <select
                                        id="contact-subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="input-field cursor-pointer transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                    >
                                        {SUBJECT_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt} className="bg-surface-container-high text-on-surface">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contact-message" className="field-label">
                                    Treść wiadomości <span className="text-primary">*</span>
                                </label>
                                <textarea
                                    id="contact-message"
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="W czym możemy Ci pomóc? Opisz szczegóły..."
                                    className="input-field resize-none leading-relaxed transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                />
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-3 px-6 rounded-lg bg-primary text-on-primary font-headline font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transform-gpu"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Wysyłanie wiadomości...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                            <span>Wyślij wiadomość</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {isSubmitted && (
                                <p className="text-center text-xs text-primary font-medium animate-in fade-in">
                                    ✓ Dziękujemy! Wiadomość została przesłana do zespołu Fresh Cut.
                                </p>
                            )}
                        </form>
                    </div>
                </MotionFade>
            </section>

            <section className="mb-8 md:mb-12">
                <MotionFade className="w-full rounded-xl bg-surface-container-low border border-surface-container-high p-5 sm:p-6 md:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-md">
                    <div className="max-w-xl text-center sm:text-left">
                        <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold mb-1 block">
                            REZERWACJA ONLINE
                        </span>
                        <h2 className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tight text-on-surface mb-1">
                            ZAREZERWUJ WIZYTĘ <span className="text-primary">JUŻ TERAZ</span>
                        </h2>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                            Wybierz barbera, usługę oraz dogodną godzinę w kalendarzu online.
                        </p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                        <Link
                            href={bookingHref}
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-on-primary font-headline font-bold text-xs tracking-widest uppercase hover:bg-primary-hover hover:shadow-md transition-all cursor-pointer"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Umów wizytę</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </MotionFade>
            </section>

            <section className="mb-12">
                <MotionFade className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sm:p-8 md:p-10 shadow-md">
                    <div className="text-center mb-8">
                        <span className="font-label text-[10px] tracking-widest uppercase text-primary font-bold mb-1.5 block">
                            NAJCZĘŚCIEJ ZADAWANE PYTANIA
                        </span>
                        <h2 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-on-surface mb-2">
                            FAQ — <span className="text-primary">WARTO WIEDZIEĆ</span>
                        </h2>
                        <p className="text-on-surface-variant text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                            Poniżej znajdziesz odpowiedzi na najczęstsze pytania dotyczące wizyt, dojazdu, płatności i zasad panujących w salonie.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto divide-y divide-outline-variant/15">
                        {FAQ_ITEMS.map((faq, index) => {
                            const isOpen = openFaqIndex === index;

                            return (
                                <div key={index} className="py-4 first:pt-0 last:pb-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between text-left gap-4 py-2 text-on-surface hover:text-primary transition-colors cursor-pointer group"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono font-bold text-primary/70 shrink-0">
                                                {String(index + 1).padStart(2, "0")}.
                                            </span>
                                            <span className="font-headline font-bold text-sm sm:text-base leading-snug">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <div
                                            className={`shrink-0 w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center transition-transform duration-200 ${isOpen ? "rotate-180 bg-primary/20 text-primary border-primary/40" : "text-on-surface-variant group-hover:text-primary"
                                                }`}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-2 pb-2 pl-8 pr-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </MotionFade>
            </section>
        </div>
    );
}
