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

//glowny layout aplikacji, zawiera NavBar i Toaster, sprawdza czy uzytkownik jest zalogowany i pobiera jego dane z bazy danych, zeby przekazac je do NavBar
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let databaseUser = null;
  if (authUser) { //jesli uzytkownik jest zalogowany, pobieramy jego dane z bazy danych
    databaseUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
  }

  return (
    <html
      lang="pl"
      className={`${inter.variable} ${epilogue.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
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