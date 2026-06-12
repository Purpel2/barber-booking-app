"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User, LogOut, Settings, CalendarDays, ChevronDown } from "lucide-react";
import { logoutUser } from "../actions/auth";

interface NavBarProps {
    user: {
        firstName: string;
        fullName: string;
        email: string;
    } | null;
}

export default function NavBar({ user }: NavBarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); //stan menu uzytkownika - otwarte/zamkniete
    const pathname = usePathname();

    async function handleLogout() { //funkcja wylogowania - wywoluje logoutUser, a nastepnie przekierowuje na strone glowna
        await logoutUser();
        window.location.href = "/";
    }

    const getLinkClass = (path: string) => { //podswietlenie aktywnej strony w menu
        const baseClass = "font-headline font-bold tracking-tight transition-all pb-1";
        const activeClass = "text-primary border-b-2 border-primary";
        const inactiveClass = "text-on-surface/70 hover:text-primary border-b-2 border-transparent";

        return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/15 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center px-8 py-4 max-w-full">
                <Link href="/" className="flex items-center gap-3 group focus:outline-none select-none">
                    {/* brzytwa LOGO */}
                    <svg
                        className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-[1.02]"
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
                        <button className="hover:text-primary transition-all p-1 relative cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                        </button>

                        {user ? ( //jesli uzytkownik jest zalogowany, pokazuje menu z imieniem i opcjami, jesli nie - ikona logowania
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 hover:text-primary transition-all p-1 cursor-pointer select-none focus:outline-none"
                                >
                                    <div className="w-7 h-7 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                                        {user.firstName[0]}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:inline text-on-surface-variant">{user.firstName}</span>
                                    <ChevronDown className={`w-3 h-3 text-on-surface/40 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isMenuOpen && ( //pokazuje dropdown menu
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-[#1c1b1b] border border-outline-variant/30 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <div className="px-4 py-3 border-b border-outline-variant/10 mb-1">
                                                <p className="text-xs font-bold text-on-surface">{user.fullName}</p>
                                                <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                                            </div>

                                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-lg transition-colors">
                                                <CalendarDays className="w-4 h-4" />
                                                <span>Historia zamówień</span>
                                            </Link>

                                            <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-lg transition-colors">
                                                <Settings className="w-4 h-4" />
                                                <span>Ustawienia konta</span>
                                            </Link>

                                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border-t border-outline-variant/5 mt-1 pt-3">
                                                <LogOut className="w-4 h-4" />
                                                <span>Wyloguj się</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hover:text-primary transition-all p-1 flex items-center">
                                <User className="w-5 h-5" />
                            </Link>
                        )}
                    </div>

                    <Link href={user ? "/dashboard" : "/login"} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-headline font-bold text-sm tracking-wide hover:brightness-110 transition-all scale-95 duration-200 ease-in-out text-center">
                        UMÓW WIZYTĘ
                    </Link>
                </div>
            </div>
        </nav>
    );
}