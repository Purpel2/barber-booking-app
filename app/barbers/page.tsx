import Newsletter from '@/app/components/newsletter';
import { prisma } from "@/lib/prisma";
import BarberItem from "./BarberItem";

// Cache na 24h - oszczędza połączenia z bazą (Connection Pool)
export const revalidate = 86400;

/**
 * Strona z listą barberów. Pobiera z bazy danych wszystkich aktywnych barberów i wyświetla ich w kolejności alfabetycznej.
 * Każdy barber jest renderowany za pomocą komponentu BarberItem, który obsługuje animacje wjazdu i wyświetlanie zdjęcia oraz informacji o barberze.
 * Jeśli nie ma żadnych barberów w bazie, wyświetlany jest komunikat informujący o braku przypisanych barberów.
 * @returns Strona z listą barberów.
 */
export default async function BarbersPage() {
    const barbers = await prisma.barber.findMany({
        where: { isActive: true },
        include: { profile: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen">
            <header className="pt-8 sm:pt-10 md:pt-12 pb-8 px-8 lg:px-20 max-w-7xl mx-auto border-b border-outline-variant/10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-16">

                    <div className="max-w-2xl">
                        <span className="font-label text-primary tracking-[0.3em] text-xs uppercase mb-4 block">
                            Ekipa FreshCut
                        </span>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-none text-on-surface">
                            Poznaj<br /> nasz
                            <span className="text-primary italic font-black"> skład</span>
                        </h1>
                    </div>

                    <div className="max-w-md lg:pb-3">
                        <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                            Zobacz, kto u nas odpowiada za dobre cięcia. Każdy z nas ma swoje ulubione style i techniki, ale cel mamy ten sam – zależy nam, żebyś po wyjściu z fotela wyglądał i czuł się świetnie.
                        </p>
                    </div>

                </div>
            </header>

            <main className="px-8 lg:px-12 py-16 md:py-20 max-w-380 mx-auto flex flex-col gap-24 md:gap-32">
                {barbers.length === 0 ? (
                    <p className="text-center text-on-surface-variant text-lg py-20">Brak przypisanych barberów w systemie.</p>
                ) : (
                    barbers.map((barber, index) => (
                        <BarberItem key={barber.id} barber={barber} index={index} />
                    ))
                )}
            </main>
            <Newsletter />
        </div>
    );
}
