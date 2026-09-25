"use client";

import { useState, useTransition } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { submitReviewAction } from "@/app/profile/appointments/actions";

interface ReviewModalProps {
    reservationId: string;
    serviceNames: string;
    barberName: string;
    onClose: () => void;
    onSuccess: (reservationId: string) => void;
}

/**
 *  Komponent ReviewModal renderuje modalne okno umożliwiające użytkownikowi wystawienie opinii o wizycie w salonie.
 *  Użytkownik może wybrać ocenę w skali od 1 do 5 gwiazdek oraz opcjonalnie dodać komentarz.
 *  Po wysłaniu opinii, komponent wywołuje funkcję onSuccess, aby zaktualizować stan wizyty w liście rezerwacji.
 *  W przypadku błędów podczas wysyłania opinii, wyświetlany jest komunikat o błędzie.
 */
export default function ReviewModal({
    reservationId,
    serviceNames,
    barberName,
    onClose,
    onSuccess,
}: ReviewModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const currentDisplayRating = hoverRating || rating;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setErrorMessage("Wybierz ocenę od 1 do 5 gwiazdek.");
            return;
        }
        setErrorMessage(null);

        startTransition(async () => {
            const res = await submitReviewAction({
                reservationId,
                rating,
                comment,
            });

            if (res.success) {
                onSuccess(reservationId);
                onClose();
            } else {
                setErrorMessage(res.error || "Wystąpił błąd podczas zapisu opinii.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#1c1b1b] border border-surface-container-high rounded-2xl p-6 shadow-2xl space-y-5 text-on-surface">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div>
                    <h2 className="text-xl font-black text-on-surface tracking-tight">
                        Jak oceniasz wizytę w salonie?
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1">
                        {serviceNames} • <span className="text-on-surface font-medium">Realizacja: {barberName}</span>
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 text-xs bg-red-950/40 border border-red-900/60 text-red-400 rounded-xl">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-3 space-y-2 select-none">
                        <div
                            className="flex items-center gap-2"
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = currentDisplayRating >= star;
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => {
                                            if (hoverRating !== star) setHoverRating(star);
                                        }}
                                        onClick={() => setRating(star)}
                                        className="p-1 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors duration-150 ${isFilled
                                                ? "fill-primary text-primary"
                                                : "text-zinc-700"
                                                }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        <span className="text-[11px] font-bold tracking-wider uppercase h-4 text-on-surface-variant">
                            {currentDisplayRating === 5 && "Wspaniale"}
                            {currentDisplayRating === 4 && "Dobrze"}
                            {currentDisplayRating === 3 && "W porządku"}
                            {currentDisplayRating === 2 && "Mogło być lepiej"}
                            {currentDisplayRating === 1 && "Niezadowolony"}
                            {currentDisplayRating === 0 && "Kliknij gwiazdkę, aby ocenić"}
                        </span>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5">
                            Twój komentarz (opcjonalnie)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Napisz kilka słów o precyzji strzyżenia, atmosferze..."
                            rows={3}
                            maxLength={500}
                            className="w-full bg-[#262525] border border-surface-container-high rounded-xl p-3 text-xs text-on-surface placeholder:text-zinc-500 focus:outline-none focus:border-primary resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-background text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Wystaw opinię</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}