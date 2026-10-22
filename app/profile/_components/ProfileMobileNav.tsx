"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CalendarDays, Bell, CreditCard, Settings } from "lucide-react";

const navItems = [
    { label: "Mój Profil", href: "/profile", icon: User },
    { label: "Wizyty", href: "/profile/appointments", icon: CalendarDays },
    { label: "Powiadomienia", href: "/profile/notifications", icon: Bell },
    { label: "Rozliczenia", href: "/profile/billing", icon: CreditCard },
    { label: "Ustawienia", href: "/profile/settings", icon: Settings },
];

/**
 * Komponent renderujący nawigację mobilną dla profilu użytkownika.
 * Zawiera linki do różnych sekcji profilu, takich jak "Mój Profil", "Wizyty", "Powiadomienia", "Rozliczenia" i "Ustawienia".
 * Aktywny link jest wyróżniony wizualnie.
 * @returns - Komponent nawigacji mobilnej dla profilu użytkownika.
 */
export default function ProfileMobileNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Nawigacja profilu" className="lg:hidden mb-6 -mx-2 px-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max pb-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${isActive
                                ? "bg-primary/15 text-primary border-primary/40 font-bold shadow-sm"
                                : "bg-surface-container-low text-on-surface-variant border-surface-container-high/60 hover:text-on-surface hover:bg-surface-container"
                                }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-on-surface-variant"}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
