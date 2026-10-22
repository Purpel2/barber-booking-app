"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    CheckCheck,
    Scissors,
    XCircle,
    CreditCard,
    Megaphone,
    Tag,
    ChevronRight,
    Loader2,
    Settings,
} from "lucide-react";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../profile/notifications/actions";
import NotificationSettingsModal from "../profile/notifications/_components/NotificationSettingsModal";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: "APPOINTMENT" | "CANCELLATION" | "SUBSCRIPTION" | "PROMOTION" | "ANNOUNCEMENT";
    linkUrl: string | null;
    isRead: boolean;
    createdAt: Date;
}

interface NotificationBellProps {
    initialUnreadCount?: number;
}

/**
 * Funkcja formatująca czas względny do obecnego.
 * @param date - Data do sformatowania.
 * @returns - Sformatowany czas względny.
 */
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Przed chwilą";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays === 1) return "Wczoraj";
    return `${diffDays} dni temu`;
}

/**
 * Funkcja zwracająca ikonę dla danego typu powiadomienia.
 * @param type - Typ powiadomienia.
 * @returns - Ikona odpowiadająca typowi powiadomienia.
 */
function getNotificationIcon(type: NotificationItem["type"]) {
    switch (type) {
        case "PROMOTION":
            return <Tag className="w-4 h-4 text-emerald-400" />;
        case "APPOINTMENT":
            return <Scissors className="w-4 h-4 text-primary" />;
        case "SUBSCRIPTION":
            return <CreditCard className="w-4 h-4 text-amber-400" />;
        case "CANCELLATION":
            return <XCircle className="w-4 h-4 text-red-400" />;
        case "ANNOUNCEMENT":
        default:
            return <Megaphone className="w-4 h-4 text-sky-400" />;
    }
}

/**
 * funkcja renderująca dzwonek powiadomień z licznikiem nieprzeczytanych powiadomień i rozwijanym menu powiadomień
 * @param initialUnreadCount - początkowa liczba nieprzeczytanych powiadomień
 * @returns - Zwraca element JSX reprezentujący dzwonek powiadomień
 */
export default function NotificationBell({ initialUnreadCount = 0 }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setUnreadCount(initialUnreadCount);
    }, [initialUnreadCount]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = async () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        if (nextState && notifications.length === 0) {
            setIsLoading(true);
            try {
                const res = await getUserNotifications();
                setNotifications(res.notifications as NotificationItem[]);
                setUnreadCount(res.unreadCount);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        });
    };

    const handleItemClick = (notification: NotificationItem) => {
        if (!notification.isRead) {
            startTransition(async () => {
                await markNotificationAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            });
        }

        setIsOpen(false);
        if (notification.linkUrl) {
            router.push(notification.linkUrl);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="hover:text-primary transition-all p-1 relative cursor-pointer focus:outline-none"
                aria-label="Powiadomienia"
            >
                <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-primary" : "text-on-surface/70"}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-[#121212] animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-surface-container border border-surface-container-high shadow-2xl p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-container-high/60 bg-[#161515]">
                        <div className="flex items-center gap-2">
                            <span className="font-headline font-bold text-sm text-on-surface">Powiadomienia</span>
                            {unreadCount > 0 ? (
                                <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {unreadCount} nowe
                                </span>
                            ) : (
                                <span className="text-[11px] text-on-surface-variant font-medium">Brak nowych</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    disabled={isPending}
                                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 pr-1"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Odczytaj wszystkie</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsSettingsOpen(true);
                                }}
                                title="Ustawienia powiadomień"
                                className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-90 overflow-y-auto divide-y divide-surface-container-high/40 custom-scrollbar pr-0.5">
                        {isLoading ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-xs">Wczytywanie...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 px-4 text-center">
                                <div className="w-10 h-10 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-on-surface-variant/50 mb-2">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-on-surface">Brak powiadomień</p>
                                <p className="text-[11px] text-on-surface-variant mt-0.5">Jesteś na bieżąco ze wszystkimi wydarzeniami.</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-surface-container/60 ${!item.isRead ? "bg-primary/5 border-l-2 border-primary" : ""
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-surface-container-high border border-surface-container-highest flex items-center justify-center shrink-0 mt-0.5">
                                        {getNotificationIcon(item.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-xs font-bold truncate ${!item.isRead ? "text-on-surface" : "text-on-surface/80"}`}>
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-on-surface-variant shrink-0 font-medium">
                                                {formatRelativeTime(item.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>

                                    {!item.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t border-surface-container-high/60 bg-[#161515]">
                        <Link
                            href="/profile/notifications"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-center text-primary flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <span>Centrum powiadomień</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            <NotificationSettingsModal
                key={String(isSettingsOpen)}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
