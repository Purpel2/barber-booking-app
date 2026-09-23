import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

interface CheckoutPageProps {
    searchParams: Promise<{ plan?: string }>;
}

/**
 * Funkcja handleSubscribe obsługuje proces subskrypcji użytkownika na wybrany plan członkowski.
 * Pobiera identyfikator planu z danych formularza, sprawdza, czy użytkownik jest zalogowany przy użyciu Supabase.
 * Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
async function handleSubscribe(formData: FormData) {
    "use server";

    const planId = formData.get("planId") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        throw new Error("Wybrany plan nie istnieje.");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.userSubscription.create({
        data: {
            userId: user.id,
            planId: plan.id,
            status: "ACTIVE",
            paymentMethod: "ONLINE",
            expiresAt: expiresAt,
        }
    });

    revalidatePath("/membership");
    redirect("/membership?success=true");
}

/**
 * Strona CheckoutPage renderuje podsumowanie wybranego planu subskrypcji oraz umożliwia użytkownikowi przejście do płatności online.
 * Pobiera dane zalogowanego użytkownika przy użyciu Supabase oraz listę aktywnych planów subskrypcji z bazy danych przy użyciu Prisma.
 * Jeśli użytkownik nie jest zalogowany, zostaje przekierowany do strony logowania z parametrem redirect.
 * Jeśli wybrany plan nie istnieje, użytkownik zostaje przekierowany do strony z listą planów.
 * Po kliknięciu przycisku "Przejdź do płatności" wywoływana jest funkcja handleSubscribe, która tworzy subskrypcję w bazie danych i przekierowuje użytkownika do strony z potwierdzeniem.
 */
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
    const params = await searchParams;
    const planQuery = params.plan?.toLowerCase();

    if (!planQuery) {
        redirect("/membership");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?redirect=/membership/checkout?plan=${planQuery}`);
    }

    const plans = await prisma.membershipPlan.findMany({
        where: { isActive: true }
    });

    const selectedPlan = plans.find(p => p.name.toLowerCase().includes(planQuery)) || plans[0];

    if (!selectedPlan) {
        redirect("/membership");
    }

    return (
        <div className="bg-background text-on-surface font-body min-h-screen pt-28 pb-20 px-8 lg:px-20 max-w-4xl mx-auto">
            <div className="max-w-xl mx-auto bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 md:p-12 shadow-2xl">
                <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-2">Finalizowanie subskrypcji</span>
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight mb-6">Podsumowanie planu</h1>

                <div className="bg-surface-container-high/50 p-6 rounded-2xl border border-outline-variant/10 mb-8 space-y-4">
                    <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                        <div>
                            <h3 className="font-bold text-xl uppercase tracking-tight text-on-surface">{selectedPlan.name}</h3>
                            <p className="text-sm text-on-surface-variant">Rozliczenie {selectedPlan.interval}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-primary">{selectedPlan.price} PLN</span>
                        </div>
                    </div>

                    <ul className="space-y-2 pt-2">
                        {selectedPlan.features.map((feat, idx) => (
                            <li key={idx} className="text-xs text-on-surface-variant flex items-center gap-2">
                                <span className="text-primary font-bold">✓</span> {feat}
                            </li>
                        ))}
                    </ul>
                </div>

                <form action={handleSubscribe} className="space-y-6">
                    <input type="hidden" name="planId" value={selectedPlan.id} />

                    <div className="bg-primary/5 border border-primary/30 p-4 rounded-xl flex items-center gap-3">
                        <span className="text-xl">🔒</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">Płatność online</p>
                            <p className="text-[11px] text-on-surface-variant">Po kliknięciu aktywacji subskrypcji nastąpi przekierowanie do bramki płatności.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between gap-4">
                        <Link href="/membership" className="text-xs uppercase font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                            ← Wróć do planów
                        </Link>
                        <button type="submit" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-sm tracking-wide hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-primary/20">
                            Przejdź do płatności
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}