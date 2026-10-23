import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Newsletter from "@/app/components/newsletter";
import ServicesView, { ServiceItem } from "./services-view";

export const revalidate = 3600;

/**
 * Podstrona Usługi systemu Fresh Cut Barbershop. Pobiera wszystkie dostępne usługi z bazy danych i renderuje komponent ServicesView z listą usług oraz informacją o zalogowanym użytkowniku.
 * @returns Element JSX renderujący podstronę z katalogiem usług.
 */
export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isLoggedIn = Boolean(authUser);

    const rawServices = await prisma.service.findMany({
        orderBy: [
            { category: "asc" },
            { price: "desc" },
        ],
    });

    const services: ServiceItem[] = rawServices.map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category as ServiceItem["category"],
        description: service.description,
        price: Number(service.price),
        duration: service.duration,
        imageUrl: service.imageUrl,
    }));

    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
            <main className="pt-8 sm:pt-10 md:pt-12 pb-20 px-6 md:px-8 max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/10 pb-8">
                    <div className="max-w-2xl">
                        <span className="font-label text-xs tracking-[0.25em] uppercase text-primary mb-3 block font-bold">
                            EKSPERCKA PIELĘGNACJA
                        </span>
                        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-on-surface leading-[0.95]">
                            KATALOG <span className="text-primary">USŁUG</span>
                        </h1>
                    </div>
                    <div className="max-w-md md:text-right">
                        <p className="font-body text-base text-on-surface-variant leading-relaxed">
                            Rzemieślnicza precyzja dla współczesnego dżentelmena. Każda usługa to rytuał łączący klasyczną szkołę z nowoczesną techniką.
                        </p>
                    </div>
                </header>

                <ServicesView services={services} isLoggedIn={isLoggedIn} />
            </main>

            <Newsletter />
        </div>
    );
}