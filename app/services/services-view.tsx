"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";

export type ServiceItem = {
    id: string;
    name: string;
    category: "HAIR" | "BEARD" | "COMBO" | "CARE";
    description: string;
    price: number;
    duration: number;
    imageUrl: string | null;
};

interface ServicesViewProps {
    services: ServiceItem[];
    isLoggedIn: boolean;
}

const CATEGORIES = [
    { id: "ALL", label: "Wszystkie" },
    { id: "HAIR", label: "Włosy" },
    { id: "BEARD", label: "Broda" },
    { id: "COMBO", label: "Pakiety" },
    { id: "CARE", label: "Pielęgnacja" },
] as const;

function formatPrice(amount: number): string {
    return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Komponent ServicesView renderuje listę usług dostępnych w systemie barberskim.
 * Umożliwia filtrowanie usług według kategorii oraz wyświetlanie szczegółowych informacji o każdej usłudze.
 * Jeśli użytkownik jest zalogowany, może również dokonać rezerwacji wybranej usługi.
 */
export default function ServicesView({ services, isLoggedIn }: ServicesViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const filteredServices = selectedCategory === "ALL"
        ? services
        : services.filter((s) => s.category === selectedCategory);

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-12 border-b border-outline-variant/10 pb-6">
                {CATEGORIES.map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedCategory(tab.id)}
                            className={`px-5 py-2.5 rounded-full font-headline text-xs tracking-wider uppercase font-bold transition-all duration-200 cursor-pointer ${isActive
                                ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105"
                                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/10"
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => {
                        const reservationPath = `/reservations?serviceId=${encodeURIComponent(service.id)}`;
                        const bookingUrl = isLoggedIn
                            ? reservationPath
                            : `/login?redirect=${encodeURIComponent(reservationPath)}`;

                        return (
                            <article
                                key={service.id}
                                className="group flex flex-col bg-[#161616] rounded-2xl overflow-hidden border border-surface-container-high hover:border-primary/40 transition-all duration-300 shadow-xl hover:-translate-y-1"
                            >
                                <div className="relative h-60 w-full overflow-hidden rounded-t-2xl bg-[#201f1f] transform-gpu">
                                    <div className="absolute inset-0 w-full h-full overflow-hidden transform-gpu">
                                        <Image
                                            src={service.imageUrl || "/images/placeholder.webp"}
                                            alt={service.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover grayscale-65 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 transform-gpu"
                                        />
                                    </div>
                                    <div className="absolute inset-x-0 -bottom-1 h-10 bg-linear-to-t from-[#161616] via-[#161616]/10 to-transparent pointer-events-none z-10" />
                                </div>

                                <div className="p-6 flex flex-col grow">
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <h2 className="font-headline text-xl font-bold tracking-tight text-[#e5e2e1] group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h2>
                                        <span className="font-headline text-xl text-primary font-black whitespace-nowrap">
                                            {formatPrice(service.price)}
                                        </span>
                                    </div>

                                    <p className="font-body text-[#e5e2e1]/60 text-sm leading-relaxed mb-6 grow">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-surface-container-high mt-auto">
                                        <div className="flex items-center text-[#e5e2e1]/50 font-label text-xs tracking-wider font-semibold">
                                            <Clock className="w-4 h-4 mr-2 text-primary/70" />
                                            {service.duration} MIN
                                        </div>

                                        <Link
                                            href={bookingUrl}
                                            className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 px-4 py-2 rounded-lg font-headline font-bold text-xs tracking-wider uppercase hover:bg-primary hover:text-on-primary transition-all duration-200"
                                        >
                                            <span>Zarezerwuj</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center text-on-surface-variant text-sm py-16">
                        Brak usług w wybranej kategorii.
                    </div>
                )}

                <div className="group relative flex flex-col justify-end bg-linear-to-b from-[#252019] to-[#1a1713] border border-primary/40 rounded-2xl overflow-hidden p-8 min-h-95 shadow-2xl hover:border-primary/60 transition-all duration-300">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Image
                            src="/images/texture_bg.webp"
                            alt="Texture background"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={80}
                            className="object-cover opacity-45 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute inset-0 bg-linear-to-t from-[#14120f]/90 via-[#14120f]/30 to-transparent" />
                    </div>

                    <div className="absolute top-6 right-6 z-10 px-3.5 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-[11px] font-black uppercase tracking-widest backdrop-blur-md">
                        Exclusive
                    </div>

                    <div className="relative z-10">
                        <span className="text-primary font-label text-xs uppercase tracking-[0.25em] font-bold block mb-2">
                            Klub Fresh Cut
                        </span>
                        <h3 className="font-headline text-3xl font-black tracking-tight text-[#f5f3f0] leading-tight mb-3">
                            NIELIMITOWANA<br />PIELĘGNACJA
                        </h3>
                        <p className="font-body text-[#e5e2e1]/85 text-sm mb-6 max-w-xs leading-relaxed">
                            Przejdź na abonament i korzystaj z regularnych wizyt oraz dedykowanego barku.
                        </p>
                        <Link
                            href="/membership"
                            className="inline-flex items-center justify-center w-full bg-primary text-on-primary px-6 py-3.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            Sprawdź członkostwo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}