"use client";

import Link from "next/link";
import { motion } from "motion/react";

export interface MembershipPlanItem {
    id: string;
    name: string;
    price: number;
    interval: string;
    isPopular: boolean;
    features: string[];
}

interface MembershipPlansProps {
    plans: MembershipPlanItem[];
    isLoggedIn: boolean;
}

/**
 * Komponent MembershipPlans renderuje listę dostępnych planów członkowskich w formie siatki kart. Każda karta zawiera nazwę planu, cenę, okres subskrypcji, listę funkcji oraz przycisk do przejścia do strony zakupu lub logowania. Popularny plan jest wyróżniony wizualnie.
 * @param plans - Lista obiektów planów członkowskich do wyświetlenia.
 * @param isLoggedIn - Flaga określająca, czy użytkownik jest zalogowany.
 * @returns Element JSX renderujący siatkę kart planów członkowskich.
 */
export default function MembershipPlans({ plans, isLoggedIn }: MembershipPlansProps) {
    const getCheckoutUrl = (planName: string) => {
        const query = planName.toLowerCase();
        return isLoggedIn
            ? `/membership/checkout?plan=${query}`
            : `/login?redirect=/membership/checkout?plan=${query}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan, index) => {
                const isPopular = plan.isPopular;

                return (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                            duration: 0.55,
                            delay: index * 0.12,
                            ease: [0.21, 0.47, 0.32, 0.98],
                        }}
                        className={`p-8 md:p-10 rounded-2xl relative group flex flex-col justify-between h-full transition-all duration-300 border ${isPopular
                                ? "bg-surface-container-high border-2 border-primary shadow-[0_20px_50px_rgba(233,193,118,0.1)] lg:scale-105 z-10"
                                : "bg-surface-container-low hover:bg-surface-container-high border-outline-variant/10"
                            }`}
                    >
                        {isPopular && (
                            <>
                                <div className="absolute -inset-0.5 rounded-2xl overflow-hidden pointer-events-none z-10">
                                    <div className="absolute top-0 bottom-0 left-0 w-3/4 -translate-x-full animate-card-shimmer shimmer-flare" />
                                </div>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1.5 font-bold text-xs uppercase tracking-widest whitespace-nowrap shadow-lg z-20">
                                    Najczęściej Wybierany
                                </div>
                            </>
                        )}

                        <div>
                            <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">
                                {plan.name}
                            </h3>
                            <p
                                className={`text-5xl font-black mb-6 ${isPopular ? "text-primary" : "text-primary text-4xl"
                                    }`}
                            >
                                {plan.price} PLN{" "}
                                <span className="text-sm text-on-surface-variant font-normal tracking-normal uppercase">
                                    / {plan.interval}
                                </span>
                            </p>
                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 group/feature transition-colors"
                                    >
                                        <span className="text-primary font-bold inline-block transform-gpu group-hover/feature:scale-125 transition-transform duration-200 select-none">
                                            ✓
                                        </span>
                                        <span
                                            className={`text-base transition-colors ${isPopular || idx < 2
                                                    ? "text-on-surface group-hover/feature:text-primary"
                                                    : "text-on-surface-variant group-hover/feature:text-on-surface"
                                                }`}
                                        >
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href={getCheckoutUrl(plan.name)}
                            className={`block text-center cursor-pointer w-full py-4 font-bold uppercase tracking-widest transition-all active:scale-95 ${isPopular
                                    ? "bg-primary text-on-primary hover:bg-primary/90 shadow-[0_10px_20px_rgba(233,193,118,0.2)]"
                                    : "bg-transparent border-2 border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                                }`}
                        >
                            Wybierz {plan.name}
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
