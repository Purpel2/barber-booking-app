import Newsletter from '../components/newsletter';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import MembershipPlans from './MembershipPlans';

export const revalidate = 86400;

/**
 * Strona z planami subskrypcji.
 * Wyświetla dostępne plany subskrypcji i umożliwia wybór jednego z nich.
 * Pobiera dane o planach z bazy danych przy użyciu Prisma i renderuje je w responsywnym układzie.
 * Jeśli użytkownik jest zalogowany, kliknięcie przycisku "Wybierz" przekierowuje go do strony checkout z odpowiednim planem.
 * Jeśli użytkownik nie jest zalogowany, kliknięcie przycisku "Wybierz" przekierowuje go do strony logowania z parametrem redirect do checkout.
 * @returns Strona z planami subskrypcji.
 */
export default async function MembershipPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const plans = await prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="bg-background text-on-surface font-body min-h-screen w-full overflow-x-hidden selection:bg-primary selection:text-on-primary">

            <section className="pt-8 sm:pt-10 md:pt-12 pb-14 px-8 lg:px-20 max-w-350 mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">

                    <div>
                        <span className="font-label text-xs sm:text-sm uppercase tracking-widest text-primary mb-2 block font-bold">
                            Subskrypcja
                        </span>
                        <h1 className="font-headline text-4xl sm:text-5xl md:text-[80px] font-black uppercase tracking-tighter leading-[0.85] text-on-surface">
                            SALON<br /> <span className="text-primary">FRESH CUT</span>
                        </h1>
                    </div>

                    <div className="max-w-md lg:pb-2">
                        <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                            Kto wpada regularnie, ten zgarnia więcej. Wybierasz plan, płacisz raz w miesiącu i zapominasz o portfelu. Zawsze świeży look, bez stresu o terminy.
                        </p>
                    </div>

                </div>
            </section>

            <section className="px-8 lg:px-20 max-w-350 mx-auto mb-12">
                <MembershipPlans plans={plans} isLoggedIn={!!user} />
            </section>

            <section className="px-8 lg:px-20 max-w-350 mx-auto py-24 border-t border-outline-variant/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    <div className="order-2 lg:order-1">
                        <h2 className="font-headline text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
                            PO CO CI<br />
                            <span className="text-primary">CZŁONKOSTWO?</span>
                        </h2>
                        <p className="font-body text-on-surface-variant text-lg mb-12 max-w-lg leading-relaxed">
                            Bycie w klubie to nie tylko regularne cięcie. To oszczędność kasy, brak stresu o wolne terminy przed weekendem i stały dostęp do najlepszych kosmetyków na Twojej półce po stawkach hurtowych.
                        </p>

                        <div className="flex flex-col gap-10">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-full border border-primary/30 flex items-center justify-center text-primary font-black text-2xl">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-bold text-2xl uppercase tracking-tight mb-2">Świeżość Non-Stop</h4>
                                    <p className="text-base text-on-surface-variant leading-relaxed">Zapomnij o zarastaniu pod koniec miesiąca. Dzięki szybkim poprawkom (line-up karku i boków) w połowie cyklu, Twój kontur jest zawsze ostry. Wpadasz na kwadrans i wracasz do gry.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-full border border-primary/30 flex items-center justify-center text-primary font-black text-2xl">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-bold text-2xl uppercase tracking-tight mb-2">Czysta Kalkulacja</h4>
                                    <p className="text-base text-on-surface-variant leading-relaxed">Subskrypcja to po prostu oszczędność. Płacisz zauważalnie mniej niż za pojedyncze wizyty, zgarniasz zniżki na kosmetyki, a po cięciu po prostu wstajesz i wychodzisz. Zero wyciągania portfela przy kasie.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 grid grid-cols-2 gap-6">
                        <div className="relative aspect-4/5 bg-surface-container-highest rounded-xl overflow-hidden mt-12 shadow-2xl">
                            <Image
                                fill
                                sizes="(max-width: 768px) 50vw, 30vw"
                                className="object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500"
                                src="/images/membership/membership1.webp"
                                alt="Kosmetyki barberskie na półce"
                            />
                        </div>
                        <div className="relative aspect-4/5 bg-surface-container-highest rounded-xl overflow-hidden shadow-2xl">
                            <Image
                                fill
                                sizes="(max-width: 768px) 50vw, 30vw"
                                className="object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-500"
                                src="/images/membership/membership2.webp"
                                alt="Detal strzyżenia i wykończenia"
                            />
                        </div>
                    </div>

                </div>
            </section>

            <Newsletter />
        </div>
    );
}
