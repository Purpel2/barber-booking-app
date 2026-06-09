import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1c1b1b] text-white p-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-[0.2em] text-[#e9c176] mb-2">
          jeszcze bez nazwy
        </h1>
        <p className="text-zinc-400 text-sm tracking-wider">
          System Rezerwacji Barber Booking – Prace Deweloperskie
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-12">
        <Link
          href="/login"
          className="flex-1 text-center px-6 py-4 bg-[#e9c176] text-black font-headline font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-[#e9c176]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#e9c176]/10"
        >
          Zaloguj się
        </Link>
        <Link
          href="/register"
          className="flex-1 text-center px-6 py-4 bg-zinc-800 text-[#e9c176] border border-[#e9c176]/20 font-headline font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-zinc-700 transition-all active:scale-[0.98]"
        >
          Utwórz konto
        </Link>
      </div>

      <div className="w-full max-w-md pt-8 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">
          Narzędzia diagnostyczne
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/test_polaczenia_z_baza"
            className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 text-xs rounded border border-zinc-800/60 transition-colors"
          >
            Sprawdź połączenie z bazą (Prisma Status)
          </Link>
        </div>
      </div>
    </main>
  );
}