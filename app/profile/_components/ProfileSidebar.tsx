"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, CalendarDays, Bell, CreditCard, Settings, LogOut } from "lucide-react";
import { logoutUser } from "@/app/actions/auth";

interface ProfileSidebarProps {
    user: {
        fullName: string;
        email: string;
        avatarUrl?: string | null;
        isVip: boolean;
        completedCount: number;
    };
}

const navItems = [
    { label: "Mój Profil", href: "/profile", icon: User },
    { label: "Moje Wizyty", href: "/profile/appointments", icon: CalendarDays },
    { label: "Powiadomienia", href: "/profile/notifications", icon: Bell },
    { label: "Subskrypcje i rozliczenia", href: "/profile/billing", icon: CreditCard },
    { label: "Ustawienia Konta", href: "/profile/settings", icon: Settings },
];

/**
 * Komponent ProfileSidebar renderuje boczny panel nawigacyjny dla użytkownika w sekcji profilu.
 * Pozostaje przyklejony pod paskiem nawigacji podczas przewijania zawartości i przesuwa się
 * w górę dopiero na samym dole strony, aby odsłonić stopkę.
 *
 * @param props Obiekt właściwości zawierający dane użytkownika.
 * @param props.user Obiekt zawierający dane zalogowanego użytkownika (imię, email, status VIP, wizyty).
 */
export default function ProfileSidebar({ user }: ProfileSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        await logoutUser();
        router.push("/");
        router.refresh();
    }

    return (
        <aside className="w-72 shrink-0 bg-surface-container-lowest border-r border-surface-container-high/60 z-20 hidden lg:flex flex-col justify-between px-6 relative">
            <div className="sticky top-20 pt-6 flex flex-col gap-6 z-10 bg-surface-container-lowest">
                <div className="pt-2 pb-1 border-b border-surface-container-high/40">
                    <span className="font-headline font-black text-sm tracking-[0.25em] uppercase text-on-surface block">
                        Panel Klienta
                    </span>
                </div>

                <div>
                    <span className="text-[10px] uppercase text-on-surface-variant/60 tracking-[0.2em] font-bold block mb-3">
                        Nawigacja
                    </span>
                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${isActive
                                        ? "bg-primary text-background font-bold shadow-md shadow-primary/20"
                                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-background" : "text-primary"}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="sticky bottom-0 pt-4 pb-6 border-t border-surface-container-high/60 bg-surface-container-lowest z-10 mt-auto">
                <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between border border-surface-container-high/50">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="relative w-9 h-9 rounded-xl bg-surface-container-highest border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-xs shadow-inner">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.fullName}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-on-surface truncate block">
                                    {user.fullName}
                                </span>
                                {user.isVip && (
                                    <span className="bg-primary/20 text-primary border border-primary/40 text-[9px] font-black px-1.5 py-0.2 rounded uppercase shrink-0">
                                        VIP
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant truncate block">
                                {user.email}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Wyloguj się"
                        className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
