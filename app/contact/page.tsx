import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import ContactClient from "./ContactClient";
import Newsletter from "@/app/components/newsletter";

export const revalidate = 3600; // Cache na 1h

/**
 * Podstrona Kontakt systemu Fresh Cut Barbershop.
 * Pobiera dane zalogowanego użytkownika (jeśli istnieje), aby umożliwić
 * automatyczne uzupełnienie pól w formularzu kontaktowym.
 * @returns Element JSX renderujący podstronę kontaktową z formularzem i newsletterem.
 */
export default async function ContactPage() {
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    let initialUserData = null;
    if (authUser) {
        const dbUser = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: {
                fullName: true,
                email: true,
                phonePrefix: true,
                phoneBody: true,
            },
        });

        if (dbUser) {
            initialUserData = {
                fullName: dbUser.fullName,
                email: dbUser.email,
                phone: dbUser.phoneBody ? `${dbUser.phonePrefix || "+48"} ${dbUser.phoneBody}`.trim() : "",
            };
        }
    }

    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col justify-between">
            <main className="grow">
                <ContactClient initialUserData={initialUserData} isLoggedIn={Boolean(authUser)} />
            </main>
            <Newsletter />
        </div>
    );
}
