"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "../actions";
import { XCircle, Loader2 } from "lucide-react";

interface CancelButtonProps {
    reservationId: string;
}

/**
 * Komponent CancelButton umożliwia użytkownikowi odwołanie wizyty.
 * Reaguje wyłącznie na hover bezpośrednio na przycisk (a nie na cały kafelek wizyty).
 * Posiada czytelną ikonę anulowania (XCircle) oraz potwierdzenie inline.
 * @param reservationId - Identyfikator rezerwacji, którą użytkownik chce odwołać.
 * @returns - Komponent przycisku odwołania wizyty.
 */
export default function CancelButton({ reservationId }: CancelButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleConfirmCancel = () => {
        setErrorMessage(null);
        startTransition(async () => {
            const res = await cancelReservation(reservationId);
            if (!res.success) {
                setErrorMessage(res.message || "Wystąpił błąd podczas odwoływania.");
                setIsConfirming(false);
            } else {
                setIsConfirming(false);
                router.refresh();
            }
        });
    };

    if (isConfirming) {
        return (
            <div className="inline-flex items-center gap-2 flex-wrap">
                <span className="text-xs text-on-surface-variant font-medium">
                    Na pewno odwołać wizytę?
                </span>
                <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-900/50 text-red-200 border border-red-700/80 hover:bg-red-800/60 transition-all cursor-pointer disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Odwoływanie...</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-red-200" />
                            <span>Tak, odwołaj</span>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsConfirming(false);
                        setErrorMessage(null);
                    }}
                    disabled={isPending}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
                >
                    Wróć
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <button
                type="button"
                onClick={() => setIsConfirming(true)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-700/60 transition-all cursor-pointer disabled:opacity-50 [&:hover>svg]:scale-110"
            >
                <XCircle className="w-4 h-4 text-red-400 transition-transform" />
                <span>Odwołaj wizytę</span>
            </button>
            {errorMessage && (
                <span className="text-[11px] text-red-400 font-medium">
                    {errorMessage}
                </span>
            )}
        </div>
    );
}
