"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    CreditCard,
    Download,
    Mail,
    Edit3,
    PauseCircle,
    PlayCircle,
    X,
    Printer,
    FileText,
    Check,
    Building2,
    User,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    switchSubscriptionPlan,
    togglePauseSubscription,
    cancelSubscription,
    reactivateSubscription,
    renewSubscriptionManually,
} from "../actions";

/**
 * Interfejs BillingPlan definiuje strukturę obiektu reprezentującego plan subskrypcji w systemie rozliczeń. 
 * Zawiera informacje o identyfikatorze, nazwie, cenie, interwale płatności, funkcjach dostępnych w ramach planu oraz informacji o popularności planu.
 */
export interface BillingPlan {

    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    isPopular: boolean;
}

/**
 * Interfejs BillingSubscription definiuje strukturę obiektu reprezentującego subskrypcję użytkownika w systemie rozliczeń.
 * Zawiera informacje o identyfikatorze subskrypcji, statusie, dacie wygaśnięcia, metodzie płatności, dacie utworzenia oraz powiązanym planie subskrypcji.
 */
export interface BillingSubscription {

    id: string;
    status: string;
    expiresAt: string;
    paymentMethod: string;
    createdAt: string;
    plan: BillingPlan;
}

/**
 * Interfejs BillingInvoice definiuje strukturę obiektu reprezentującego fakturę rozliczeniową w systemie rozliczeń.
 * Zawiera informacje o identyfikatorze faktury, dacie, opisie, kwocie, statusie, metodzie płatności oraz typie faktury.
 */
export interface BillingInvoice {

    id: string;
    date: string;
    description: string;
    amount: string;
    amountNumber: number;
    status: string;
    paymentMethod: string;
    type: "SUBSCRIPTION" | "APPOINTMENT";
}


/**
 * Interfejs SavedPaymentCard definiuje strukturę obiektu reprezentującego zapisane dane karty płatniczej użytkownika w systemie rozliczeń.
 */
export interface SavedPaymentCard {

    brand: string;
    last4: string;
    expiry: string;
    holder: string;
}

/**
 * Interfejs BillingClientProps definiuje typy właściwości przekazywanych do komponentu BillingClient. Zawiera informacje o użytkowniku, aktywnej subskrypcji, dostępnych planach subskrypcji oraz fakturach rozliczeniowych.
 */
interface BillingClientProps {

    user: {
        id: string;
        fullName: string;
        email: string;
        createdAt: string;
    };
    activeSubscription: BillingSubscription | null;
    availablePlans: BillingPlan[];
    invoices: BillingInvoice[];
}


/**
 * Funkcja BillingClient renderuje interfejs użytkownika dla sekcji rozliczeń i subskrypcji w profilu użytkownika. Umożliwia zarządzanie subskrypcjami, metodami płatności oraz historią faktur.
 * @param user - Obiekt zawierający informacje o zalogowanym użytkowniku.
 * @param activeSubscription - Obiekt reprezentujący aktywną subskrypcję użytkownika lub null, jeśli brak aktywnej subskrypcji.
 * @param availablePlans - Tablica obiektów reprezentujących dostępne plany subskrypcji.
 * @param invoices - Tablica obiektów reprezentujących faktury rozliczeniowe użytkownika.
 * @returns Zwraca element JSX reprezentujący interfejs użytkownika dla sekcji rozliczeń i subskrypcji.
 */
