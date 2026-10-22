"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action pobierający powiadomienia użytkownika z bazy danych.
 * Jeśli użytkownik nie ma żadnych powiadomień, tworzy przykładowe powiadomienia testowe.
 * @returns Obiekt zawierający listę powiadomień użytkownika oraz liczbę nieprzeczytanych powiadomień.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z pobraniem danych z bazy.
 */
export async function getUserNotifications() {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return { notifications: [], unreadCount: 0 };
        }

        const count = await prisma.notification.count({
            where: { userId: authUser.id },
        });

        if (count === 0) {
            await prisma.notification.createMany({
                data: [
                    {
                        userId: authUser.id,
                        title: "Event Tygodniowy: -10% na karnety VIP (testowe)",
                        message: "Przez najbliższy tydzień wszystkie pakiety subskrypcyjne Fresh Cut są tańsze o 10%! Skorzystaj z nielimitowanych strzyżeń w promocyjnej cenie.",
                        type: "PROMOTION",
                        linkUrl: "/membership",
                        isRead: false,
                        createdAt: new Date(Date.now() - 1000 * 60 * 30),
                    },
                    {
                        userId: authUser.id,
                        title: "Przypomnienie o wizycie (testowe)",
                        message: "Twoja najbliższa rezerwacja w salonie Fresh Cut zbliża się. Pamiętaj, aby przybyć 5 minut przed wyznaczonym czasem.",
                        type: "APPOINTMENT",
                        linkUrl: "/profile/appointments",
                        isRead: false,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
                    },
                    {
                        userId: authUser.id,
                        title: "Ważność subskrypcji (testowe)",
                        message: "Jeśli nie masz włączonego automatycznego odnawiania, pamiętaj o opłaceniu karnetu pod koniec okresu rozliczeniowego, aby zachować ciągłość przywilejów.",
                        type: "SUBSCRIPTION",
                        linkUrl: "/profile/billing",
                        isRead: true,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
                    },
                    {
                        userId: authUser.id,
                        title: "Nowy barber w zespole Fresh Cut (testowe)",
                        message: "Do naszego zespołu dołączył Piotr – specjalista od strzyżenia męskiego fade oraz tradycyjnego golenia brzytwą. Sprawdź profil i wolne terminy.",
                        type: "ANNOUNCEMENT",
                        linkUrl: "/barbers",
                        isRead: true,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
                    },
                    {
                        userId: authUser.id,
                        title: "Zasady anulowania rezerwacji (testowe)",
                        message: "Przypominamy, że bezpłatnej anulacji lub przełożenia terminu wizyty można dokonać najpóźniej do 2 godzin przed planowanym rozpoczęciem.",
                        type: "CANCELLATION",
                        linkUrl: "/profile/appointments",
                        isRead: true,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
                    },
                ],
            });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: authUser.id },
            orderBy: { createdAt: "desc" },
        });

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        return { notifications, unreadCount };
    } catch (err: unknown) {
        console.error("Błąd getUserNotifications:", err);
        return { notifications: [], unreadCount: 0 };
    }
}

/**
 * Server Action oznaczający pojedyncze powiadomienie jako przeczytane w bazie danych.
 * @param id - Identyfikator powiadomienia, które ma zostać oznaczone jako przeczytane.
 * @returns Obiekt zawierający informację o powodzeniu operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub powiadomienie nie istnieje.
 */
export async function markNotificationAsRead(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return { success: false };

        await prisma.notification.updateMany({
            where: { id, userId: authUser.id },
            data: { isRead: true },
        });

        revalidatePath("/profile/notifications");
        revalidatePath("/", "layout");
        return { success: true };
    } catch {
        return { success: false };
    }
}

/**
 * Server Action oznaczający wszystkie powiadomienia użytkownika jako przeczytane w bazie danych.
 * @returns Obiekt zawierający informację o powodzeniu operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z aktualizacją danych w bazie.
 */
export async function markAllNotificationsAsRead() {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return { success: false };

        await prisma.notification.updateMany({
            where: { userId: authUser.id, isRead: false },
            data: { isRead: true },
        });

        revalidatePath("/profile/notifications");
        revalidatePath("/", "layout");
        return { success: true };
    } catch {
        return { success: false };
    }
}

/**
 * Server Action usuwający pojedyncze powiadomienie użytkownika z bazy danych.
 * @param id - Identyfikator powiadomienia, które ma zostać usunięte.
 * @returns Obiekt zawierający informację o powodzeniu operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub powiadomienie nie istnieje.
 */
export async function deleteNotification(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return { success: false };

        await prisma.notification.deleteMany({
            where: { id, userId: authUser.id },
        });

        revalidatePath("/profile/notifications");
        revalidatePath("/", "layout");
        return { success: true };
    } catch {
        return { success: false };
    }
}

/**
 * Server Action usuwający wszystkie powiadomienia użytkownika z bazy danych.
 * @returns Obiekt zawierający informację o powodzeniu operacji.
 * @throws Błąd, jeśli użytkownik nie jest zalogowany lub wystąpi problem z usunięciem danych w bazie.
 */
export async function clearAllNotifications() {
    try {
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return { success: false };

        await prisma.notification.deleteMany({
            where: { userId: authUser.id },
        });

        revalidatePath("/profile/notifications");
        revalidatePath("/", "layout");
        return { success: true };
    } catch {
        return { success: false };
    }
}
