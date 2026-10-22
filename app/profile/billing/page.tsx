import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BillingClient, {
    BillingPlan,
    BillingSubscription,
    BillingInvoice,
} from "./_components/BillingClient";

export const dynamic = "force-dynamic";

/**
 * Funkcja SubscriptionBillingPage renderuje stronę rozliczeń i subskrypcji w profilu użytkownika. Sprawdza, czy użytkownik jest zalogowany, pobiera dane subskrypcji, dostępne plany oraz historię faktur z bazy danych i przekazuje je do komponentu BillingClient.
 * @returns Zwraca element JSX reprezentujący stronę rozliczeń i subskrypcji w profilu użytkownika.
 * @throws Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania.
 */
export default async function SubscriptionBillingPage() {
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/login?redirect=/profile/billing");
    }

    const [dbUser, activeSubscription, allSubscriptions, reservations, rawPlans] = await Promise.all([
        prisma.user.findUnique({
            where: { id: authUser.id },
            select: { id: true, fullName: true, email: true, createdAt: true },
        }),
        prisma.userSubscription.findFirst({
            where: {
                userId: authUser.id,
                status: { in: ["ACTIVE", "PAUSED", "CANCELED"] },
                expiresAt: { gt: new Date() },
            },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.userSubscription.findMany({
            where: { userId: authUser.id },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.reservation.findMany({
            where: { userId: authUser.id },
            include: {
                services: {
                    include: { service: true },
                },
            },
            orderBy: { startTime: "desc" },
        }),
        prisma.membershipPlan.findMany({
            where: { isActive: true },
            orderBy: { price: "asc" },
        }),
    ]);

    const availablePlans: BillingPlan[] = rawPlans.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        interval: p.interval,
        features: p.features,
        isPopular: p.isPopular,
    }));

    const formattedActiveSub: BillingSubscription | null = activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            expiresAt: activeSubscription.expiresAt.toISOString(),
            paymentMethod: activeSubscription.paymentMethod,
            createdAt: activeSubscription.createdAt.toISOString(),
            plan: {
                id: activeSubscription.plan.id,
                name: activeSubscription.plan.name,
                price: activeSubscription.plan.price,
                interval: activeSubscription.plan.interval,
                features: activeSubscription.plan.features,
                isPopular: activeSubscription.plan.isPopular,
            },
        }
        : null;

    const subscriptionInvoices: BillingInvoice[] = allSubscriptions.map((sub, idx) => ({
        id: `FV-SUB-${new Date(sub.createdAt).getFullYear()}-${String(allSubscriptions.length - idx).padStart(3, "0")}`,
        date: new Date(sub.createdAt).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        description: `Karnet Fresh Cut VIP — Plan ${sub.plan.name}`,
        amount: `${sub.plan.price},00 PLN`,
        amountNumber: sub.plan.price,
        status: "Opłacono",
        paymentMethod: sub.paymentMethod === "ONLINE" ? "Karta online (Stripe)" : "W salonie",
        type: "SUBSCRIPTION",
    }));

    const appointmentInvoices: BillingInvoice[] = reservations
        .filter((r) => r.status === "CONFIRMED" || r.paymentStatus === "PAID")
        .map((r, idx) => ({
            id: `FV-VIS-${new Date(r.startTime).getFullYear()}-${String(reservations.length - idx).padStart(3, "0")}`,
            date: new Date(r.startTime).toLocaleDateString("pl-PL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
            description: `Wizyta: ${r.services.map((s) => s.service.name).join(" + ") || "Usługa fryzjerska"}`,
            amount: `${Number(r.totalPrice).toFixed(2).replace(".", ",")} PLN`,
            amountNumber: Number(r.totalPrice),
            status: "Opłacono",
            paymentMethod: r.paymentMethod === "ONLINE" ? "Płatność online (P24)" : "Płatność na miejscu",
            type: "APPOINTMENT",
        }));

    const invoices: BillingInvoice[] = [...subscriptionInvoices, ...appointmentInvoices];

    return (
        <BillingClient
            user={{
                id: authUser.id,
                fullName: dbUser?.fullName || "Klient Salonu",
                email: dbUser?.email || authUser.email || "",
                createdAt: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
            }}
            activeSubscription={formattedActiveSub}
            availablePlans={availablePlans}
            invoices={invoices}
        />
    );
}
