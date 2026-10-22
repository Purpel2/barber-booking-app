"use client";

import { useState, useEffect } from "react";
import {
    X,
    Bell,
    Radio,
    Smartphone,
    Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Funkcja zwracająca początkową wartość preferencji z localStorage.
 * @param key - Klucz preferencji.
 * @param defaultValue - Domyślna wartość preferencji.
 * @returns - Początkowa wartość preferencji.
 */
function getInitialPref(key: string, defaultValue: boolean): boolean {
    if (typeof window === "undefined") return defaultValue;
    const saved = localStorage.getItem(key);
    return saved !== null ? saved === "true" : defaultValue;
}

/**
 * Funkcja NotificationSettingsModal renderuje modalne okno ustawień powiadomień dla użytkownika. 
 * Umożliwia włączanie i wyłączanie różnych typów powiadomień, takich jak powiadomienia w aplikacji, SMS-y i e-maile. 
 * Zmiany są zapisywane w localStorage i wywołują zdarzenie informujące o zmianie preferencji.
 * @param isOpen - Flaga określająca, czy modal jest otwarty.
 * @param onClose - Funkcja wywoływana po zamknięciu modalu.
 * @returns Zwraca element JSX reprezentujący modalne okno ustawień powiadomień.
 */
export default function NotificationSettingsModal({
    isOpen,
    onClose,
}: NotificationSettingsModalProps) {
    const [appAppointmentAlerts, setAppAppointmentAlerts] = useState(() =>
        getInitialPref("pref_app_appointments", true)
    );
    const [appSubscriptionAlerts, setAppSubscriptionAlerts] = useState(() =>
        getInitialPref("pref_app_subscriptions", true)
    );
    const [appAdminAnnouncements, setAppAdminAnnouncements] = useState(() =>
        getInitialPref("pref_app_announcements", true)
    );

    const [smsReminders, setSmsReminders] = useState(() =>
        getInitialPref("pref_sms_reminders", true)
    );
    const [emailConfirmations, setEmailConfirmations] = useState(() =>
        getInitialPref("pref_email_confirmations", true)
    );
    const [emailInvoices, setEmailInvoices] = useState(() =>
        getInitialPref("pref_email_invoices", true)
    );
    const [emailVipOffers, setEmailVipOffers] = useState(() =>
        getInitialPref("pref_email_vip_offers", false)
    );

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("pref_app_appointments", String(appAppointmentAlerts));
            localStorage.setItem("pref_app_subscriptions", String(appSubscriptionAlerts));
            localStorage.setItem("pref_app_announcements", String(appAdminAnnouncements));
            localStorage.setItem("pref_sms_reminders", String(smsReminders));
            localStorage.setItem("pref_email_confirmations", String(emailConfirmations));
            localStorage.setItem("pref_email_invoices", String(emailInvoices));
            localStorage.setItem("pref_email_vip_offers", String(emailVipOffers));
            window.dispatchEvent(new Event("notification_preferences_changed"));
        }

        toast.success("Zapisano preferencje powiadomień.", {
            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
        });

        onClose();
    };

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl bg-surface-container border border-surface-container-high rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-[#161515]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-center text-primary">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-headline font-bold text-base text-on-surface">
                                Ustawienia powiadomień
                            </h2>
                            <p className="text-[11px] text-on-surface-variant">
                                Wybierz kanały i komunikaty, które chcesz otrzymywać
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                Powiadomienia w aplikacji (Dzwonek w menu)
                            </span>
                        </div>

                        <div className="space-y-2.5 p-3.5 rounded-xl bg-surface-container/40 border border-surface-container-high/60 divide-y divide-surface-container-high/50">
                            <div className="flex items-center justify-between pt-0.5 first:pt-0">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Przypomnienia o wizytach
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Powiadomienie z godziną i barberem na 24h oraz 2h przed wizytą
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAppAppointmentAlerts(!appAppointmentAlerts)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appAppointmentAlerts ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appAppointmentAlerts ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2.5">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Status karnetu i subskrypcji VIP
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Informacja o pobraniu comiesięcznej opłaty lub zbliżającym się wygaśnięciu
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAppSubscriptionAlerts(!appSubscriptionAlerts)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appSubscriptionAlerts ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appSubscriptionAlerts ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2.5">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Ogłoszenia salonu i promocje
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Ważne komunikaty administratora, rabaty oraz wiadomości bezpośrednie
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAppAdminAnnouncements(!appAdminAnnouncements)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appAdminAnnouncements ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appAdminAnnouncements ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                Kanały zewnętrzne (SMS i E-mail)
                            </span>
                        </div>

                        <div className="space-y-2.5 p-3.5 rounded-xl bg-surface-container/40 border border-surface-container-high/60 divide-y divide-surface-container-high/50">
                            <div className="flex items-center justify-between pt-0.5 first:pt-0">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Powiadomienia SMS
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Szybki SMS z terminem i adresem salonu na 24h przed wizytą
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSmsReminders(!smsReminders)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${smsReminders ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${smsReminders ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2.5">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        E-mail z potwierdzeniem i plikiem kalendarza (.ics)
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Błyskawiczne dodanie wizyty do Google Calendar i Apple Calendar
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailConfirmations(!emailConfirmations)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailConfirmations ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailConfirmations ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2.5">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Elektroniczne rachunki i faktury
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Wysyłka potwierdzeń płatności po każdej opłaconej usłudze
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailInvoices(!emailInvoices)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailInvoices ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailInvoices ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2.5">
                                <div className="pr-3">
                                    <span className="text-xs font-semibold text-on-surface block">
                                        Oferty specjalne i promocje VIP
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant">
                                        Ekskluzywne rabaty, oferty urodzinowe oraz nowości w salonie
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailVipOffers(!emailVipOffers)}
                                    className="cursor-pointer shrink-0"
                                >
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailVipOffers ? "bg-primary" : "bg-neutral-600"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailVipOffers ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-container-high/60 bg-[#161515]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    >
                        Anuluj
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
                    >
                        <Check className="w-4 h-4" />
                        <span>Zapisz ustawienia</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
