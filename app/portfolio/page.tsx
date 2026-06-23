"use client";

import { useState, useRef, MouseEvent } from "react";
import Newsletter from '@/app/components/newsletter';

// na razie tylko pogladowo na sztywno, potem dodac pobieranie z bazy
const BARBERS = [
    { id: "all", name: "Wszyscy Mistrzowie" },
    { id: "adam", name: "Adam", avatar: "/images/adam.webp" },
    { id: "mateusz", name: "Mateusz", avatar: "/images/mateusz.webp" },
];

const PORTFOLIO_ITEMS = [
    { id: 1, barberId: "adam", img: "/images/portfolio/p1.webp" },
    { id: 2, barberId: "mateusz", img: "/images/portfolio/p2.webp" },
    { id: 3, barberId: "adam", img: "/images/portfolio/p3.webp" },
    { id: 4, barberId: "mateusz", img: "/images/portfolio/p4.webp" },
    { id: 5, barberId: "adam", img: "/images/portfolio/p5.webp" },
    { id: 6, barberId: "mateusz", img: "/images/portfolio/p6.webp" },
    { id: 7, barberId: "adam", img: "/images/portfolio/p7.webp" },
    { id: 8, barberId: "mateusz", img: "/images/portfolio/p8.webp" },
    { id: 9, barberId: "adam", img: "/images/portfolio/p9.webp" },
    { id: 10, barberId: "mateusz", img: "/images/portfolio/p10.webp" },
];

// pojedynczy element portfolio
function PortfolioItem({ item }: { item: typeof PORTFOLIO_ITEMS[0] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !imgRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        imgRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    };

    const handleMouseLeave = () => {
        if (imgRef.current) imgRef.current.style.transformOrigin = 'center center';
    };

    return (
        <div className="break-inside-avoid mb-6 group cursor-pointer">
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative overflow-hidden bg-surface-container-low rounded-xl shadow-lg border border-outline-variant/5"
            >
                <img
                    ref={imgRef}
                    src={item.img}
                    alt="Barber work"
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </div>
        </div>
    );
}

// główna strona portfolio
export default function PortfolioPage() {
    const [selectedBarber, setSelectedBarber] = useState("all");

    const filteredItems = PORTFOLIO_ITEMS.filter(item =>
        selectedBarber === "all" || item.barberId === selectedBarber
    );

    return (
        <div className="min-h-screen">
            {/* naglowek */}
            <header className="pt-40 pb-16 px-8 lg:px-20 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <span className="font-label text-primary tracking-[0.3em] text-xs uppercase mb-4 block">WARSZTAT</span>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-none text-on-surface mb-2">
                            PORTFOLIO
                        </h1>
                        <h2 className="font-headline text-3xl md:text-4xl text-on-surface-variant font-light">
                            Liczy się detal
                        </h2>
                    </div>
                    <div className="md:text-right">
                        <p className="font-body text-on-surface-variant max-w-sm leading-relaxed text-sm md:text-base">
                            Łączymy klasyczną szkołę z nowoczesnym podejściem. Przejrzyj naszą galerię i sprawdź, jak w praktyce wygląda precyzja, której możesz od nas oczekiwać na fotelu.
                        </p>
                    </div>
                </div>
            </header>

            {/* filtry */}
            <section className="px-8 lg:px-20 mb-16 max-w-7xl mx-auto overflow-hidden">
                <div className="flex overflow-x-auto no-scrollbar space-x-4 pb-4 items-center">
                    {BARBERS.map((barber) => (
                        <label
                            key={barber.id}
                            className={`flex items-center gap-4 shrink-0 px-8 h-18 rounded-full cursor-pointer transition-all duration-300 border ${selectedBarber === barber.id
                                ? "bg-primary border-primary text-on-primary shadow-lg shadow-primary/20"
                                : "bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/50"
                                }`}
                        >
                            <input
                                type="radio"
                                name="barber"
                                value={barber.id}
                                checked={selectedBarber === barber.id}
                                onChange={(e) => setSelectedBarber(e.target.value)}
                                className="hidden"
                            />

                            {barber.id !== "all" && (
                                <img
                                    src={barber.avatar}
                                    alt={barber.name}
                                    className="w-12 h-12 min-w-12 min-h-12 max-w-12 max-h-12 shrink-0 rounded-full object-cover bg-background border border-outline-variant/10"
                                />
                            )}

                            <span className="font-headline text-base font-bold tracking-wide">
                                {barber.name}
                            </span>
                        </label>
                    ))}
                </div>
            </section>

            {/* typ galerii masonry */}
            <main className="px-8 lg:px-20 pb-32 max-w-7xl mx-auto">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    {filteredItems.map(item => (
                        <PortfolioItem key={item.id} item={item} />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-on-surface-variant font-body">Brak przesłanych prac.</p>
                    </div>
                )}
            </main>
            <Newsletter />
        </div>
    );
}