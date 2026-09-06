"use client";

import { useTransition } from "react";
import { cancelReservation } from "./actions";

export default function CancelButton({ reservationId }: { reservationId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleCancel = () => {
        if (!confirm("Czy na pewno chcesz odwołać tę wizytę?")) return;
        startTransition(async () => {
            const res = await cancelReservation(reservationId);
            if (!res.success) alert(res.message);
        });
    };

    return (
        <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="px-3.5 py-1.5 bg-[#3a1d1d] hover:bg-[#522222] text-[#ffb4ab] border border-[#7a2b2b] rounded text-[10px] font-extrabold uppercase tracking-widest transition-all disabled:opacity-50"
        >
            {isPending ? "Odwoływanie..." : "Odwołaj wizytę"}
        </button>
    );
}