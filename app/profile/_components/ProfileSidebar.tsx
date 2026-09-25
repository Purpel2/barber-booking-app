"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, CalendarDays, CreditCard, Settings, Scissors, LogOut, Sparkles } from "lucide-react";
import { logoutUser } from "../../actions/auth";

interface ProfileSidebarProps {
    user: {
        fullName: string;
        email: string;
        isVip: boolean;
        completedCount: number;
    };
}

const navItems = [
    { label: "Mój Profil", href: "/profile", icon: User },
    { label: "Moje Wizyty", href: "/profile/appointments", icon: CalendarDays },
    { label: "Subskrypcje", href: "/membership", icon: CreditCard },
    { label: "Ustawienia Konta", href: "/profile/settings", icon: Settings },
];

/**
 * Komponent ProfileSidebar renderuje boczny panel nawigacyjny dla użytkownika w sekcji profilu.
 * Wyświetla informacje o użytkowniku, jego statusie VIP oraz przyciski nawigacyjne do różnych sekcji profilu.
 * Umożliwia również wylogowanie się z konta.
 * Panel jest responsywny i widoczny tylko na większych ekranach (lg).
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
        <aside className="sticky top-18.25 h-[calc(100vh-73px)] w-72 shrink-0 rounded-2xl bg-[#1c1b1b] border-r border-surface-container-high z-30 hidden lg:flex flex-col justify-between p-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface block">
                            FRESH CUT
                        </span>
                        <span className="text-[10px] uppercase text-on-surface-variant tracking-widest block font-medium">
                            Panel Klienta
                        </span>
                    </div>
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

            <div className="pt-4 border-t border-surface-container-high/60">
                <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between border border-surface-container-high/50">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">
                                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-on-surface truncate">
                                {user.fullName}
                            </span>
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-primary" />
                                <span className="text-[9px] uppercase tracking-wider font-bold text-primary truncate">
                                    {user.isVip ? "Klubowicz VIP" : "Klient"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Wyloguj się"
                        type="button"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}