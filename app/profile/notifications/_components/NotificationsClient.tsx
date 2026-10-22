"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    Bell,
    CheckCheck,
    Trash2,
    Scissors,
    XCircle,
    CreditCard,
    Megaphone,
    Tag,
    ExternalLink,
    Filter,
    Check,
    Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../actions";
import NotificationSettingsModal from "./NotificationSettingsModal";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: "APPOINTMENT" | "CANCELLATION" | "SUBSCRIPTION" | "PROMOTION" | "ANNOUNCEMENT";
    linkUrl: string | null;
    isRead: boolean;
    createdAt: Date;
}

interface NotificationsClientProps {
    initialNotifications: NotificationItem[];
    initialUnreadCount: number;
}

type CategoryFilter = "ALL" | "APPOINTMENTS" | "SUBSCRIPTIONS" | "PROMOTIONS" | "ANNOUNCEMENTS";




/**
 * Funkcja formatująca datę do czytelnej formy.
 * @param date - Data do sformatowania.
 * @returns - Sformatowana data.
 */
function formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}



/**
 * Funkcja getNotificationBadge zwraca obiekt zawierający etykietę, klasę tła, ikonę i tekst przycisku dla danego typu powiadomienia.
 * @param type - Typ powiadomienia.
 * @returns - Obiekt zawierający etykietę, klasę tła, ikonę i tekst przycisku dla danego typu powiadomienia.
 */
function getNotificationBadge(type: NotificationItem["type"]) {
    switch (type) {
        case "PROMOTION":
            return {
                label: "Promocja & Event",
                bg: "bg-surface-container-high/50 text-emerald-400/75 border-outline-variant/25",
                icon: Tag,
                buttonText: "Sprawdź ofertę",
            };
        case "APPOINTMENT":
            return {
                label: "Wizyta",
                bg: "bg-surface-container-high/50 text-primary/75 border-outline-variant/25",
                icon: Scissors,
                buttonText: "Szczegóły rezerwacji",
            };
        case "SUBSCRIPTION":
            return {
                label: "Subskrypcja VIP",
                bg: "bg-surface-container-high/50 text-amber-400/75 border-outline-variant/25",
                icon: CreditCard,
                buttonText: "Zarządzaj karnetem",
            };
        case "CANCELLATION":
            return {
                label: "Anulowanie",
                bg: "bg-surface-container-high/50 text-rose-400/75 border-outline-variant/25",
                icon: XCircle,
                buttonText: "Zarządzaj wizytami",
            };
        case "ANNOUNCEMENT":
        default:
            return {
                label: "Ogłoszenie salonu",
                bg: "bg-surface-container-high/50 text-on-surface-variant/80 border-outline-variant/25",
                icon: Megaphone,
                buttonText: "Zobacz więcej",
            };
    }
}

/**
 * Funkcja NotificationsClient renderuje interfejs użytkownika dla centrum powiadomień w profilu użytkownika. Umożliwia przeglądanie, filtrowanie, oznaczanie jako przeczytane oraz usuwanie powiadomień.
 * @param initialNotifications - Początkowa lista powiadomień.
 * @param initialUnreadCount - Początkowa liczba nieprzeczytanych powiadomień.
 * @returns Zwraca element JSX reprezentujący interfejs użytkownika dla centrum powiadomień.
 */
