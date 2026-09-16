import { ArrowRight } from "lucide-react";
import Newsletter from '@/app/components/newsletter';
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Cache na 24h - oszczędza połączenia z bazą (Connection Pool)
export const revalidate = 86400;

/**
 * Strona BarbersPage wyświetla listę aktywnych barberów z ich zdjęciami, biografiami i specjalizacjami.
 * Pobiera dane barberów z bazy danych przy użyciu Prisma i renderuje je w responsywnym układzie.
 * Każdy barber ma link do rezerwacji wizyty, który prowadzi do strony rezerwacji z odpowiednim parametrem.
 * Strona zawiera również nagłówek z informacjami o zespole oraz sekcję newslettera na dole.
 */
export default async function BarbersPage() {
    const barbers = await prisma.barber.findMany({
        where: { isActive: true },
        include: { profile: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen">
            {/* naglowek */}
            <header className="pt-40 px-8 lg:px-20 max-w-7xl mx-auto border-b border-outline-variant/10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-16">

                    {/* lewa strona */}
                    <div className="max-w-2xl">
                        <span className="font-label text-primary tracking-[0.3em] text-xs uppercase mb-4 block">
                            Ekipa FreshCut
                        </span>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-none text-on-surface">
                            Poznaj<br /> nasz
                            <span className="text-primary italic font-black"> skład</span>
                        </h1>
                    </div>

                    {/* prawa strona */}
                    <div className="max-w-md lg:pb-3">
                        <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                            Zobacz, kto u nas odpowiada za dobre cięcia. Każdy z nas ma swoje ulubione style i techniki, ale cel mamy ten sam – zależy nam, żebyś po wyjściu z fotela wyglądał i czuł się świetnie.
                        </p>
                    </div>

                </div>
            </header>

            {/* lista barberow */}
            <main className="px-8 lg:px-12 py-24 max-w-380 mx-auto flex flex-col gap-32 md:gap-48">
                {barbers.length === 0 ? (
                    <p className="text-center text-on-surface-variant text-lg py-20">Brak przypisanych barberów w systemie.</p>
                ) : (
                    barbers.map((barber, index) => {
                        // parzysty do lewej, nieparzysty do prawej
                        const isEven = index % 2 === 0;
                        const profile = barber.profile;

                        // Parsowanie stringa z bazy na tablicę akapitów
                        const rawBio = profile?.fullBio || barber.bio || "";
                        const bioParagraphs = rawBio.split('\n').filter(p => p.trim() !== '');

                        return (
                            <section
                                key={barber.id}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                            >

                                {/* obrazek */}
                                <div className={`col-span-1 lg:col-span-5 ${isEven ? 'lg:col-start-1' : 'lg:col-start-8 order-1 lg:order-2'}`}>
                                    <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-container-low shadow-2xl">
                                        {barber.imageUrl ? (
                                            <Image
                                                src={barber.imageUrl}
                                                alt={barber.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 40vw"
                                                className="object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out filter grayscale hover:grayscale-0"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">Brak zdjęcia</div>
                                        )}
                                    </div>
                                </div>

                                {/* tekst */}
                                <div className={`col-span-1 lg:col-span-5 flex flex-col justify-center ${isEven ? 'lg:col-start-6' : 'lg:col-start-3 order-2 lg:order-1'}`}>

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
                                            Zarezerwuj wizytę {profile?.bookingName ? `u ${profile.bookingName}` : ''}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                </div>
                            </section>
                        );
                    })
                )}
            </main>
            <Newsletter />
        </div>
    );
}