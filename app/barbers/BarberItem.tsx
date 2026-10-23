"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface BarberItemProps {
    barber: {
        id: string;
        name: string;
        role?: string | null;
        imageUrl?: string | null;
        bio?: string | null;
        profile?: {
            bookingName?: string | null;
            fullBio?: string | null;
            quote?: string | null;
            specialties?: string[] | null;
        } | null;
    };
    index: number;
}

/**
 * Komponent BarberItem renderuje szczegółowe informacje o barberze w formie sekcji z obrazem, cytatem, biografią i przyciskiem do rezerwacji wizyty.
 * @param barber - Obiekt zawierający dane barberów, w tym imię, rolę, zdjęcie, biografię i profil.
 * @param index - Indeks barberów w liście, używany do określenia układu (lewo/prawo).
 * @returns Element JSX renderujący sekcję z informacjami o barberze.
 */
export default function BarberItem({ barber, index }: BarberItemProps) {
    const isEven = index % 2 === 0;
    const profile = barber.profile;

    const rawBio = profile?.fullBio || barber.bio || "";
    const bioParagraphs = rawBio.split("\n").filter((p) => p.trim() !== "");

    const imgXOffset = isEven ? -35 : 35;
    const textXOffset = isEven ? 35 : -35;

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: imgXOffset }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className={`col-span-1 lg:col-span-5 ${isEven ? "lg:col-start-1" : "lg:col-start-8 order-1 lg:order-2"}`}
            >
                <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-container-low shadow-2xl group">
                    {barber.imageUrl ? (
                        <Image
                            src={barber.imageUrl}
                            alt={barber.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-cover grayscale-65 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 transform-gpu"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                            Brak zdjęcia
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: textXOffset }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`col-span-1 lg:col-span-5 flex flex-col justify-center ${isEven ? "lg:col-start-6" : "lg:col-start-3 order-2 lg:order-1"
                    }`}
            >
                <span className="font-label text-primary tracking-[0.2em] text-xs uppercase font-bold mb-3 block">
                    {barber.role || "Barber"}
                </span>

                <h2 className="font-headline text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-6">
                    {barber.name}
                </h2>

                {profile?.quote && (
                    <blockquote className="border-l-2 border-primary pl-6 mb-8">
                        <p className="font-headline text-xl md:text-2xl text-on-surface-variant italic font-light leading-snug">
                            &ldquo;{profile.quote}&rdquo;
                        </p>
                    </blockquote>
                )}

                {bioParagraphs.length > 0 && (
                    <div className="font-body text-on-surface-variant text-base leading-relaxed space-y-4 mb-10">
                        {bioParagraphs.map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                )}

                {profile?.specialties && profile.specialties.length > 0 && (
                    <div className="mb-12">
                        <h3 className="font-label text-xs tracking-widest uppercase text-on-surface-variant/60 mb-4">
                            Główne specjalizacje
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {profile.specialties.map((skill, i) => (
                                <span
                                    key={i}
                                    className="border border-outline-variant/30 px-4 py-2 rounded-full text-xs font-label text-on-surface/80"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <Link
                        href={`/reservations?barber=${barber.name.toLowerCase()}`}
                        className="inline-flex items-center cursor-pointer gap-3 bg-primary text-on-primary px-8 py-4 rounded-md font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 hover:shadow-[0_0_30px_-5px_rgba(233,193,118,0.3)] transition-all group"
                    >
                        Zarezerwuj wizytę {profile?.bookingName ? `u ${profile.bookingName}` : ""}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
