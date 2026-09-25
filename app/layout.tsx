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
 * RootLayout jest głównym komponentem układu aplikacji, który renderuje strukturę HTML dla wszystkich stron.
 * Zawiera pasek nawigacji, główną sekcję treści oraz stopkę. Dodatkowo obsługuje autoryzację użytkownika przy użyciu Supabase.
 * Jeśli użytkownik jest zalogowany, pobiera jego dane z bazy danych przy użyciu Prisma i przekazuje je do komponentu NavBar.
 * W przypadku braku zalogowanego użytkownika, NavBar renderuje odpowiednie elementy dla niezalogowanych użytkowników.
 * Komponent korzysta z czcionek Inter i Epilogue z Google Fonts oraz zapewnia responsywność i dostępność.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let databaseUser = null;
  if (authUser) {
    databaseUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
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
        <NavBar user={databaseUser} />
        <main className="grow">
          {children}
        </main>
        {/* stopka */}
        <Footer />
      </body>
    </html>
  );
}