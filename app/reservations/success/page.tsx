import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface PageProps {
    searchParams: Promise<{ id?: string }>;
}

export default async function ReservationSuccessPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const id = searchParams?.id;

    if (!id) {
        return (
            <main className="min-h-screen bg-background text-on-surface flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Nie znaleziono identyfikatora rezerwacji.</h1>
                    <Link href="/reservations" className="text-primary underline text-sm">
                        Wróć do wyboru terminu
                    </Link>
                </div>
            </main>
        );
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
            barber: {
                select: {
                    name: true,
                    imageUrl: true,
                    role: true,
                },
            },
            services: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    duration: true,
                },
            },
        },
    });

    if (!reservation) {
        return (
            <main className="min-h-screen bg-background text-on-surface flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Rezerwacja nie istnieje w systemie.</h1>
                    <p className="text-sm text-on-surface-variant/70 mb-4">ID: {id}</p>
                    <Link href="/reservations" className="text-primary underline text-sm">
                        Wróć do kalendarza
                    </Link>
                </div>
            </main>
        );
    }

    const totalPrice = reservation.services.reduce((acc, s) => acc + s.price, 0);
    const totalDuration = reservation.services.reduce((acc, s) => acc + s.duration, 0);
    const formattedDate = format(new Date(reservation.startTime), "EEEE, d MMMM yyyy", { locale: pl });
    const formattedTime = format(new Date(reservation.startTime), "HH:mm");
    const isOnlinePayment = reservation.paymentMethod === "ONLINE";

    return (
        <main className="min-h-screen bg-background text-on-surface flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-xl bg-surface-container-high/40 border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary text-lg font-bold">
                        ✓
                    </div>
                    <div>
                        <span className="text-[11px] font-['Inter'] uppercase tracking-widest text-primary font-semibold block">
                            Potwierdzenie wizyty
                        </span>
                        <h1 className="text-2xl font-['Epilogue'] font-extrabold text-on-surface">
                            Termin zarezerwowany
                        </h1>
                    </div>
                </div>

                <div className="bg-background/80 border border-surface-container-highest/60 rounded-2xl p-5 mb-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-surface-container-highest/50 pb-4">
                        <div>
                            <span className="text-xs text-on-surface-variant/70 block">Data i godzina</span>
                            <p className="text-base font-bold text-on-surface capitalize">{formattedDate}</p>
                            <p className="text-sm font-semibold text-primary">Godzina {formattedTime} ({totalDuration} min)</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-on-surface-variant/70 block">Płatność</span>
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 bg-primary/10 text-primary border border-primary/20">
                                {isOnlinePayment ? "Opłacono online" : "Płatność w salonie"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-b border-surface-container-highest/50 pb-4">
                        <img
                            src={reservation.barber.imageUrl}
                            alt={reservation.barber.name}
                            className="w-12 h-12 rounded-full object-cover border border-primary/40"
                        />
                        <div>
                            <span className="text-xs text-on-surface-variant/70 block">Specjalista</span>
                            <p className="font-bold text-sm text-on-surface">{reservation.barber.name}</p>
                            {reservation.barber.role && (
                                <p className="text-xs text-on-surface-variant/60">{reservation.barber.role}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs text-on-surface-variant/70 block mb-2">Wybrane usługi</span>
                        <div className="space-y-2">
                            {reservation.services.map((service) => (
                                <div key={service.id} className="flex justify-between items-center text-sm">
                                    <span className="text-on-surface">{service.name}</span>
                                    <span className="font-semibold text-on-surface-variant">{service.price} zł</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-surface-container-highest/50 pt-3 flex justify-between items-center">
                        <span className="font-bold text-sm text-on-surface">Razem do zapłaty</span>
                        <span className="text-xl font-extrabold text-primary">{totalPrice} zł</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs text-on-surface-variant/50 mb-8 px-1">
                    <span>Nr rezerwacji:</span>
                    <span className="font-mono">{reservation.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/reservations"
                        className="w-full py-3.5 px-4 rounded-xl border border-surface-container-highest text-center text-sm font-semibold text-on-surface hover:border-primary/40 hover:bg-surface-container-high transition-all"
                    >
                        Nowa rezerwacja
                    </Link>
                    <Link
                        href="/"
                        className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary text-center text-sm font-bold shadow-lg shadow-primary/15 hover:scale-[1.01] transition-all"
                    >
                        Strona główna
                    </Link>
                </div>
            </div>
        </main>
    );
}