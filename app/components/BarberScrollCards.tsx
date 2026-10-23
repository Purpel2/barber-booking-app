"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Barber } from "@prisma/client";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface BarberScrollCardsProps {
  barbers: Barber[];
}

const emptySubscribe = () => () => {};

/**
 * Komponent prezentujący listę barberów z animacją zbliżania się kart z lewej i prawej strony podczas przewijania.
 * Karty płynnie reagują na pozycję scrolla zarówno w dół, jak i w górę.
 * @param props - Właściwości komponentu zawierające tablicę barberów pobraną z bazy danych.
 * @returns - Siatka kart barberów płynnie reagująca na pozycję scrolla.
 */
export default function BarberScrollCards({ barbers }: BarberScrollCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 95%", "center 55%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  const leftX = useTransform(smoothProgress, [0, 1], ["-45%", "0%"]);
  const rightX = useTransform(smoothProgress, [0, 1], ["45%", "0%"]);
  const cardOpacity = useTransform(smoothProgress, [0, 0.6], [0.2, 1]);

  if (!barbers || barbers.length === 0) {
    return (
      <div className="col-span-1 md:col-span-2 text-center text-on-surface-variant text-sm italic py-12">
        Brak zarejestrowanych barberów. Sprawdź bazę danych.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="px-8 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-8">
      {barbers.map((barber, index) => {
        const isLeft = index % 2 === 0;

        return (
          <motion.div
            key={barber.id}
            style={
              mounted
                ? {
                    x: isLeft ? leftX : rightX,
                    opacity: cardOpacity,
                  }
                : undefined
            }
            className="group relative bg-surface-container overflow-hidden rounded-xl border border-outline-variant/10 will-change-transform"
          >
            <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
              <Image
                src={barber.imageUrl || "/images/placeholder.webp"}
                alt={`Barber ${barber.name}`}
                width={500}
                height={650}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto object-contain translate-y-22.5 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold">{barber.name}</h3>
                  <p className="text-primary font-label text-xs tracking-widest uppercase mt-1">{barber.role}</p>
                </div>
              </div>
              <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">{barber.bio}</p>
              <Link
                href={`/portfolio/${barber.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block w-full text-center py-3 rounded-lg border border-primary/20 text-primary font-headline font-bold text-xs tracking-widest hover:bg-primary hover:text-on-primary transition-all"
              >
                ZOBACZ PORTFOLIO
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
