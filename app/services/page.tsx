import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Clock } from "lucide-react";
import Newsletter from '@/app/components/newsletter';

export default async function ServicesPage() {
    //sprawdzamy sesje użytkownika
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let databaseUser = null;
    if (authUser) {
        databaseUser = await prisma.user.findUnique({
            where: { id: authUser.id },
        });
    }

    //pobieranie usług z bazy danych
    const services = await prisma.service.findMany();

    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">

                {/* naglowek*/}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-2xl">
                        <span className="font-label text-xs tracking-[0.2em] uppercase text-primary mb-4 block">
                            EKSPERCKA PIELĘGNACJA
                        </span>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-on-surface leading-[0.9]">
                            KATALOG<br />
                            <span className="text-primary">USŁUG</span>
                        </h1>
                    </div>
                    <div className="max-w-sm text-right">
                        <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                            Precyzja dla współczesnego dżentelmena. Każda usługa to starannie dobrane doświadczenie łączące tradycję z nowoczesną techniką.
                        </p>
                    </div>
                </header>

                {/* siatka z uslugami */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

                    {/* mapowanie uslug z bazy */}
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden transition-all duration-500 hover:bg-surface-container-high border border-outline-variant/10 shadow-lg">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt={service.name}
                                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                                        src={service.imageUrl || "/images/placeholder.webp"}
                                    />
                                </div>

                                <div className="p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <h3 className="font-headline text-2xl font-bold tracking-tight">{service.name}</h3>
                                        <span className="font-headline text-xl text-primary font-bold whitespace-nowrap">
                                            {service.price} PLN
                                        </span>
                                    </div>

                                    <p className="font-body text-on-surface-variant text-sm mb-8 grow">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center text-on-surface/50 font-label text-xs tracking-widest">
                                            {/* zegrarek*/}
                                            <Clock className="w-4 h-4 mr-2" />
                                            {service.duration} MIN
                                        </div>

                                        <Link
                                            href={databaseUser ? "/dashboard" : "/login"}
                                            className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-lg font-headline font-bold text-sm hover:bg-primary hover:text-on-primary transition-all duration-300"
                                        >
                                            ZAREZERWUJ
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-on-surface-variant text-sm italic py-12">
                            Brak usług do wyświetlenia.
                        </div>
                    )}

                    {/* czlonkostwo */}
                    <div className="group relative flex flex-col bg-primary rounded-xl overflow-hidden p-8 justify-end min-h-100">
                        <div className="absolute inset-0 z-0">
                            <img
                                alt="Membership"
                                className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
                                src="/images/texture_bg.webp"
                            />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-headline text-4xl font-black tracking-tighter text-on-primary leading-none mb-4">
                                FRESH CUT
                            </h3>
                            <p className="font-body text-on-primary text-sm mb-6 max-w-50">
                                Nielimitowana pielęgnacja dla prawdziwych koneserów.
                            </p>
                            <Link
                                href="/membership"
                                className="block text-center bg-on-primary text-primary px-6 py-3 rounded-lg font-headline font-bold text-sm w-full tracking-widest hover:scale-105 transition-transform"
                            >
                                SPRAWDŹ CZŁONKOSTWO
                            </Link>
                        </div>
                    </div>

                </section>
            </main>
            <Newsletter />

        </div>
    );
}