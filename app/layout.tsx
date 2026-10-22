import type { Metadata } from "next";
import { Inter, Epilogue } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavBar from "./components/NavBar";
import Footer from "./components/footer";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Fresh Cut | The Modern Barber Experience",
  description: "Nowoczesny i ekskluzywny salon barberski.",
};


/**
 * RootLayout jest głównym komponentem układu aplikacji, który renderuje strukturę HTML strony, w tym pasek nawigacji, główną zawartość oraz stopkę.
 * Pobiera dane użytkownika z Supabase i Prisma, w tym informacje o zalogowanym użytkowniku oraz liczbę nieprzeczytanych powiadomień.
 * @param children - Zawartość strony, która zostanie wyrenderowana w głównym obszarze układu.
 * @returns Zwraca element JSX reprezentujący główny układ aplikacji.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let databaseUser = null;
  let unreadNotificationsCount = 0;
  if (authUser) {
    [databaseUser, unreadNotificationsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: authUser.id },
      }),
      prisma.notification.count({
        where: { userId: authUser.id, isRead: false },
      }),
    ]);
  }

  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${inter.variable} ${epilogue.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* kontenrer dla wyskakujacych powiadomien */}
        <Toaster position="top-center" reverseOrder={false} />
        {/* pasek nawigacji  */}
        <NavBar user={databaseUser} unreadNotificationsCount={unreadNotificationsCount} />
        <main className="grow">
          {children}
        </main>
        {/* stopka */}
        <Footer />
      </body>
    </html>
  );
}