export default function NotificationsClient({
    initialNotifications,
    initialUnreadCount,
}: NotificationsClientProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [category, setCategory] = useState<CategoryFilter>("ALL");
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleMarkAsRead = (id: string) => {
        startTransition(async () => {
            const res = await markNotificationAsRead(id);
            if (res.success) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        });
    };

    const handleMarkAllAsRead = () => {
        startTransition(async () => {
            const res = await markAllNotificationsAsRead();
            if (res.success) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
                toast.success("Oznaczono wszystkie powiadomienia jako przeczytane.", {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            }
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const res = await deleteNotification(id);
            if (res.success) {
                const target = notifications.find((n) => n.id === id);
                if (target && !target.isRead) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }
        });
    };

    const handleClearAll = () => {
        if (!confirm("Czy na pewno chcesz usunąć całą historię powiadomień?")) return;

        startTransition(async () => {
            const res = await clearAllNotifications();
            if (res.success) {
                setNotifications([]);
                setUnreadCount(0);
                toast.success("Wyczyszczono historię powiadomień.", {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            }
        });
    };

    const filtered = notifications.filter((item) => {
        if (onlyUnread && item.isRead) return false;

        if (category === "APPOINTMENTS") {
            return item.type === "APPOINTMENT" || item.type === "CANCELLATION";
        }
        if (category === "SUBSCRIPTIONS") {
            return item.type === "SUBSCRIPTION";
        }
        if (category === "PROMOTIONS") {
            return item.type === "PROMOTION";
        }
        if (category === "ANNOUNCEMENTS") {
            return item.type === "ANNOUNCEMENT";
        }
        return true;
    });

    const categoryCounts = {
        ALL: notifications.length,
        APPOINTMENTS: notifications.filter((n) => n.type === "APPOINTMENT" || n.type === "CANCELLATION").length,
        SUBSCRIPTIONS: notifications.filter((n) => n.type === "SUBSCRIPTION").length,
        PROMOTIONS: notifications.filter((n) => n.type === "PROMOTION").length,
        ANNOUNCEMENTS: notifications.filter((n) => n.type === "ANNOUNCEMENT").length,
    };

    return (
        <div className="w-full space-y-8">
            <section className="pb-6 border-b border-surface-container-high/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
                                Centrum Powiadomień
                            </h1>
                            {unreadCount > 0 && (
                                <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-black px-2.5 py-0.5 rounded-full">
                                    {unreadCount} nowe
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                            Bądź na bieżąco ze swoimi rezerwacjami, statusem subskrypcji, wydarzeniami i ogłoszeniami salonu Fresh Cut.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(true)}
                            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-on-surface hover:text-primary flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Settings className="w-4 h-4 text-primary" />
                            <span>Zarządzaj powiadomieniami</span>
                        </button>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={isPending}
                                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-primary flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Odczytaj wszystkie</span>
                            </button>
                        )}

                        {notifications.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                disabled={isPending}
                                className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-red-400 border border-transparent hover:border-surface-container-high transition-all cursor-pointer"
                                title="Wyczyść całą historię"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCategory("ALL")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${category === "ALL"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60"
                            }`}
                    >
                        <span>Wszystkie</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${category === "ALL" ? "bg-background/20 text-background" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {categoryCounts.ALL}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategory("APPOINTMENTS")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${category === "APPOINTMENTS"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60"
                            }`}
                    >
                        <span>Wizyty</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${category === "APPOINTMENTS" ? "bg-background/20 text-background" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {categoryCounts.APPOINTMENTS}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategory("SUBSCRIPTIONS")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${category === "SUBSCRIPTIONS"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60"
                            }`}
                    >
                        <span>Subskrypcje</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${category === "SUBSCRIPTIONS" ? "bg-background/20 text-background" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {categoryCounts.SUBSCRIPTIONS}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategory("PROMOTIONS")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${category === "PROMOTIONS"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60"
                            }`}
                    >
                        <span>Promocje</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${category === "PROMOTIONS" ? "bg-background/20 text-background" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {categoryCounts.PROMOTIONS}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategory("ANNOUNCEMENTS")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${category === "ANNOUNCEMENTS"
                            ? "bg-primary text-background shadow-md shadow-primary/20"
                            : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60"
                            }`}
                    >
                        <span>Ogłoszenia</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${category === "ANNOUNCEMENTS" ? "bg-background/20 text-background" : "bg-surface-container-highest text-on-surface-variant"}`}>
                            {categoryCounts.ANNOUNCEMENTS}
                        </span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setOnlyUnread((prev) => !prev)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto border ${onlyUnread
                        ? "bg-primary/15 text-primary border-primary/40 shadow-sm"
                        : "bg-surface-container/40 text-on-surface-variant hover:text-on-surface border-surface-container-high/60"
                        }`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Tylko nieprzeczytane</span>
                </button>
            </div>

            <div className="space-y-3.5">
                {filtered.length === 0 ? (
                    <div className="bg-surface-container border border-surface-container-high rounded-2xl p-12 text-center shadow-lg">
                        <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant/40 mb-3 border border-surface-container-high">
                            <Bell className="w-7 h-7" />
                        </div>
                        <h3 className="font-headline font-bold text-base text-on-surface">Brak powiadomień w tej kategorii</h3>
                        <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                            {onlyUnread
                                ? "Wszystkie powiadomienia w wybranej kategorii zostały już przez Ciebie odczytane."
                                : "Aktualnie nie masz żadnych powiadomień w wybranej zakładce."}
                        </p>
                    </div>
                ) : (
                    filtered.map((item) => {
                        const meta = getNotificationBadge(item.type);
                        const Icon = meta.icon;

                        return (
                            <div
                                key={item.id}
                                className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border relative ${!item.isRead
                                    ? "bg-surface-input border-primary/40 shadow-lg shadow-black/40"
                                    : "bg-surface-container-low border-surface-container-high/70 hover:border-surface-container-high"
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-container-high/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface-container border border-surface-container-high flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg border ${meta.bg}`}>
                                                    {meta.label}
                                                </span>
                                                {!item.isRead && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                        Nowe
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-headline font-bold text-base text-on-surface mt-1">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-on-surface-variant">
                                        <span>{formatDate(item.createdAt)}</span>

                                        <div className="flex items-center gap-1">
                                            {!item.isRead ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkAsRead(item.id)}
                                                    className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                                                    title="Oznacz jako przeczytane"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            ) : null}

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer"
                                                title="Usuń powiadomienie"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-2xl">
                                        {item.message}
                                    </p>

                                    {item.linkUrl && (
                                        <Link
                                            href={item.linkUrl}
                                            onClick={() => {
                                                if (!item.isRead) handleMarkAsRead(item.id);
                                            }}
                                            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-primary flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
                                        >
                                            <span>{meta.buttonText}</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <NotificationSettingsModal
                key={String(isSettingsOpen)}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
