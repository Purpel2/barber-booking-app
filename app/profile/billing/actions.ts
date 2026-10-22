"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action przełączający aktywną subskrypcję użytkownika na inny plan członkowski.
 * @param newPlanId - Identyfikator nowego planu członkowskiego, na który użytkownik chce się przełączyć.
 * @returns Obiekt zawierający informacje o powodzeniu operacji oraz komunikat dla użytkownika.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wybrany plan nie istnieje.
 */
export async function switchSubscriptionPlan(newPlanId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany, aby zmienić pakiet." };
        }

        const targetPlan = await prisma.membershipPlan.findUnique({
            where: { id: newPlanId, isActive: true },
        });

        if (!targetPlan) {
            return { success: false, message: "Wybrany pakiet członkowski nie istnieje." };
        }

        await prisma.userSubscription.updateMany({
            where: {
                userId: authUser.id,
                status: "ACTIVE",
            },
            data: {
                status: "CANCELED",
            },
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.userSubscription.create({
            data: {
                userId: authUser.id,
                planId: targetPlan.id,
                status: "ACTIVE",
                paymentMethod: "ONLINE",
                expiresAt,
            },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/billing");
        revalidatePath("/membership");

        return {
            success: true,
            message: `Pomyślnie zmieniono pakiet członkowski na "${targetPlan.name}".`,
        };
    } catch (err: unknown) {
        console.error("Błąd switchSubscriptionPlan:", err);
        return { success: false, message: "Wystąpił błąd podczas zmiany planu subskrypcji." };
    }
}

/**
 * Server Action przełączający status subskrypcji użytkownika między wstrzymaną a aktywną.
 * @param subscriptionId - Identyfikator subskrypcji użytkownika, której status ma zostać zmieniony.
 * @returns Obiekt zawierający informacje o powodzeniu operacji, nowy status subskrypcji oraz komunikat dla użytkownika.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub subskrypcja nie istnieje.
 */
export async function togglePauseSubscription(subscriptionId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const subscription = await prisma.userSubscription.findFirst({
            where: {
                id: subscriptionId,
                userId: authUser.id,
            },
        });

        if (!subscription) {
            return { success: false, message: "Nie znaleziono subskrypcji." };
        }

        const nextStatus = subscription.status === "PAUSED" ? "ACTIVE" : "PAUSED";

        await prisma.userSubscription.update({
            where: { id: subscription.id },
            data: { status: nextStatus },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/billing");

        return {
            success: true,
            status: nextStatus,
            message:
                nextStatus === "PAUSED"
                    ? "Subskrypcja została wstrzymana."
                    : "Subskrypcja została wznowiona.",
        };
    } catch (err: unknown) {
        console.error("Błąd togglePauseSubscription:", err);
        return { success: false, message: "Wystąpił błąd podczas aktualizacji statusu subskrypcji." };
    }
}

/**
 * Server Action anulujący aktywną subskrypcję użytkownika.
 * @param subscriptionId - Identyfikator subskrypcji użytkownika, która ma zostać anulowana.
 * @returns Obiekt zawierający informacje o powodzeniu operacji oraz komunikat dla użytkownika.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub subskrypcja nie istnieje.
 */
export async function cancelSubscription(subscriptionId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const subscription = await prisma.userSubscription.findFirst({
            where: {
                id: subscriptionId,
                userId: authUser.id,
            },
        });

        if (!subscription) {
            return { success: false, message: "Nie znaleziono subskrypcji." };
        }

        await prisma.userSubscription.update({
            where: { id: subscription.id },
            data: { status: "CANCELED" },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/billing");

        return {
            success: true,
            message: "Automatyczne odnawianie zostało wyłączone. Karnet i przywileje VIP pozostają aktywne do końca okresu.",
        };
    } catch (err: unknown) {
        console.error("Błąd cancelSubscription:", err);
        return { success: false, message: "Wystąpił błąd podczas anulowania subskrypcji." };
    }
}

/**
 * Server Action przywracający aktywne odnawianie subskrypcji użytkownika.
 * @param subscriptionId - Identyfikator subskrypcji użytkownika, która ma zostać przywrócona.
 * @returns Obiekt zawierający informacje o powodzeniu operacji oraz komunikat dla użytkownika.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub subskrypcja nie istnieje.
 */
export async function reactivateSubscription(subscriptionId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const subscription = await prisma.userSubscription.findFirst({
            where: {
                id: subscriptionId,
                userId: authUser.id,
            },
        });

        if (!subscription) {
            return { success: false, message: "Nie znaleziono subskrypcji." };
        }

        await prisma.userSubscription.update({
            where: { id: subscription.id },
            data: { status: "ACTIVE" },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/billing");

        return {
            success: true,
            message: "Automatyczne odnawianie karnetu zostało włączone.",
        };
    } catch (err: unknown) {
        console.error("Błąd reactivateSubscription:", err);
        return { success: false, message: "Wystąpił błąd podczas włączania odnawiania." };
    }
}

/**
 * Server Action umożliwiający ręczne odnowienie subskrypcji użytkownika na kolejny okres.
 * @param subscriptionId - Identyfikator subskrypcji użytkownika, która ma zostać odnowiona.
 * @returns Obiekt zawierający informacje o powodzeniu operacji oraz komunikat dla użytkownika.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub subskrypcja nie istnieje.
 */
export async function renewSubscriptionManually(subscriptionId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return { success: false, message: "Musisz być zalogowany." };
        }

        const subscription = await prisma.userSubscription.findFirst({
            where: {
                id: subscriptionId,
                userId: authUser.id,
            },
            include: { plan: true },
        });

        if (!subscription) {
            return { success: false, message: "Nie znaleziono subskrypcji." };
        }

        const baseDate = new Date(subscription.expiresAt) > new Date()
            ? new Date(subscription.expiresAt)
            : new Date();
        const newExpiresAt = new Date(baseDate);
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        await prisma.userSubscription.update({
            where: { id: subscription.id },
            data: {
                expiresAt: newExpiresAt,
            },
        });

        revalidatePath("/profile");
        revalidatePath("/profile/billing");

        const formattedDate = newExpiresAt.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        return {
            success: true,
            message: `Pomyślnie opłacono karnet na kolejny miesiąc. Nowy termin ważności: ${formattedDate}.`,
        };
    } catch (err: unknown) {
        console.error("Błąd renewSubscriptionManually:", err);
        return { success: false, message: "Wystąpił błąd podczas opłacania subskrypcji." };
    }
}
