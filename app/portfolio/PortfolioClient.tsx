"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Newsletter from "@/app/components/newsletter";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowRight, Calendar } from "lucide-react";

/**
 * Typ reprezentujący barbera w kontekście galerii portfolio.
 */
type Barber = { id: string; name: string; imageUrl: string };

/**
 * Typ reprezentujący pojedynczy element portfolio z powiązaniem do barbera.
 */
type PortfolioItem = { id: string; barberId: string; imageUrl: string };

/**
 * Stałe wymiary obrazów portfolio
 */
const PORTFOLIO_IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
    "/images/portfolio/p1.webp": { width: 1200, height: 1800 },
    "/images/portfolio/p2.webp": { width: 1200, height: 800 },
    "/images/portfolio/p3.webp": { width: 1200, height: 800 },
    "/images/portfolio/p4.webp": { width: 1200, height: 1800 },
    "/images/portfolio/p5.webp": { width: 1200, height: 1800 },
    "/images/portfolio/p6.webp": { width: 1200, height: 2133 },
    "/images/portfolio/p7.webp": { width: 1200, height: 800 },
    "/images/portfolio/p8.webp": { width: 1200, height: 801 },
    "/images/portfolio/p9.webp": { width: 1200, height: 1600 },
    "/images/portfolio/p10.webp": { width: 1200, height: 1600 },
};

/**
 * Właściwości komponentu PortfolioItemCard.
 */
interface PortfolioCardProps {
    item: PortfolioItem;
    barber?: Barber;
    onSelect: (item: PortfolioItem) => void;
}

/**
 * Komponent PortfolioItemCard renderuje pojedynczą kartę portfolio z efektem powiększenia obrazu przy najechaniu myszką.
 * Umożliwia wybranie elementu portfolio poprzez kliknięcie, co wywołuje funkcję onSelect przekazaną w propsach.
 * @param item - Obiekt reprezentujący element portfolio do wyświetlenia.
 * @param barber - Opcjonalny obiekt barbera powiązanego z elementem portfolio.
 * @param onSelect - Funkcja wywoływana po kliknięciu na kartę, przekazująca wybrany element portfolio.
 * @returns Element JSX reprezentujący kartę portfolio z efektem powiększenia obrazu.
 */
function PortfolioItemCard({ item, barber, onSelect }: PortfolioCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const dimensions = PORTFOLIO_IMAGE_DIMENSIONS[item.imageUrl] || { width: 1200, height: 1600 };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !imgRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        imgRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    };

    const handleMouseLeave = () => {
        if (imgRef.current) imgRef.current.style.transformOrigin = "center center";
    };

    return (
        <div
            className="break-inside-avoid mb-6 group cursor-pointer"
            onClick={() => onSelect(item)}
        >
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
                className="relative overflow-hidden bg-surface-container-low rounded-xl shadow-lg border border-outline-variant/10 w-full"
            >
                <Image
                    ref={imgRef}
                    src={item.imageUrl}
                    alt={barber ? `Praca barbera ${barber.name}` : "Praca FreshCut"}
                    width={dimensions.width}
                    height={dimensions.height}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
            </div>
        </div>
    );
}

/**
 * Właściwości komponentu PortfolioClient.
 */
interface PortfolioClientProps {
    initialBarbers: Barber[];
    initialItems: PortfolioItem[];
}

/**
 * Komponent PortfolioClient renderuje interaktywną galerię portfolio z możliwością filtrowania według barbera oraz powiększania zdjęć w lightboxie.
 * Użytkownik może wybrać barbera, aby zobaczyć tylko jego prace, a kliknięcie na zdjęcie otwiera je w powiększeniu wraz z możliwością umówienia wizyty.
 * @param initialBarbers - Lista początkowych barberów do wyświetlenia w filtrze.
 * @param initialItems - Lista początkowych elementów portfolio do wyświetlenia w galerii.
 * @returns Element JSX renderujący interaktywną galerię portfolio z filtrami i lightboxem.
 */