export default function BillingClient({
    user,
    activeSubscription,
    availablePlans,
    invoices,
}: BillingClientProps) {
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("success") === "true") {
                toast.success("Karnet VIP został pomyślnie aktywowany.", {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
                window.history.replaceState({}, "", window.location.pathname);
            }
        }
    }, []);

    const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
    const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
    const [isEditBillingOpen, setIsEditBillingOpen] = useState(false);
    const [isEditCardOpen, setIsEditCardOpen] = useState(false);
    const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
    const [isPayNextMonthOpen, setIsPayNextMonthOpen] = useState(false);

    const [preparingInvoiceId, setPreparingInvoiceId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"ALL" | "SUBSCRIPTION" | "APPOINTMENT">("ALL");

    const [billingData, setBillingData] = useState({
        isCompany: false,
        fullName: user.fullName || "Klient Salonu",
        companyName: "",
        nip: "",
        street: "",
        postalCode: "",
        city: "",
        email: user.email,
    });

    const [tempBilling, setTempBilling] = useState({ ...billingData });

    const [cardData, setCardData] = useState<SavedPaymentCard | null>(null);

    const [tempCard, setTempCard] = useState({
        rawNumber: "",
        expiry: "08/27",
        cvc: "",
        holder: (user.fullName || "JAN KOWALSKI").toUpperCase(),
    });

    const filteredInvoices = invoices.filter((inv) => {
        if (activeTab === "ALL") return true;
        return inv.type === activeTab;
    });

    const handlePrepareDownload = (inv: BillingInvoice) => {
        setPreparingInvoiceId(inv.id);
        setTimeout(() => {
            setPreparingInvoiceId(null);
            setSelectedInvoice(inv);
            toast.success("Dokument gotowy do pobrania.", {
                style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
            });
        }, 500);
    };

    const handleTogglePause = () => {
        if (!activeSubscription) return;
        startTransition(async () => {
            const res = await togglePauseSubscription(activeSubscription.id);
            if (res.success) {
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas aktualizacji.");
            }
        });
    };


    const handleCancelSubscription = () => {
        if (!activeSubscription) return;
        startTransition(async () => {
            const res = await cancelSubscription(activeSubscription.id);
            if (res.success) {
                setIsConfirmCancelOpen(false);
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas wyłączania odnawiania.");
            }
        });
    };


    const handleReactivate = () => {
        if (!activeSubscription) return;
        startTransition(async () => {
            const res = await reactivateSubscription(activeSubscription.id);
            if (res.success) {
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas włączania odnawiania.");
            }
        });
    };


    const handleRenewManually = () => {
        if (!activeSubscription) return;
        startTransition(async () => {
            const res = await renewSubscriptionManually(activeSubscription.id);
            if (res.success) {
                setIsPayNextMonthOpen(false);
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas opłacania subskrypcji.");
            }
        });
    };


    const handlePlanSelect = (planId: string) => {
        startTransition(async () => {
            const res = await switchSubscriptionPlan(planId);
            if (res.success) {
                setIsChangePlanOpen(false);
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas zmiany pakietu.");
            }
        });
    };


    const handleSaveBilling = (e: React.FormEvent) => {
        e.preventDefault();
        setBillingData({ ...tempBilling });
        setIsEditBillingOpen(false);
        toast.success("Zapisano dane do faktury.", {
            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
        });
    };

    const handleSaveCard = (e: React.FormEvent) => {
        e.preventDefault();
        const digitsOnly = tempCard.rawNumber.replace(/\D/g, "");
        const last4 = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : "4821";
        const isVisa = digitsOnly.startsWith("4");

        setCardData({
            brand: isVisa ? "Visa" : "Mastercard",
            last4,
            expiry: tempCard.expiry || "12/28",
            holder: tempCard.holder.toUpperCase() || "KLIENT SALONU",
        });

        setTempCard({
            rawNumber: "",
            expiry: "12/28",
            cvc: "",
            holder: (user.fullName || "JAN KOWALSKI").toUpperCase(),
        });

        setIsEditCardOpen(false);
        toast.success(cardData ? "Zaktualizowano kartę płatniczą." : "Zapisano kartę płatniczą.", {
            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
        });
    };


    const isPaused = activeSubscription?.status === "PAUSED";
    const isCanceled = activeSubscription?.status === "CANCELED";
    const isActive = Boolean(activeSubscription && !isPaused && !isCanceled);
    const hasAnySubscription = Boolean(activeSubscription);

    const formattedExpiresAt = activeSubscription
        ? new Date(activeSubscription.expiresAt).toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";

    const nextExpiryCalc = activeSubscription
        ? new Date(new Date(activeSubscription.expiresAt) > new Date() ? activeSubscription.expiresAt : new Date())
        : new Date();
    nextExpiryCalc.setDate(nextExpiryCalc.getDate() + 30);
    const formattedNextExpiresAt = nextExpiryCalc.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="space-y-8 w-full">
            <section className="pb-6 border-b border-surface-container-high/80">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
                        Subskrypcje i rozliczenia
                    </h1>
                    <p className="text-xs text-on-surface-variant mt-1">
                        Zarządzaj swoim statusem członkowskim, metodami płatności oraz historią rozliczeń.
                    </p>
                </div>
            </section>


            {hasAnySubscription && activeSubscription ? (
                <section className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
                        <div className="lg:col-span-4 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center text-xs font-semibold tracking-wide px-2.5 py-0.5 rounded-lg border ${isActive
                                    ? "text-primary bg-primary/10 border-primary/25"
                                    : isPaused
                                        ? "text-amber-400 bg-amber-950/20 border-amber-500/25"
                                        : "text-on-surface-variant bg-surface-container-high border-outline-variant/25"
                                    }`}>
                                    {isActive ? "Subskrypcja aktywna" : isPaused ? "Subskrypcja wstrzymana" : `Subskrypcja wygasa: ${formattedExpiresAt}`}
                                </span>
                            </div>

                            <div>
                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-on-surface">
                                    Fresh Cut VIP — {activeSubscription.plan.name}
                                </h2>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="font-headline text-3xl sm:text-4xl font-black text-primary">
                                        {activeSubscription.plan.price} PLN
                                    </span>
                                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        / {activeSubscription.plan.interval}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 lg:border-l lg:border-surface-container-high/60 lg:pl-6 space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70 block mb-2">
                                Przywileje pakietu
                            </span>
                            <div className="space-y-1.5">
                                {activeSubscription.plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                        <span className="leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 lg:border-l lg:border-surface-container-high/60 lg:pl-6 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsChangePlanOpen(true)}
                                        disabled={isPending}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer disabled:opacity-50 bg-primary text-background hover:bg-primary-hover shadow-md shadow-primary/10 whitespace-nowrap"
                                    >
                                        Zmień pakiet
                                    </button>

                                    {isActive && (
                                        <button
                                            type="button"
                                            onClick={handleTogglePause}
                                            disabled={isPending}
                                            className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {isPaused ? (
                                                <>
                                                    <PlayCircle className="w-3.5 h-3.5 text-primary" />
                                                    <span>Wznów karnet</span>
                                                </>
                                            ) : (
                                                <>
                                                    <PauseCircle className="w-3.5 h-3.5 text-on-surface-variant" />
                                                    <span>Wstrzymaj karnet</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {isCanceled && (
                                    <button
                                        type="button"
                                        onClick={() => setIsPayNextMonthOpen(true)}
                                        disabled={isPending}
                                        className="w-full py-2 px-3 bg-primary text-background rounded-xl text-xs font-bold uppercase tracking-wider text-center hover:bg-primary-hover transition-colors shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Opłać kolejny miesiąc</span>
                                    </button>
                                )}
                            </div>

                            <div className="pt-3 border-t border-surface-container-high/60 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-on-surface">
                                        Automatyczne odnawianie:
                                    </span>

                                    <button
                                        type="button"
                                        onClick={isActive ? () => setIsConfirmCancelOpen(true) : handleReactivate}
                                        disabled={isPending}
                                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 text-xs font-medium text-on-surface transition-all cursor-pointer disabled:opacity-50"
                                        title={isActive ? "Wyłącz automatyczne odnawianie" : "Włącz automatyczne odnawianie"}
                                    >
                                        <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors flex items-center ${isActive ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full bg-background transition-transform ${isActive ? "translate-x-3.5" : "translate-x-0"}`} />
                                        </div>
                                        <span className="text-[11px] font-medium">{isActive ? "Włączone" : "Wyłączone"}</span>
                                    </button>
                                </div>

                                <p className="text-[11px] text-on-surface-variant leading-tight">
                                    {isActive ? (
                                        <>
                                            Kolejna opłata: <strong className="text-on-surface font-semibold">{activeSubscription.plan.price} PLN</strong> pobrana zostanie <strong className="text-on-surface font-semibold">{formattedExpiresAt}</strong>
                                        </>
                                    ) : (
                                        <>
                                            Brak automatycznych opłat • Ważny do <strong className="text-on-surface font-semibold">{formattedExpiresAt}</strong>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                    <div className="max-w-2xl space-y-2 mb-6">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary block">
                            Karnety Członkowskie VIP
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-on-surface">
                            Wybierz abonament dla siebie
                        </h2>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Płać raz w miesiącu i korzystaj z regularnych wizyt, darmowego odświeżania zarostu oraz stałych rabatów na kosmetyki.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-surface-container-high/60">
                        {availablePlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${plan.isPopular
                                    ? "bg-surface-container/60 border-primary shadow-xl shadow-primary/5"
                                    : "bg-surface-container/30 border-surface-container-high/60 hover:border-outline-variant/40"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-headline font-bold text-base text-on-surface uppercase tracking-tight">
                                            {plan.name}
                                        </h4>
                                        {plan.isPopular && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 border border-primary/25 px-2.5 py-0.5 rounded-md">
                                                Polecany
                                            </span>
                                        )}
                                    </div>

                                    <p className="font-headline font-black text-2xl sm:text-3xl text-primary mb-4">
                                        {plan.price} PLN{" "}
                                        <span className="text-xs text-on-surface-variant uppercase font-semibold">
                                            / {plan.interval}
                                        </span>
                                    </p>

                                    <ul className="space-y-2.5 mb-6 pt-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <span className="leading-snug">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href={`/membership/checkout?plan=${plan.name.toLowerCase()}`}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all ${plan.isPopular
                                        ? "bg-primary text-background hover:bg-primary-hover shadow-md shadow-primary/10"
                                        : "bg-surface-container-high hover:bg-primary hover:text-background text-on-surface"
                                        }`}
                                >
                                    Wybierz {plan.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6 bg-surface-container border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Metoda Płatności <span className="text-xs text-on-surface-variant font-normal tracking-normal">(do podpięcia Stripe)</span>
                                </h3>
                            </div>
                            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cardData
                                ? "text-primary bg-primary/10 border-primary/25"
                                : "text-on-surface-variant bg-surface-container-high/60 border-outline-variant/30"
                                }`}>
                                {cardData ? "Domyślna" : "Brak karty"}
                            </span>
                        </div>

                        {cardData ? (
                            <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/60 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-8 rounded-lg bg-[#242323] border border-surface-container-high flex items-center justify-center text-primary font-black text-xs tracking-wider shadow-inner">
                                        {cardData.brand === "Visa" ? "VISA" : "MC"}
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-on-surface font-mono">
                                            •••• •••• •••• {cardData.last4}
                                        </p>
                                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                                            Wygasa: <span className="text-on-surface font-medium font-mono">{cardData.expiry}</span> • {cardData.holder}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-surface-container/40 border border-surface-container-high/60 flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant/60 shrink-0">
                                    <CreditCard className="w-5 h-5 text-primary/70" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-on-surface">Brak zapisanej karty</p>
                                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                                        Do Twojego konta nie jest jeszcze przypisana żadna karta płatnicza.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                            <span>Automatyczne odnawianie karnetu:</span>
                            <span className={`font-semibold ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                                {isActive ? "Włączone" : isPaused ? "Wstrzymane" : "Wyłączone"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setTempCard({
                                    rawNumber: "",
                                    expiry: cardData?.expiry || "12/28",
                                    cvc: "",
                                    holder: cardData?.holder || (user.fullName || "JAN KOWALSKI").toUpperCase(),
                                });
                                setIsEditCardOpen(true);
                            }}
                            className="text-primary hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{cardData ? "Zmień kartę" : "Dodaj kartę"}</span>
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-6 bg-surface-container border border-surface-container-high rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Dane do Faktury
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setTempBilling({ ...billingData });
                                    setIsEditBillingOpen(true);
                                }}
                                className="text-primary hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edytuj</span>
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/60 space-y-2 text-xs">
                            {billingData.isCompany ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-on-surface sm:text-sm">{billingData.companyName || "Brak nazwy firmy"}</p>
                                        <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                            Firma (VAT)
                                        </span>
                                    </div>
                                    <p className="text-on-surface-variant">NIP: <span className="text-on-surface font-mono">{billingData.nip || "—"}</span></p>
                                    <p className="text-on-surface-variant">
                                        {billingData.street ? `${billingData.street}, ${billingData.postalCode} ${billingData.city}` : "Adres niepodany"}
                                    </p>
                                </>
                            ) : (
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70 block mb-1">
                                        Odbiorca rachunków
                                    </span>
                                    <p className="font-bold text-on-surface sm:text-sm">{billingData.fullName}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-on-surface-variant text-xs pt-1">
                            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                                E-mail do faktur: <strong className="text-on-surface font-medium">{billingData.email}</strong>
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>Format: E-faktura PDF</span>
                    </div>
                </div>
            </div>

            <section className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                            Historia Rozliczeń
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Zestawienie opłaconych transakcji z możliwością wygenerowania dokumentu PDF.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-surface-container/60 border border-surface-container-high/60 rounded-xl self-start sm:self-auto text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ALL")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "ALL"
                                ? "bg-primary text-background font-bold shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                        >
                            Wszystkie ({invoices.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("SUBSCRIPTION")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "SUBSCRIPTION"
                                ? "bg-primary text-background font-bold shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                        >
                            Subskrypcje
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("APPOINTMENT")}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "APPOINTMENT"
                                ? "bg-primary text-background font-bold shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                        >
                            Wizyty
                        </button>
                    </div>
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="py-12 text-center space-y-2 bg-surface-container/30 border border-surface-container-high/40 rounded-xl">
                        <FileText className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
                        <p className="text-sm font-bold text-on-surface">Brak historii rozliczeń</p>
                        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                            W tej zakładce nie ma jeszcze żadnych opłaconych pozycji.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-surface-container-high/60">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-surface-container/70 border-b border-surface-container-high/60 text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">
                                <tr>
                                    <th className="py-3 px-4">Numer dokumentu</th>
                                    <th className="py-3 px-4">Data</th>
                                    <th className="py-3 px-4">Opis transakcji</th>
                                    <th className="py-3 px-4">Kwota</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Dokument</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container-high/40">
                                {filteredInvoices.map((inv) => {
                                    const isPreparing = preparingInvoiceId === inv.id;

                                    return (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-surface-container/40 transition-colors group"
                                        >
                                            <td className="py-3.5 px-4 font-mono font-medium text-on-surface">
                                                {inv.id}
                                            </td>
                                            <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                                                {inv.date}
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-on-surface max-w-xs truncate">
                                                {inv.description}
                                            </td>
                                            <td className="py-3.5 px-4 font-headline font-bold text-primary whitespace-nowrap text-sm">
                                                {inv.amount}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-lg bg-surface-container-high/70 text-on-surface-variant border border-outline-variant/25">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                                                    <span>{inv.status}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePrepareDownload(inv)}
                                                    disabled={isPreparing}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 disabled:opacity-50"
                                                >
                                                    {isPreparing ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                                            <span>Przygotowywanie...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-3 h-3" />
                                                            <span>Przygotuj do pobrania</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedInvoice && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-on-surface shadow-2xl space-y-6 relative">
                        <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">
                                    Dokument Rozliczeniowy PDF
                                </span>
                                <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                                    {billingData.isCompany ? `Faktura VAT ${selectedInvoice.id}` : `Potwierdzenie ${selectedInvoice.id}`}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-surface-input border border-surface-container-high/60 rounded-xl p-5 sm:p-6 space-y-6 text-xs font-body">
                            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/40">
                                <div>
                                    <span className="font-headline font-black text-base tracking-[0.2em] uppercase text-primary block">
                                        FRESH CUT
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                                        Salon Męski & Barbershop
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high text-on-surface border border-outline-variant/30 font-bold text-[11px] uppercase tracking-wider">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    Opłacono
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-surface-container-high/40">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-1">
                                        Sprzedawca
                                    </span>
                                    <p className="font-semibold text-on-surface">Fresh Cut Barbershop Sp. z o.o.</p>
                                    <p className="text-on-surface-variant">aleja Grunwaldzka 238A</p>
                                    <p className="text-on-surface-variant">80-266 Gdańsk</p>
                                    <p className="text-on-surface-variant font-mono">NIP: 525-24-11-987</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-1">
                                        Nabywca
                                    </span>
                                    {billingData.isCompany ? (
                                        <>
                                            <p className="font-semibold text-on-surface">{billingData.companyName || user.fullName}</p>
                                            <p className="text-on-surface-variant">{billingData.street}</p>
                                            <p className="text-on-surface-variant">{billingData.postalCode} {billingData.city}</p>
                                            <p className="text-on-surface-variant font-mono">NIP: {billingData.nip}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-on-surface">{billingData.fullName}</p>
                                            <p className="text-on-surface-variant">Klient indywidualny</p>
                                            <p className="text-on-surface-variant">E-mail: {billingData.email}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-surface-container-high/60 text-[10px] text-on-surface-variant uppercase font-bold">
                                            <th className="pb-2">Lp.</th>
                                            <th className="pb-2">Pozycja</th>
                                            <th className="pb-2 text-right">Ilość</th>
                                            <th className="pb-2 text-right">Wartość brutto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high/30">
                                        <tr>
                                            <td className="py-2.5 font-mono text-on-surface-variant">1</td>
                                            <td className="py-2.5 font-medium text-on-surface">{selectedInvoice.description}</td>
                                            <td className="py-2.5 text-right font-mono">1</td>
                                            <td className="py-2.5 text-right font-headline font-bold text-primary">
                                                {selectedInvoice.amount}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-3 border-t border-surface-container-high/60 flex flex-col items-end gap-1">
                                <div className="text-xs text-on-surface-variant">
                                    Stawka VAT: <span className="text-on-surface font-semibold">23%</span>
                                </div>
                                <div className="text-sm sm:text-base font-bold text-on-surface flex items-baseline gap-2">
                                    <span>Razem do zapłaty:</span>
                                    <span className="font-headline font-black text-primary text-lg">
                                        {selectedInvoice.amount}
                                    </span>
                                </div>
                                <div className="text-[11px] text-on-surface-variant">
                                    Metoda: <span className="text-on-surface">{selectedInvoice.paymentMethod}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    window.print();
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/10"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Drukuj / Zapisz PDF</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                            >
                                Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isChangePlanOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-on-surface shadow-2xl space-y-6 relative">
                        <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">
                                    Zarządzanie Karnetem
                                </span>
                                <h3 className="font-headline font-bold text-xl text-on-surface mt-0.5">
                                    Wybierz pakiet VIP
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsChangePlanOpen(false)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {availablePlans.map((plan) => {
                                const isCurrent = activeSubscription?.plan.id === plan.id;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${isCurrent
                                            ? "bg-surface-container/70 border-primary ring-1 ring-primary/40 shadow-lg"
                                            : plan.isPopular
                                                ? "bg-surface-container/40 border-primary/40"
                                                : "bg-surface-container/20 border-surface-container-high/60"
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-headline font-bold text-base text-on-surface uppercase">
                                                    {plan.name}
                                                </h4>
                                                {isCurrent ? (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded">
                                                        Twój plan
                                                    </span>
                                                ) : plan.isPopular ? (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded">
                                                        Popularny
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="flex items-baseline gap-1">
                                                <span className="font-headline font-black text-2xl sm:text-3xl text-primary">
                                                    {plan.price}
                                                </span>
                                                <span className="text-xs text-on-surface-variant uppercase font-semibold">
                                                    PLN / {plan.interval}
                                                </span>
                                            </div>

                                            <ul className="space-y-2 pt-2 border-t border-surface-container-high/40">
                                                {plan.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-2 text-xs text-on-surface-variant">
                                                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isCurrent || isPending}
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${isCurrent
                                                ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-70"
                                                : "bg-primary text-background hover:bg-primary-hover shadow-md shadow-primary/10"
                                                }`}
                                        >
                                            {isCurrent ? "Aktualnie wybrany" : "Wybierz plan"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isEditBillingOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-lg w-full p-6 sm:p-8 text-on-surface shadow-2xl space-y-6 relative">
                        <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">
                                    Rozliczenia
                                </span>
                                <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                                    Dane do faktury
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditBillingOpen(false)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBilling} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTempBilling((prev) => ({ ...prev, isCompany: false }))}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${!tempBilling.isCompany
                                        ? "bg-primary text-background font-bold border-primary"
                                        : "bg-surface-container text-on-surface-variant border-surface-container-high"
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Osoba prywatna</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTempBilling((prev) => ({ ...prev, isCompany: true }))}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${tempBilling.isCompany
                                        ? "bg-primary text-background font-bold border-primary"
                                        : "bg-surface-container text-on-surface-variant border-surface-container-high"
                                        }`}
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>Firma (VAT)</span>
                                </button>
                            </div>

                            {tempBilling.isCompany ? (
                                <>
                                    <div>
                                        <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                            Nazwa Firmy
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={tempBilling.companyName}
                                            onChange={(e) => setTempBilling({ ...tempBilling, companyName: e.target.value })}
                                            className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                            NIP
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={tempBilling.nip}
                                            onChange={(e) => setTempBilling({ ...tempBilling, nip: e.target.value })}
                                            className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                            Adres siedziby
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={tempBilling.street}
                                            onChange={(e) => setTempBilling({ ...tempBilling, street: e.target.value })}
                                            className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                                Kod pocztowy
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={tempBilling.postalCode}
                                                onChange={(e) => setTempBilling({ ...tempBilling, postalCode: e.target.value })}
                                                className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                                Miejscowość
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={tempBilling.city}
                                                onChange={(e) => setTempBilling({ ...tempBilling, city: e.target.value })}
                                                className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                        Imię i Nazwisko
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={tempBilling.fullName}
                                        onChange={(e) => setTempBilling({ ...tempBilling, fullName: e.target.value })}
                                        className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                    Adres e-mail do wysyłki faktur
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={tempBilling.email}
                                    onChange={(e) => setTempBilling({ ...tempBilling, email: e.target.value })}
                                    className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high/60">
                                <button
                                    type="button"
                                    onClick={() => setIsEditBillingOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/10"
                                >
                                    Zapisz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditCardOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-md w-full p-6 sm:p-8 text-on-surface shadow-2xl space-y-6 relative">
                        <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
                            <div>
                                <h3 className="font-headline font-bold text-lg text-on-surface">
                                    {cardData ? "Zmień kartę płatniczą" : "Dodaj kartę płatniczą"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditCardOpen(false)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-linear-to-br from-[#252424] to-[#121212] border border-primary/30 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-primary font-black font-headline tracking-widest text-sm">
                                    FRESH CUT
                                </span>
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div className="py-2">
                                <span className="font-mono text-base sm:text-lg tracking-[0.2em] text-on-surface block">
                                    {tempCard.rawNumber.replace(/\D/g, "").length >= 4
                                        ? `•••• •••• •••• ${tempCard.rawNumber.replace(/\D/g, "").slice(-4)}`
                                        : "•••• •••• •••• ••••"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                                <div>
                                    <span className="text-[9px] uppercase tracking-wider block opacity-70">Właściciel</span>
                                    <span className="font-bold text-on-surface">{tempCard.holder || "JAN KOWALSKI"}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase tracking-wider block opacity-70">Ważność</span>
                                    <span className="font-bold text-on-surface font-mono">{tempCard.expiry || "MM/RR"}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveCard} className="space-y-4">
                            <div>
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                    Imię i nazwisko na karcie
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={tempCard.holder}
                                    onChange={(e) => setTempCard({ ...tempCard, holder: e.target.value })}
                                    className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface uppercase focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                    Numer karty
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={19}
                                    placeholder="4532 •••• •••• ••••"
                                    value={tempCard.rawNumber}
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, "").slice(0, 16);
                                        const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
                                        setTempCard({ ...tempCard, rawNumber: formatted });
                                    }}
                                    className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                        Ważność (MM/RR)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={5}
                                        placeholder="08/28"
                                        value={tempCard.expiry}
                                        onChange={(e) => setTempCard({ ...tempCard, expiry: e.target.value })}
                                        className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">
                                        Kod CVC
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={4}
                                        placeholder="•••"
                                        value={tempCard.cvc}
                                        onChange={(e) => setTempCard({ ...tempCard, cvc: e.target.value })}
                                        className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high/60">
                                <button
                                    type="button"
                                    onClick={() => setIsEditCardOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/10"
                                >
                                    {cardData ? "Zapisz zmiany" : "Dodaj kartę"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isConfirmCancelOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-md w-full p-6 text-on-surface shadow-2xl space-y-5 relative">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant shrink-0">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Wyłączyć automatyczne odnawianie?
                                </h3>
                                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                                    Karta nie zostanie obciążona. Twój karnet pozostaje aktywny do{" "}
                                    <strong className="text-on-surface font-semibold">{formattedExpiresAt}</strong>.
                                    Kolejny miesiąc będziesz mógł opłacić ręcznie w dowolnym momencie.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high/60">
                            <button
                                type="button"
                                onClick={() => setIsConfirmCancelOpen(false)}
                                className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                            >
                                Wróć
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelSubscription}
                                disabled={isPending}
                                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-red-950/40 border border-outline-variant/20 hover:border-red-900/40 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isPending ? "Wyłączanie..." : "Wyłącz odnawianie"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPayNextMonthOpen && activeSubscription && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-md w-full p-6 text-on-surface shadow-2xl space-y-5 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
                            <div className="flex items-center gap-2.5">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Opłać kolejny miesiąc
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPayNextMonthOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 bg-surface-container/50 border border-surface-container-high/60 rounded-xl p-4 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface-variant">Pakiet członkowski:</span>
                                <span className="font-bold text-on-surface">Fresh Cut VIP — {activeSubscription.plan.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface-variant">Kwota do zapłaty:</span>
                                <span className="font-headline font-bold text-base text-primary">{activeSubscription.plan.price} PLN</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-surface-container-high/40 pt-2.5">
                                <span className="text-on-surface-variant">Nowy okres ważności:</span>
                                <span className="font-semibold text-on-surface">do {formattedNextExpiresAt}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface-variant">Metoda płatności:</span>
                                <span className="font-mono text-on-surface">
                                    {cardData ? `${cardData.brand} •••• ${cardData.last4}` : "Płatność online / Karta"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsPayNextMonthOpen(false)}
                                className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                            >
                                Anuluj
                            </button>
                            <button
                                type="button"
                                onClick={handleRenewManually}
                                disabled={isPending}
                                className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-primary/10 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Przetwarzanie...</span>
                                    </>
                                ) : (
                                    <span>Opłać {activeSubscription.plan.price} PLN</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
