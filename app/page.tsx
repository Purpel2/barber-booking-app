import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Barber Booking App - jeszcze nic tu nie ma</h1>
      <Link
        href="/test_polaczenia_z_baza"
        className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-zinc-200 transition-all active:scale-95"
      >
        Sprawdź połączenie z bazą
      </Link>
      <Link
        href="/test_auth"
        className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-zinc-200 transition-all active:scale-95"
      >
        Sprawdź rejestracje
      </Link>
    </main>
  );
}