export default function PortfolioClient({
    initialBarbers,
    initialItems,
}: PortfolioClientProps) {
    const [selectedBarber, setSelectedBarber] = useState("all");
    const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

    const filteredItems = initialItems.filter(
        (item) => selectedBarber === "all" || item.barberId === selectedBarber
    );

    const activeBarber = initialBarbers.find((b) => b.id === lightboxItem?.barberId);
    const lightboxDimensions = lightboxItem
        ? PORTFOLIO_IMAGE_DIMENSIONS[lightboxItem.imageUrl] || { width: 1200, height: 1600 }
        : { width: 1200, height: 1600 };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightboxItem(null);
        };

        if (lightboxItem) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [lightboxItem]);

    return (
        <div className="min-h-screen">
            <header className="pt-8 sm:pt-10 md:pt-12 pb-10 px-8 lg:px-20 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <span className="font-label text-primary tracking-[0.3em] text-xs uppercase mb-4 block">
                            WARSZTAT
                        </span>
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

            <section className="px-4 sm:px-8 lg:px-20 mb-14 max-w-7xl mx-auto overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 overflow-x-auto no-scrollbar space-x-4 pb-4 items-center">
                    <label
                        className={`relative flex items-center gap-4 shrink-0 px-8 h-18 rounded-full cursor-pointer transition-all duration-300 border ${selectedBarber === "all"
                            ? "bg-primary border-primary text-on-primary shadow-lg shadow-primary/20"
                            : "bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-primary/50"
                            }`}
                    >
                        <input
                            type="radio"
                            name="barber"
                            value="all"
                            checked={selectedBarber === "all"}
                            onChange={(e) => setSelectedBarber(e.target.value)}
                            className="hidden"
                        />
                        <span className="font-headline text-sm sm:text-base font-bold tracking-wide">
                            Wszyscy Mistrzowie
                        </span>
                    </label>

                    {initialBarbers.map((barber) => (
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

                            {barber.imageUrl && (
                                <Image
                                    src={barber.imageUrl}
                                    alt={barber.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 min-w-12 min-h-12 max-w-12 max-h-12 shrink-0 rounded-full object-cover bg-background border border-outline-variant/10"
                                />
                            )}

                            <span className="font-headline text-sm sm:text-base font-bold tracking-wide">
                                {barber.name}
                            </span>
                        </label>
                    ))}
                </div>
            </section>

            <main className="px-8 lg:px-20 pb-32 max-w-7xl mx-auto min-h-[60vh] sm:min-h-[70vh] lg:min-h-187.5">
                <motion.div
                    key={selectedBarber}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="columns-1 md:columns-2 lg:columns-3 gap-6"
                >
                    {filteredItems.map((item) => {
                        const barber = initialBarbers.find((b) => b.id === item.barberId);
                        return (
                            <PortfolioItemCard
                                key={item.id}
                                item={item}
                                barber={barber}
                                onSelect={(selected) => setLightboxItem(selected)}
                            />
                        );
                    })}
                </motion.div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-on-surface-variant font-body">Brak przesłanych prac.</p>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setLightboxItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="relative max-w-3xl w-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setLightboxItem(null)}
                                className="absolute -top-12 right-0 sm:top-3 sm:right-3 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-on-surface hover:text-primary transition-colors flex items-center justify-center cursor-pointer border border-outline-variant/30 shadow-lg"
                                aria-label="Zamknij"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative w-full rounded-2xl overflow-hidden bg-black/60 border border-outline-variant/20 shadow-2xl flex items-center justify-center max-h-[75vh]">
                                <Image
                                    src={lightboxItem.imageUrl}
                                    alt="Powiększone zdjęcie stylizacji"
                                    width={lightboxDimensions.width}
                                    height={lightboxDimensions.height}
                                    sizes="(max-width: 768px) 95vw, 800px"
                                    className="max-h-[75vh] w-auto max-w-full object-contain"
                                    priority
                                />
                            </div>

                            <div className="mt-4 w-full flex justify-center">
                                <Link
                                    href={
                                        activeBarber
                                            ? `/reservations?barber=${activeBarber.name.toLowerCase()}`
                                            : "/reservations"
                                    }
                                    onClick={() => setLightboxItem(null)}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs sm:text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Umów wizytę</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Newsletter />
        </div>
    );
}
