"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "../actions";

/**
 * Komponent CancelButton renderuje przycisk umożliwiający użytkownikowi odwołanie wizyty (rezerwacji).
 * Po kliknięciu przycisku wyświetla się okno potwierdzenia. Jeśli użytkownik potwierdzi, wywoływana jest funkcja cancelReservation.
 * W trakcie przetwarzania anulowania wizyty przycisk jest nieaktywny i wyświetla komunikat "Odwoływanie...".
 */
export default function CancelButton({ reservationId }: { reservationId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCancel = () => {
        if (!confirm("Czy na pewno chcesz odwołać tę wizytę?")) return;
        startTransition(async () => {
            const res = await cancelReservation(reservationId);
            if (!res.success) {
                alert(res.message || "Wystąpił błąd podczas odwoływania wizyty.");
            } else {
                router.refresh();
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="px-3.5 py-1.5 bg-[#3a1d1d] hover:bg-[#522222] text-[#ffb4ab] border border-[#7a2b2b] rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
        >
            {isPending ? "Odwoływanie..." : "Odwołaj wizytę"}
        </button>
    );
}