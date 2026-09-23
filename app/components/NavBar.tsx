"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings, CalendarDays, ChevronDown, Menu, X, CreditCard } from "lucide-react";
import { logoutUser } from "../actions/auth";

interface NavBarProps {
    user: {
        firstName: string;
        fullName: string;
        email: string;
    } | null;
}

/**
 * Komponent NavBar renderuje pasek nawigacyjny z linkami do różnych sekcji strony, menu użytkownika oraz przyciskiem do umawiania wizyt.
 */
export default function NavBar({ user }: NavBarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // stan menu uzytkownika - otwarte/zamkniete
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // stan menu mobilnego - otwarte/zamkniete
    const menuRef = useRef<HTMLDivElement>(null); // referencja do elementu menu uzytkownika, aby zamknac menu po kliknieciu poza nim
    const pathname = usePathname();
    const router = useRouter();

    // zamykanie dropdownu po kliknięciu gdziekolwiek poza menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    async function handleLogout() { // funkcja wylogowania - wywoluje logoutUser, odswieza router i przekierowuje na glowna
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
        await logoutUser();
        router.push("/");
        router.refresh();
    }

    const getLinkClass = (path: string) => { // podswietlenie aktywnej strony w menu
        const baseClass = "font-headline font-bold tracking-tight transition-all pb-1 text-lg";
        const activeClass = "text-primary border-b-2 border-primary";
        const inactiveClass = "text-on-surface/70 hover:text-primary border-b-2 border-transparent";

        return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
    };

    const getMobileLinkClass = (path: string) => { // podswietlenie aktywnej strony w menu mobilnym
        const baseClass = "font-headline font-bold tracking-tight transition-all py-3 px-4 rounded-xl block text-sm";
        const activeClass = "text-primary bg-primary/10";
        const inactiveClass = "text-on-surface/70 hover:text-primary hover:bg-surface-variant/20";

        return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
    };

    const bookingHref = user ? "/reservations" : "/login?redirect=/reservations";

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/15 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center px-8 py-4 max-w-full">
                <Link href="/" className="flex items-center gap-3 group focus:outline-none select-none">
                    {/* brzytwa LOGO */}
                    <svg
                        className="hidden md:block w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-[1.02]"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g fill="currentColor">
                            <path d="M488.673,107.117v11.518L256,152.604l-232.673-33.97v-11.518c0-11.593,9.401-20.994,20.994-20.994 h423.358C479.272,86.123,488.673,95.523,488.673,107.117z" />
                            <path d="M488.673,404.883v-11.518L256,359.396l-232.673,33.97v11.518c0,11.593,9.401,20.994,20.994,20.994 h423.358C479.272,425.877,488.673,416.477,488.673,404.883z" />
                            <path d="M512,186.883v140.194h-44.846c-9.599,0-17.378,7.78-17.378,17.378 c0,9.599,7.779,17.378,17.378,17.378h21.519v32.512H23.327v-32.512h21.519c9.599,0,17.378-7.78,17.378-17.378 s-7.779-17.378-17.378-17.378H0V186.883h44.846c9.599,0,17.378-7.779,17.378-17.378c0-9.599-7.779-17.378-17.378-17.378H23.327 v-32.512h465.346v32.512h-21.519c-9.599,0-17.378,7.779-17.378,17.378c0,9.599,7.779,17.378,17.378,17.378L512,186.883L512,186.883z M450.091,280.738v-45.557c0-6.438-5.225-11.663-11.663-11.663c-6.438,0-11.663,5.225-11.663,11.663v11.115h-35.049 c-0.933,0-1.843,0.128-2.718,0.338c-4.129-8.094-12.538-13.646-22.242-13.646c-9.716,0-18.125,5.552-22.254,13.635 c-0.875-0.198-1.773-0.327-2.718-0.327h-46.712c-0.595,0-1.166,0.058-1.726,0.14c-4.922-15.956-19.781-27.549-37.346-27.549 s-32.424,11.593-37.346,27.549c-0.56-0.082-1.131-0.14-1.726,0.14h-46.712c-0.945,0-1.843,0.128-2.718,0.327 c-4.129-8.083-12.538-13.635-22.254-13.635c-9.704,0-18.113,5.552-22.242,13.635c-0.875-0.198-1.785-0.327-2.718-0.327H85.236 v-11.115c0-6.438-5.225-11.663-11.663-11.663s-11.663,5.225-11.663,11.663v45.557c0,6.438,5.225,11.663,11.663,11.663 s11.663-5.225,11.663-11.663v-11.115h35.049c0.933,0,1.843-0.128,2.718-0.327c4.129,8.083,12.538,13.635,22.242,13.635 c9.716,0,18.125-5.552,22.254-13.635c0.875,0.198,1.773,0.327,2.718,0.327h46.712c0.595,0,1.166-0.058,1.726,0.14 c4.922,15.956,19.781,27.549,37.346,27.549c17.565,0,32.424-11.593,37.346-27.549c0.56,0.082,1.131,0.14,1.726,0.14h46.712c0.945,0,1.843-0.128,2.718-0.327c4.129,8.083,12.538,13.635,22.254,13.635c9.704,0,18.113-5.552,22.242-13.646 c0.875,0.21,1.784,0.338,2.718,0.338h35.048v11.115c0,6.438,5.225,11.663,11.663,11.663 C444.865,292.401,450.091,287.176,450.091,280.738z" />
                        </g>
                    </svg>

                    <span
                        className="text-2xl font-black tracking-tighter font-headline block relative"
                        style={{
                            color: "transparent",
                            WebkitTextFillColor: "transparent",
                            backgroundImage: "linear-gradient(120deg, #e9c176 0%, #e9c176 40%, #ffffff 50%, #e9c176 60%, #e9c176 100%)",
                            backgroundSize: "200% 100%",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            animation: "pureShimmer 4s infinite linear"
                        }}
                    >
                        Fresh Cut
                    </span>

                    <style>{`
                        @keyframes pureShimmer {
                            0% { background-position: 200% 0; }
                            100% { background-position: -200% 0; }
                        }
                    `}</style>
                </Link>

                {/* glowne menu nawigacyjne */}
                <div className="hidden md:flex items-center gap-8">
                    <Link className={getLinkClass("/")} href="/">STRONA GŁÓWNA</Link>
                    <Link className={getLinkClass("/services")} href="/services">USŁUGI</Link>
                    <Link className={getLinkClass("/barbers")} href="/barbers">BARBERZY</Link>
                    <Link className={getLinkClass("/portfolio")} href="/portfolio">PORTFOLIO</Link>
                    <Link className={getLinkClass("/membership")} href="/membership">CZŁONKOSTWO</Link>
                </div>

                {/* menu uzytkownika */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-on-surface/70">
                        {user && (
                            <button className="hover:text-primary transition-all p-1 relative cursor-pointer" aria-label="Powiadomienia">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                            </button>
                        )}

                        {user ? ( // jesli uzytkownik jest zalogowany, pokazuje menu z imieniem i opcjami
                            <div className="relative" ref={menuRef}>
                                {/* trigger dropdownu */}
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer select-none focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#201f1f] border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">
                                        {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                                    </div>
                                    <span className="text-sm font-semibold text-[#e5e2e1] hidden sm:inline">
                                        {user.firstName}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-[#e5e2e1]/40 transition-transform duration-200 ${isMenuOpen ? "rotate-180 text-primary" : ""
                                            }`}
                                    />
                                </button>

                                {/* dropdown */}
                                <div
                                    className={`absolute right-0 mt-2 w-56 rounded-xl bg-[#1c1b1b] border border-surface-container-high shadow-2xl p-1.5 z-50 transition-all duration-150 ease-out origin-top-right ${isMenuOpen
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                        }`}
                                >
                                    <div className="space-y-0.5">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e5e2e1]/80 hover:text-primary hover:bg-surface-container-high transition-colors"
                                        >
                                            <User className="w-4 h-4 text-[#e5e2e1]/50" />
                                            <span>Mój profil</span>
                                        </Link>

                                        <Link
                                            href="/profile/appointments"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e5e2e1]/80 hover:text-primary hover:bg-surface-container-high transition-colors"
                                        >
                                            <CalendarDays className="w-4 h-4 text-[#e5e2e1]/50" />
                                            <span>Moje wizyty</span>
                                        </Link>

                                        <Link
                                            href="/profile/subscription"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e5e2e1]/80 hover:text-primary hover:bg-surface-container-high transition-colors"
                                        >
                                            <CreditCard className="w-4 h-4 text-[#e5e2e1]/50" />
                                            <span>Subskrypcje i rozliczenia</span>
                                        </Link>

                                        <Link
                                            href="/profile/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e5e2e1]/80 hover:text-primary hover:bg-surface-container-high transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-[#e5e2e1]/50" />
                                            <span>Ustawienia konta</span>
                                        </Link>
                                    </div>

                                    <div className="pt-1 mt-1 border-t border-surface-container-high">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#ffb4ab] hover:bg-[#3a1d1d] transition-colors cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 text-[#ffb4ab]" />
                                            <span>Wyloguj się</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="hover:text-primary transition-all p-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                            >
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">Zaloguj</span>
                            </Link>
                        )}
                    </div>

                    <Link
                        href={bookingHref}
                        className="hidden md:block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-headline font-bold text-sm tracking-wide hover:brightness-110 transition-all scale-95 duration-200 ease-in-out text-center"
                    >
                        UMÓW WIZYTĘ
                    </Link>

                    <button // przycisk rozwijania menu mobilnego
                        onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMenuOpen(false); }}
                        className="md:hidden text-on-surface/70 hover:text-primary p-1 focus:outline-none cursor-pointer"
                        aria-label="Toggle Mobile Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* menu mobilne */}
            {isMobileMenuOpen && (
                <>
                    {/* przyciemnianie tła na mobile - menu */}
                    <div className="fixed inset-0 top-16.25 bg-black/60 backdrop-blur-sm z-30 md:hidden cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}></div>

                    {/* lista linków */}
                    <div className="absolute top-full left-0 w-full bg-[#1c1b1b] border-b border-primary/15 p-4 flex flex-col gap-1.5 z-40 md:hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link className={getMobileLinkClass("/")} href="/" onClick={() => setIsMobileMenuOpen(false)}>STRONA GŁÓWNA</Link>
                        <Link className={getMobileLinkClass("/services")} href="/services" onClick={() => setIsMobileMenuOpen(false)}>USŁUGI</Link>
                        <Link className={getMobileLinkClass("/barbers")} href="/barbers" onClick={() => setIsMobileMenuOpen(false)}>BARBERZY</Link>
                        <Link className={getMobileLinkClass("/portfolio")} href="/portfolio" onClick={() => setIsMobileMenuOpen(false)}>PORTFOLIO</Link>
                        <Link className={getMobileLinkClass("/membership")} href="/membership" onClick={() => setIsMobileMenuOpen(false)}>CZŁONKOSTWO</Link>

                        {user ? (
                            <div className="pt-2 mt-2 border-t border-outline-variant/15 flex flex-col gap-1">
                                <Link className={getMobileLinkClass("/profile")} href="/profile" onClick={() => setIsMobileMenuOpen(false)}>MÓJ PROFIL</Link>
                                <Link className={getMobileLinkClass("/profile/appointments")} href="/profile/appointments" onClick={() => setIsMobileMenuOpen(false)}>MOJE WIZYTY</Link>
                                <Link className={getMobileLinkClass("/profile/subscription")} href="/profile/subscription" onClick={() => setIsMobileMenuOpen(false)}>SUBSKRYPCJE I ROZLICZENIA</Link>
                                <Link className={getMobileLinkClass("/profile/settings")} href="/profile/settings" onClick={() => setIsMobileMenuOpen(false)}>USTAWIENIA KONTA</Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-3 px-4 rounded-xl text-sm font-headline font-bold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 cursor-pointer mt-1"
                                >
                                    <LogOut className="w-4 h-4" /> WYLOGUJ SIĘ
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 mt-2 border-t border-outline-variant/15">
                                <Link
                                    className={getMobileLinkClass("/login")}
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    ZALOGUJ SIĘ
                                </Link>
                            </div>
                        )}

                        {/* umow wizyte dla mobile */}
                        <Link
                            href={bookingHref}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-headline font-black text-sm tracking-widest hover:brightness-110 transition-all text-center mt-3 w-full block shadow-lg"
                        >
                            UMÓW WIZYTĘ
                        </Link>
                    </div>
                </>
            )}
        </nav>
    );
}